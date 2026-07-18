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

"""Unit tests for the customer-support-agent workflow routing logic.

These tests mock the LLM at the generate_content_async level and assert
that the graph correctly routes queries to the faq_agent (shipping) or
decline_node (unrelated), without making real API calls.
"""

from unittest.mock import patch

import pytest
from google.adk.models.llm_response import LlmResponse
from google.adk.runners import InMemoryRunner
from google.genai import types

from app.agent import app


def _make_llm_response(text: str) -> LlmResponse:
    """Build a minimal LlmResponse with a model-role text content."""
    return LlmResponse(
        content=types.Content(
            role="model",
            parts=[types.Part.from_text(text=text)],
        )
    )


async def _async_gen(*responses):
    """Async generator that yields a sequence of LlmResponse objects."""
    for r in responses:
        yield r


@pytest.mark.asyncio
async def test_shipping_query_routes_to_faq_agent():
    """Shipping-related query must route to faq_agent and return an answer."""

    # classifier returns is_shipping_related=true
    classifier_response = _make_llm_response('{"is_shipping_related": true}')
    # faq_agent returns a shipping answer
    faq_response = _make_llm_response(
        "Tracking is free with every shipment! You can monitor it on our portal."
    )

    call_count = 0

    async def mock_generate_content_async(self, llm_request, stream=False):
        nonlocal call_count
        call_count += 1
        # First call: classifier_agent; second call: faq_agent
        resp = classifier_response if call_count == 1 else faq_response
        yield resp

    with patch(
        "google.adk.models.google_llm.Gemini.generate_content_async",
        new=mock_generate_content_async,
    ):
        runner = InMemoryRunner(app=app)
        session = await runner.session_service.create_session(
            app_name="app", user_id="user_shipping"
        )
        events = []
        async for event in runner.run_async(
            user_id="user_shipping",
            session_id=session.id,
            new_message=types.Content(
                role="user",
                parts=[types.Part.from_text(text="How do I track my shipment?")],
            ),
        ):
            events.append(event)

    # Both classifier AND faq_agent should have been called
    assert call_count == 2, f"Expected 2 LLM calls, got {call_count}"

    # The faq_agent event should carry the answer text
    faq_events = [e for e in events if e.author == "faq_agent"]
    assert faq_events, "Expected at least one event from faq_agent"
    faq_text = "".join(
        p.text
        for e in faq_events
        if e.content and e.content.parts
        for p in e.content.parts
        if p.text
    )
    assert "free with every shipment" in faq_text, f"Unexpected faq text: {faq_text}"


@pytest.mark.asyncio
async def test_unrelated_query_routes_to_decline():
    """Unrelated query must route to decline_node — not call faq_agent."""

    # classifier returns is_shipping_related=false
    classifier_response = _make_llm_response('{"is_shipping_related": false}')

    call_count = 0

    async def mock_generate_content_async(self, llm_request, stream=False):
        nonlocal call_count
        call_count += 1
        yield classifier_response

    with patch(
        "google.adk.models.google_llm.Gemini.generate_content_async",
        new=mock_generate_content_async,
    ):
        runner = InMemoryRunner(app=app)
        session = await runner.session_service.create_session(
            app_name="app", user_id="user_unrelated"
        )
        events = []
        async for event in runner.run_async(
            user_id="user_unrelated",
            session_id=session.id,
            new_message=types.Content(
                role="user",
                parts=[types.Part.from_text(text="Write me a poem about stars.")],
            ),
        ):
            events.append(event)

    # Only the classifier should have been called (faq_agent is skipped)
    assert call_count == 1, f"Expected 1 LLM call, got {call_count}"

    # decline_node emits output with the polite decline message
    decline_events = [e for e in events if e.node_info.name == "decline_node"]
    assert decline_events, "Expected at least one event from decline_node"
    decline_output = decline_events[0].output
    assert decline_output is not None
    assert "only answer questions related to shipping" in decline_output
