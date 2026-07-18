# ─── CarePilot AI — Production Backend Dockerfile ────────────────────────────
# Deployed to Railway / Google Cloud Run
# Base: python:3.11-slim | Package manager: uv | Server: uvicorn

FROM python:3.11-slim

# ─── Environment ──────────────────────────────────────────────────────────────
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080 \
    # Prevents uv from creating virtual envs inside the container
    UV_SYSTEM_PYTHON=1

# ─── System dependencies ───────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ─── Install uv (fast Python package manager) ─────────────────────────────────
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# ─── Working directory ────────────────────────────────────────────────────────
WORKDIR /app

# ─── Dependencies (cached layer) ──────────────────────────────────────────────
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# ─── Application code ────────────────────────────────────────────────────────
COPY app/ ./app/
COPY agents-cli-manifest.yaml ./

# ─── Expose port ──────────────────────────────────────────────────────────────
EXPOSE 8080

# ─── Health check ─────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# ─── Start server ─────────────────────────────────────────────────────────────
# Uses $PORT env var — Railway and Cloud Run both inject this automatically
CMD ["sh", "-c", "uv run uvicorn app.fast_api_app:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1"]
