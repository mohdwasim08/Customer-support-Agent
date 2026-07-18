# CarePilot AI 🤖

**AI-powered Customer Support Agent** built with Google ADK, FastAPI, and React/Vite.

> Hackathon submission by **Mohammad Wasim** — Founder & AI Developer  
> 📧 mohdwasim.tech@gmail.com

---

## ✨ Features

- 💬 **Live AI Chat** — Powered by Google Gemini via ADK
- 📦 **Order Tracking** — Real-time order status lookup
- 🔄 **Returns & Refunds** — Guided return process
- ❓ **FAQ** — Instant answers to common questions
- 🎭 **Demo Mode** — Works without backend for showcasing

---

## 🏗️ Architecture

```
┌─────────────────────┐        ┌──────────────────────────────┐
│   React / Vite      │  HTTP  │  FastAPI + Google ADK        │
│   Frontend          │───────▶│  Backend                     │
│   (Vercel)          │        │  (Railway / Cloud Run)       │
└─────────────────────┘        └──────────────────────────────┘
```

| Layer | Tech | Deployment |
|---|---|---|
| Frontend | React 19 + Vite 8 + Tailwind CSS | Vercel |
| Backend | FastAPI + Google ADK + Uvicorn | Railway |
| AI Model | Google Gemini (via AI Studio API) | — |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.11+
- `uv` package manager (`pip install uv`)
- Google AI Studio API key → [aistudio.google.com](https://aistudio.google.com)

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd customer-support-agent
```

### 2. Configure Backend Environment

```bash
cp .env.example .env
# Edit .env and set your GOOGLE_API_KEY
```

### 3. Install Backend Dependencies

```bash
uv sync
```

### 4. Start Backend

```bash
agents-cli playground --host 0.0.0.0
# Runs on http://localhost:8080
```

### 5. Install & Start Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 6. Open App

Visit **http://localhost:5173** in your browser.

---

## 🌍 Production Deployment

### Step 1 — Deploy Backend to Railway

1. **Create a Railway account** → [railway.app](https://railway.app)

2. **Create a new project** → "Deploy from GitHub repo"

3. **Select your repository** (root directory, not `frontend/`)

4. **Set environment variables** in Railway dashboard:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   GOOGLE_GENAI_USE_VERTEXAI=False
   ALLOW_ORIGINS=https://your-app.vercel.app
   PORT=8080
   ```

5. **Railway auto-detects** `railway.json` and builds with `Dockerfile`

6. **Copy your Railway URL** → e.g. `https://carepilot-api.railway.app`

---

### Step 2 — Deploy Frontend to Vercel

1. **Create a Vercel account** → [vercel.com](https://vercel.com)

2. **Import your GitHub repository**

3. **Configure project settings**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Framework Preset**: Vite

4. **Set environment variables** in Vercel dashboard:
   ```
   VITE_API_URL=https://carepilot-api.railway.app
   ```

5. **Deploy** → Vercel builds and gives you a URL like `https://carepilot-ai.vercel.app`

6. **Update ALLOW_ORIGINS** in Railway to match your Vercel URL

---

### Step 3 — Verify Deployment

After both deployments are live:

```bash
# Test backend health
curl https://carepilot-api.railway.app/health

# Test backend API list
curl https://carepilot-api.railway.app/list-apps

# Open frontend
open https://carepilot-ai.vercel.app
```

---

## 🔧 Environment Variables Reference

### Backend (`.env` / Railway)

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_API_KEY` | ✅ Yes | Google AI Studio API key |
| `GOOGLE_GENAI_USE_VERTEXAI` | ✅ Yes | Set to `False` for AI Studio |
| `ALLOW_ORIGINS` | ⚠️ Recommended | Comma-separated frontend URLs |
| `PORT` | Auto | Server port (Railway injects automatically) |
| `LOGS_BUCKET_NAME` | No | GCS bucket for logs (optional) |

### Frontend (`.env.production` / Vercel)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ Yes (production) | Backend deployment URL |

---

## 📱 Device Compatibility

| Platform | Status |
|---|---|
| Windows (Chrome, Firefox, Edge) | ✅ Supported |
| macOS (Safari, Chrome) | ✅ Supported |
| Android (Chrome) | ✅ Supported |
| iPhone / iPad (Safari) | ✅ Supported |
| Linux (any browser) | ✅ Supported |

---

## 🛠️ Local Tunnel for Testing (any device on same network)

```bash
# Start backend
agents-cli playground --host 0.0.0.0

# Start frontend
cd frontend && npm run dev

# Start public tunnel (access from phone/tablet)
ssh -R 80:localhost:5173 nokey@localhost.run
# Opens a public HTTPS URL like https://abc123.lhr.life
```

---

## 📁 Project Structure

```
customer-support-agent/
├── app/                        # Python backend (FastAPI + ADK)
│   ├── agent.py                # Main AI agent logic (DO NOT MODIFY)
│   ├── fast_api_app.py         # FastAPI app & CORS config
│   ├── agent_runtime_app.py    # Agent Runtime deployment
│   └── app_utils/              # Utilities (telemetry, typing)
├── frontend/                   # React/Vite frontend
│   ├── src/
│   │   └── App.jsx             # Main app component
│   ├── public/
│   │   └── avatar-circle.jpg   # CarePilot AI avatar
│   ├── vite.config.js          # Vite config (host + proxy + build)
│   └── vercel.json             # Vercel SPA routing config
├── Dockerfile                  # Backend container (Railway/Cloud Run)
├── railway.json                # Railway deployment config
├── pyproject.toml              # Python project metadata
├── .env.example                # Backend environment variables template
└── README.md                   # This file
```

---

## 🧑‍💻 Developer

**Mohammad Wasim**  
Founder & AI Developer  
📧 mohdwasim.tech@gmail.com

---

*Built with ❤️ using Google ADK, FastAPI, React, and Vite*
