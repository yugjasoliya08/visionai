<div align="center">

<img src="https://raw.githubusercontent.com/yugjasoliya08/visionai/main/frontend/public/favicon.ico" alt="Logo" width="100" />

# ✨ VisionAI ✨
**The Next-Generation Collaborative Code Editor**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![WebSockets](https://img.shields.io/badge/WebSockets-000000?style=for-the-badge&logo=socket.io&logoColor=white)](#)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](#)

*Code together, execute instantly, and build faster with AI.*

<br />
</div>

## 🌌 Overview

**VisionAI** is a premium, highly aesthetic, real-time collaborative code editor built for the modern developer. It combines the power of operational transformation (OT) for seamless simultaneous typing, an integrated terminal for live remote execution, and the intelligence of **Google Gemini 2.5 Flash** for instant code analysis and generation.

Whether you're pair programming, conducting technical interviews, or just hacking together a script, VisionAI provides a world-class, frictionless environment directly in your browser.

<br />

## 🚀 Key Features

### ⚡ Real-Time Engine
> Powered by robust WebSockets and Operational Transformation.
- **Flawless Collaboration**: Multiple users typing simultaneously with zero latency or merge conflicts.
- **Live Presence Indicator**: See exactly who is online, typing, or currently in your workspace.
- **Instant File Sync**: Create, delete, and share files instantly across all connected clients.

### 🧠 Gemini AI Assistant
> Your personal pair-programmer built right into the dashboard.
- **Intelligent Autocomplete**: Hit `Tab` to seamlessly inject AI-generated code suggestions based on your context.
- **Explain My Code**: Select any function and let Gemini break down the logic in simple terms.
- **Interactive Chat**: A dedicated AI side-panel to ask architectural questions, debug errors, and brainstorm.

### 💻 Live Remote Execution
> Run code without ever leaving your browser.
- **Multi-Language Support**: Execute **Python**, **C++**, **Java**, and **Shell** scripts instantly.
- **Live Terminal**: A sleek, VS Code-inspired terminal capturing raw output and errors.
- **Secure Backend Engine**: Sandboxed execution managed effortlessly via FastAPI.

<br />

## 🛠 Architectural Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React.js (Vite) + Vanilla CSS | A hyper-fast, glassmorphic UI optimized for speed. |
| **Editor Engine** | Monaco Editor | The core engine powering VS Code, providing native syntax highlighting. |
| **Backend API** | Python 3.11 + FastAPI | Async handling of HTTP requests, authentication, and database routing. |
| **Realtime Sync** | WebSockets + Redis | Handles all high-frequency operational transformation events. |
| **Database** | PostgreSQL + SQLAlchemy | Securely persists document histories, users, and snapshots. |

<br />

## 🖥 Getting Started

### 1. Clone & Prepare
```bash
git clone https://github.com/yugjasoliya08/visionai.git
cd visionai
```

### 2. Launch the Backend
> Requires Python 3.11+
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```
**Environment Variables (`backend/.env`)**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/visionai_db"
SECRET_KEY="generate_a_random_hex_string"
GEMINI_API_KEY="your_google_gemini_api_key"
```
**Run Server**
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Launch the Frontend
> Requires Node.js 18+
```bash
cd frontend
npm install
```
**Environment Variables (`frontend/.env`)**
```env
VITE_API_BASE_URL="http://localhost:8000"
```
**Run App**
```bash
npm run dev
```
Navigate to `http://localhost:5173` to experience VisionAI.

<br />

## ☁️ Deployment

VisionAI is architected for a split-deployment model for maximum efficiency on free tiers.
- **Frontend ➔ Vercel**: Import the `frontend` directory and deploy using the Vite preset.
- **Backend ➔ Render**: Import the repository and let the included `render.yaml` Blueprint automatically provision your FastAPI backend and Redis instance.

<br />

---
<div align="center">
  <p><b>Built with passion and pixel-perfect precision by Yug Jasoliya</b></p>
  <a href="https://github.com/yugjasoliya08/visionai/issues">Report Bug</a>
  <span> · </span>
  <a href="https://github.com/yugjasoliya08/visionai/issues">Request Feature</a>
</div>
