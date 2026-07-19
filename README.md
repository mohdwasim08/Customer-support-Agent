# CarePilot AI

## Project Overview
CarePilot AI is a customer support application that provides automated assistance for ecommerce queries. It handles common user requests such as order status checks, shipping policy questions, and returns processing. The application is built as a single monolithic service that hosts both the frontend user interface and the backend processing server.

## Features
- Interactive support chat interface.
- Real-time order status tracking lookup.
- Guided returns and refund submission form.
- Categorized shipping information and FAQ section.
- Automatic guardrails to reject off-topic developer requests.

## How It Works
1. The user interacts with the React interface.
2. User queries are sent to a FastAPI endpoint, which routes the request to a classification model.
3. If the query is related to shipping or customer service, it is forwarded to the main FAQ agent. If it is unrelated, a polite rejection is returned.
4. The system streams the response back to the client using Server-Sent Events (SSE) for a smooth typing effect.
5. In production, the FastAPI server mounts the compiled React frontend `dist/` directory, allowing both services to run on a single host.

## Tech Stack
- Frontend: React 19, Vite 8, Tailwind CSS, Lucide React
- Backend: Python 3.11, FastAPI, Uvicorn
- AI Engine: Google Agent Development Kit (ADK), Gemini API (AI Studio)
- Packaging: Docker, uv

## Project Structure
```
customer-support-agent/
├── app/                        # Backend code
│   ├── agent.py                # Agent workflow definition
│   ├── fast_api_app.py         # FastAPI application setup
│   └── app_utils/              # Helpers for telemetry and types
├── frontend/                   # Frontend codebase
│   ├── src/                    # React components
│   ├── vite.config.js          # Development proxy and build settings
│   └── public/                 # Static assets
└── Dockerfile                  # Multi-stage Docker configuration
```

## Installation
Ensure you have Python 3.11+, Node.js 20+, and the `uv` package manager installed.

1. Clone the repository:
   ```bash
   git clone https://github.com/mohdwasim08/Customer-support-Agent.git
   cd Customer-support-Agent
   ```
2. Configure the environment variables by copying `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Set your Google AI Studio API key in `.env`:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key
   GOOGLE_GENAI_USE_VERTEXAI=False
   ```
4. Install backend dependencies and set up the virtual environment:
   ```bash
   uv sync
   ```
5. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

## Running the Project
1. Start the backend development server:
   ```bash
   uv run uvicorn app.fast_api_app:app --host 127.0.0.1 --port 8080 --reload
   ```
2. In a separate terminal, start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
3. Open your browser and navigate to the address shown in the frontend terminal (typically `http://localhost:5173`).

## Deployment
The project is configured for monolithic deployment on Render using the included multi-stage Dockerfile.

1. Create a new **Web Service** on Render and connect this repository.
2. Select **Docker** as the runtime environment.
3. Choose the **Free** instance type.
4. Add the following environment variables in the Render settings panel:
   - `GOOGLE_API_KEY` = Your Gemini API Key from Google AI Studio.
   - `GOOGLE_GENAI_USE_VERTEXAI` = `False`
5. Click **Create Web Service**. Render will automatically build the React assets and deploy the FastAPI container.

## Live Demo
The live project is hosted at the following URL:
[https://customer-support-agent-ke0n.onrender.com](https://customer-support-agent-ke0n.onrender.com)

## Future Improvements
- Add persistent database storage for session history.
- Integrate with shipping provider APIs (like FedEx, UPS, or USPS) for real-time tracking data.
- Support ticket escalation to human agents via custom webhooks.
- Support voice-to-text input directly in the chat interface.

## License
This project is licensed under the Apache License 2.0.
