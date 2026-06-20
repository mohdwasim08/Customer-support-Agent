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
        description="Whether the query is related to shipping (e.g. rates, tracking, delivery, returns)."
    )


# 1. Save user query to state, because START outputs content, and we want to pass the raw string query
def save_query(node_input: types.Content) -> Event:
    query_text = ""
    # Safe check if node_input is a Content object and has parts
    if hasattr(node_input, "parts") and node_input.parts:
        query_text = "".join(part.text for part in node_input.parts if part.text)
    elif isinstance(node_input, str):
        query_text = node_input
    elif isinstance(node_input, dict):
        query_text = node_input.get("text", "") or node_input.get("query", "")

    # Store query in state and return it as the node's output for downstream processing
    return Event(
        output=query_text, actions=EventActions(state_delta={"user_query": query_text})
    )


# 2. Classifier agent (LlmAgent) to classify the query. Must use mode="single_turn".
classifier_agent = LlmAgent(
    name="classifier_agent",
    model=Gemini(
        model="gemini-flash-latest",
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
        "You are a classifier. Analyze the user query. Determine if the query is related to "
        "shipping, tracking, delivery, rates, or returns. Return is_shipping_related=True if it is, "
        "and is_shipping_related=False if it is completely unrelated."
    ),
    output_schema=Classification,
    mode="single_turn",
)


# 3. Routing node to route based on the classification and pass the original query forward
def route_query(ctx: Context, node_input: Classification) -> Event:
    # Get the original user query from the state
    user_query = ctx.state.get("user_query", "")

    if node_input.is_shipping_related:
        return Event(output=user_query, actions=EventActions(route="related"))
    else:
        return Event(output=user_query, actions=EventActions(route="unrelated"))


# 4. Shipping FAQ Agent (LlmAgent) to answer shipping questions. Must use mode="single_turn".
faq_agent = LlmAgent(
    name="faq_agent",
    model=Gemini(
        model="gemini-flash-latest",
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
        "You are a customer support representative for a shipping company. "
        "Answer the user's query about shipping (rates, tracking, delivery, or returns) "
        "clearly, politely, and concisely."
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


# Define the Workflow graph using the correct tuple routing mapping syntax
root_agent = Workflow(
    name="customer_support_workflow",
    edges=[
        (START, save_query),
        (save_query, classifier_agent),
        (classifier_agent, route_query),
        (route_query, {"related": faq_agent, "unrelated": decline_node}),
    ],
)

app = App(
    root_agent=root_agent,
    name="app",
)
