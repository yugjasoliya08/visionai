<div align="center">

![VisionAI Banner](frontend/public/banner.png)
<br/>

# ⚡ VisionAI Workspace ⚡
**The Ultimate Real-Time Code Collaboration Engine**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![WebSockets](https://img.shields.io/badge/WebSockets-000000?style=for-the-badge&logo=socket.io&logoColor=white)](#)
[![Gemini](https://img.shields.io/badge/Gemini_2.5-4285F4?style=for-the-badge&logo=google&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)

*Transform the way your team writes, debugs, and ships code.*

<br />
</div>

## 🌌 The Vision
Code editors shouldn't be lonely. **VisionAI** bridges the gap between local development and cloud collaboration. By merging the powerful syntax engine of **VS Code (Monaco)** with lightning-fast **WebSockets**, VisionAI delivers a zero-latency, multi-player coding experience. 

But we didn't stop there. We embedded **Google Gemini 2.5 Flash** directly into the core, acting as an omnipresent AI pair-programmer that can write, analyze, and explain code for your entire team in real-time.

<br />

## 🔥 Unrivaled Features

### 🚀 Zero-Latency Collaboration
> *Operational Transformation (OT) ensures you never experience a merge conflict again.*
- **Live Cursors & Presence**: See exactly who is typing and where.
- **Instant Synchronization**: All file creations, deletions, and code changes broadcast globally in milliseconds.

### 🧠 Gemini AI Pair-Programmer
> *Your 10x developer companion, built right into the interface.*
- **Context-Aware Autocomplete**: Press `Tab` to let Gemini finish your complex algorithms.
- **Deep Explanations**: Highlight any confusing block of code and ask the AI to explain it in plain English.
- **Floating Chat Panel**: Strategize architectures and debug stack traces with AI while your team watches.

### 💻 Live Remote Execution Environment
> *Stop switching windows. Run your code in the cloud.*
- **Polyglot Execution**: Instantly compile and run **Python**, **C++**, **Java**, and **Shell**.
- **Integrated Terminal**: A sleek, fully functional command-line interface directly in your browser.
- **Sandboxed Security**: Code is executed safely on the backend and streamed back to the frontend.

<br />

## 📐 System Architecture

<div align="center">

| Layer | Stack | Function |
| :--- | :--- | :--- |
| **🎨 Client Interface** | `React` • `Vite` • `Monaco` | Ultra-fast, glassmorphic UI optimized for 60fps rendering. |
| **⚙️ API Gateway** | `Python 3.11` • `FastAPI` | High-throughput asynchronous request handling. |
| **⚡ Real-Time Engine**| `WebSockets` • `Redis` | Low-latency message brokering for operational transformation. |
| **🗄️ Persistence** | `PostgreSQL` • `SQLAlchemy` | Secure, version-controlled history of all documents. |

</div>

<br />

## 🚀 Quick Start Guide

Ready to host your own collaborative workspace? 

### 1. The Backend
```bash
git clone https://github.com/yugjasoliya08/visionai.git
cd visionai/backend

# Initialize Virtual Environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```
**Configure `.env`**
```env
DATABASE_URL="postgresql://user:pass@localhost/db"
GEMINI_API_KEY="your_api_key"
```
**Ignite the Server**
```bash
uvicorn app.main:app --reload --port 8000
```

### 2. The Frontend
```bash
cd ../frontend
npm install
```
**Configure `.env`**
```env
VITE_API_BASE_URL="http://localhost:8000"
```
**Launch**
```bash
npm run dev
```

<br />

## ☁️ Production Deployment

Deploying VisionAI is incredibly straightforward:

1. **Frontend (Vercel)**: Simply import the `frontend` folder into Vercel using the Vite preset. Add your `VITE_API_BASE_URL`.
2. **Backend (Render)**: Import the root repository into Render using the provided `render.yaml` Blueprint. Render will automatically spin up your Redis instance and FastAPI server. Just attach a PostgreSQL database!

<br />

---
<div align="center">
  <p><b>Designed and Engineered by Yug Jasoliya</b></p>
  <a href="https://github.com/yugjasoliya08/visionai/issues">Report Bug</a>
  <span> · </span>
  <a href="https://github.com/yugjasoliya08/visionai/issues">Request Feature</a>
</div>
