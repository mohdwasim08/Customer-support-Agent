# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import logging
import os

import google.auth
from fastapi import FastAPI
from google.adk.cli.fast_api import get_fast_api_app
from google.auth.exceptions import DefaultCredentialsError
from google.cloud import logging as google_cloud_logging

from app.app_utils.telemetry import setup_telemetry
from app.app_utils.typing import Feedback

setup_telemetry()


def _has_google_credentials() -> bool:
    """Return whether ADC credentials are available for cloud integrations."""
    try:
        google.auth.default()
        return True
    except DefaultCredentialsError:
        return False


use_cloud_telemetry = _has_google_credentials()

logger = logging.getLogger(__name__)
try:
    logging_client = google_cloud_logging.Client()
    logger = logging_client.logger(__name__)
except Exception:
    logger = logging.getLogger(__name__)

_allow_origins_env = os.getenv("ALLOW_ORIGINS", "")
allow_origins = (
    [o.strip() for o in _allow_origins_env.split(",") if o.strip()]
    if _allow_origins_env.strip()
    else ["*"]  # Default: allow all origins (safe for hackathon/demo deployments)
)

# Artifact bucket for ADK (created by Terraform, passed via env var)
logs_bucket_name = os.environ.get("LOGS_BUCKET_NAME")

AGENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# In-memory session configuration - no persistent storage
session_service_uri = None

artifact_service_uri = f"gs://{logs_bucket_name}" if logs_bucket_name else None

app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    web=False,
    artifact_service_uri=artifact_service_uri,
    allow_origins=allow_origins,
    session_service_uri=session_service_uri,
    otel_to_cloud=use_cloud_telemetry,
)
app.title = "CarePilot AI"
app.description = "API for interacting with the CarePilot AI Customer Care Agent"


@app.get("/health")
def health_check() -> dict[str, str]:
    """Health check endpoint for container healthchecks."""
    return {"status": "healthy"}


@app.post("/feedback")
def collect_feedback(feedback: Feedback) -> dict[str, str]:
    """Collect and log feedback.

    Args:
        feedback: The feedback data to log

    Returns:
        Success message
    """
    payload = feedback.model_dump()
    log_struct = getattr(logger, "log_struct", None)
    if log_struct is not None:
        log_struct(payload, severity="INFO")
    else:
        logger.info("Feedback received: %s", payload)
    return {"status": "success"}


# ─── Serve Frontend Static Files & SPA Routing ────────────────────────────────
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.join(AGENT_DIR, "frontend", "dist")
if os.path.exists(frontend_dist):
    # Mount assets folder for static files
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    # Catch-all route to serve index.html and root static assets
    @app.get("/{catchall:path}")
    async def serve_frontend(catchall: str):
        # Exclude API endpoints and dev UI
        if catchall.startswith(("apps", "run_sse", "health", "feedback", "dev-ui", "list-apps", "version")):
            return None

        # Check if requested file exists in root of dist (e.g. favicon.svg, avatar-circle.jpg)
        file_path = os.path.join(frontend_dist, catchall)
        if os.path.isfile(file_path):
            return FileResponse(file_path)

        # Fallback to index.html for SPA routes (e.g. /chat, /tracking)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)


# Main execution
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
