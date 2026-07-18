# Copyright (c) 2026 MyCompany LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
from typing import Any

import google.auth
from dotenv import load_dotenv
from google.adk.agents import LlmAgent
from google.adk.agents.context import Context
from google.adk.apps import App
from google.adk.events.event import Event
from google.adk.events.event_actions import EventActions
from google.adk.models import Gemini
from google.adk.workflow import START, Workflow
from google.genai import types
from pydantic import BaseModel, Field

# Load environment variables from .env
load_dotenv()

# Setup environment
try:
    _, project_id = google.auth.default()
    if project_id:
        os.environ["GOOGLE_CLOUD_PROJECT"] = project_id
except Exception:
    pass

os.environ["GOOGLE_CLOUD_LOCATION"] = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = os.environ.get(
    "GOOGLE_GENAI_USE_VERTEXAI", "True"
)


# Pydantic models for structured output
class Classification(BaseModel):
    is_shipping_related: bool = Field(
        description="Whether the query is related to customer support (e.g. order tracking, shipping, delivery, returns, refunds, cancellations, FAQs, policies, complaints)."
    )


# 1. Save user query to state and format conversation history
def save_query(ctx: Context, node_input: types.Content) -> Event:
    query_text = ""
    # Safe check if node_input is a Content object and has parts
    if hasattr(node_input, "parts") and node_input.parts:
        query_text = "".join(part.text for part in node_input.parts if part.text)
    elif isinstance(node_input, str):
        query_text = node_input
    elif isinstance(node_input, dict):
        query_text = node_input.get("text", "") or node_input.get("query", "")

    # Retrieve existing history from state
    history = ctx.state.get("history", [])
    # Append user's new message
    history.append({"role": "user", "content": query_text})

    # Format history transcript for intent classification
    formatted_transcript = "Conversation history:\n"
    for turn in history[:-1]:
        role_label = "User" if turn["role"] == "user" else "Agent"
        formatted_transcript += f"{role_label}: {turn['content']}\n"
    formatted_transcript += f"\nCurrent User Query: {query_text}"

    return Event(
        output=formatted_transcript,
        actions=EventActions(
            state_delta={"user_query": query_text, "history": history}
        ),
    )


# 2. Classifier agent (LlmAgent) to classify the query. Must use mode="single_turn".
classifier_agent = LlmAgent(
    name="classifier_agent",
    model=Gemini(
        model="gemini-2.5-flash",
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
        "You are an intent classifier for CarePilot AI, a customer support agent. "
        "Analyze the user query and the conversation history. Determine if the query is related to "
        "customer support (e.g. order tracking, shipping, delivery, returns, refunds, cancellations, FAQs, policies, complaints). "
        "Note: If the user provides a tracking number, order ID, or basic confirmation (like replying with a number, 'yes', or 'no') "
        "in response to a previous agent question, this IS related to customer support. "
        "Return is_shipping_related=True if it is related to support, and is_shipping_related=False if it is completely unrelated (e.g. asking to write code, tell jokes, or off-topic general chat)."
    ),
    output_schema=Classification,
    mode="single_turn",
)


# 3. Routing node to route based on the classification and pass the original query forward
def route_query(ctx: Context, node_input: Classification) -> Event:
    user_query = ctx.state.get("user_query", "")
    history = ctx.state.get("history", [])

    # Format history transcript for the FAQ agent
    formatted_transcript = "Conversation history:\n"
    for turn in history:
        role_label = "User" if turn["role"] == "user" else "Agent"
        formatted_transcript += f"{role_label}: {turn['content']}\n"

    if node_input.is_shipping_related:
        return Event(output=formatted_transcript, actions=EventActions(route="related"))
    else:
        return Event(output=user_query, actions=EventActions(route="unrelated"))


# 4. Shipping FAQ Agent (LlmAgent) to answer shipping questions. Must use mode="single_turn".
faq_agent = LlmAgent(
    name="faq_agent",
    model=Gemini(
        model="gemini-2.5-flash",
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
        "You are CarePilot AI, a customer support representative. "
        "Answer the user's queries about shipping, order tracking, returns, refunds, cancellations, customer complaints, policies, and FAQs. "
        "You are given the full conversation history. Respond to the latest User message at the end of the history, using the preceding conversation context. "
        "Be extremely friendly, professional, concise, helpful, and human-like. Never sound robotic. "
        "Guidelines for mock actions:\n"
        "1. Order Tracking / Delivery Status: If the user provides a tracking number (e.g. 345678 or 12345) either in the latest message or earlier in the context, confirm it and state that the package is in transit and scheduled for delivery in 2 business days.\n"
        "2. Returns / Refund Requests: Explain that we offer a 30-day return policy for unused items. Process a mock refund if requested and tell them the credit will appear in 3-5 business days.\n"
        "3. Order Cancellation: Confirm cancellations if requested, noting it has been successfully cancelled.\n"
        "4. Shipping Info: Standard shipping is $4.99 (free for orders over $50) and takes 3-5 business days.\n"
        "5. Complaints: Empathize deeply with the customer, apologize, and offer to resolve it or escalate it to a human supervisor."
    ),
    mode="single_turn",
)


# 5. Polite decline node for unrelated queries
def decline_node(node_input: str) -> Event:
    decline_message = "I am sorry, but I can only answer questions related to shipping (such as rates, tracking, delivery, or returns)."
    return Event(
        content=types.Content(
            role="model", parts=[types.Part.from_text(text=decline_message)]
        ),
        output=decline_message,
    )


# 6. Save agent response to conversation history in session state
def save_agent_response(ctx: Context, node_input: Any) -> Event:
    response_text = ""
    if hasattr(node_input, "content") and node_input.content:
        content = node_input.content
        if hasattr(content, "parts") and content.parts:
            response_text = "".join(part.text for part in content.parts if part.text)
    elif isinstance(node_input, str):
        response_text = node_input

    # Retrieve existing history and append model response
    history = ctx.state.get("history", [])
    if response_text:
        history.append({"role": "model", "content": response_text})

    return Event(
        content=types.Content(
            role="model", parts=[types.Part.from_text(text=response_text)]
        ),
        output=response_text,
        actions=EventActions(state_delta={"history": history}),
    )


# Define the Workflow graph using the correct tuple routing mapping syntax
root_agent = Workflow(
    name="customer_support_workflow",
    edges=[
        (START, save_query),
        (save_query, classifier_agent),
        (classifier_agent, route_query),
        (route_query, {"related": faq_agent, "unrelated": decline_node}),
        (faq_agent, save_agent_response),
        (decline_node, save_agent_response),
    ],
)

app = App(
    root_agent=root_agent,
    name="app",
)

if os.environ.get("INTEGRATION_TEST") == "TRUE":
    from google.adk.models.google_llm import Gemini
    from google.adk.models.llm_response import LlmResponse

    original_generate_content_async = Gemini.generate_content_async

    async def mock_generate_content_async(self, llm_request, stream=False):
        prompt_text = ""
        try:
            if hasattr(llm_request, "contents"):
                contents = llm_request.contents
                if isinstance(contents, list):
                    for content in contents:
                        if hasattr(content, "parts") and content.parts:
                            for part in content.parts:
                                if hasattr(part, "text") and part.text:
                                    prompt_text += " " + part.text
            elif isinstance(llm_request, dict):
                contents = llm_request.get("contents", [])
                if isinstance(contents, list):
                    for content in contents:
                        if isinstance(content, dict):
                            parts = content.get("parts", [])
                            for part in parts:
                                if isinstance(part, dict) and "text" in part:
                                    prompt_text += " " + part["text"]
        except Exception:
            pass

        is_classifier = False
        try:
            if hasattr(llm_request, "config") and llm_request.config:
                system_instruction = getattr(
                    llm_request.config, "system_instruction", ""
                )
                if system_instruction:
                    instruction_str = ""
                    if (
                        hasattr(system_instruction, "parts")
                        and system_instruction.parts
                    ):
                        instruction_str = "".join(
                            p.text for p in system_instruction.parts if p.text
                        )
                    else:
                        instruction_str = str(system_instruction)
                    if (
                        "classifier" in instruction_str.lower()
                        or "determine if" in instruction_str.lower()
                    ):
                        is_classifier = True
        except Exception:
            pass

        if is_classifier:
            is_shipping = any(
                term in prompt_text.lower()
                for term in [
                    "ship",
                    "track",
                    "deliver",
                    "rate",
                    "return",
                    "package",
                    "order",
                    "refund",
                    "cancel",
                    "complaint",
                    "345678",
                    "12345",
                ]
            )
            response_text = (
                '{"is_shipping_related": true}'
                if is_shipping
                else '{"is_shipping_related": false}'
            )
            yield LlmResponse(
                content=types.Content(
                    role="model",
                    parts=[types.Part.from_text(text=response_text)],
                )
            )
        else:
            yield LlmResponse(
                content=types.Content(
                    role="model",
                    parts=[
                        types.Part.from_text(
                            text="This is a mock answer about shipping."
                        )
                    ],
                )
            )

    Gemini.generate_content_async = mock_generate_content_async
