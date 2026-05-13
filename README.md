<div align="center">
  <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/react/react.png" alt="React" width="60" />
  <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/fastapi/fastapi.png" alt="FastAPI" width="60" />
  <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/python/python.png" alt="Python" width="60" />
  <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/postgresql/postgresql.png" alt="PostgreSQL" width="60" />
</div>

<h1 align="center">VisionAI - Real-Time Collaborative Code Editor</h1>

<p align="center">
  <strong>A premium, real-time collaborative coding platform powered by AI.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#installation">Installation</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## ⚡ Features

* **Real-Time Collaboration**: Code simultaneously with your team using WebSockets and Operational Transformation (OT) for instant synchronization.
* **Integrated Code Execution**: Run Python, C++, Java, and Shell scripts directly in the browser with secure backend execution.
* **AI-Powered Assistance**: Integrated with **Gemini 2.5 Flash** for inline code suggestions, error explanations, and an interactive AI coding chat.
* **Live Terminal & File System**: Manage multiple files, create directories, and view code execution outputs in a sleek, integrated terminal.
* **Multi-User Chat**: Built-in group chat for seamless communication while pair programming.
* **Authentication & Version Control**: Secure JWT authentication and automated document versioning to save and restore code history.
* **Dark/Light Mode**: Beautiful glassmorphic UI with customizable themes and fonts.

## 🛠 Tech Stack

**Frontend**
* React.js (Vite)
* Monaco Editor (VS Code Engine)
* Vanilla CSS (Custom Glassmorphism Design System)

**Backend**
* Python 3.11 & FastAPI
* WebSockets (Real-time Sync)
* SQLAlchemy (ORM) & PostgreSQL
* Redis (Message Broker)
* Google Gemini API (AI Integration)

## 🚀 Installation (Local Development)

### Prerequisites
* Python 3.11+
* Node.js 18+
* PostgreSQL

### 1. Clone the repository
```bash
git clone https://github.com/yugjasoliya08/visionai.git
cd visionai
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/visionai_db"
SECRET_KEY="your_super_secret_key"
GEMINI_API_KEY="your_google_gemini_api_key"
```

Start the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL="http://localhost:8000"
```

Start the development server:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser!

## 🌍 Deployment

VisionAI is configured for easy deployment across serverless and PaaS providers.

* **Frontend**: Optimized for [Vercel](https://vercel.com). Simply import the repository, select `Vite` as the framework, and set your `VITE_API_BASE_URL`.
* **Backend**: Configured for [Render](https://render.com). Connect the repository, deploy via the included `render.yaml` Blueprint, and provide your PostgreSQL database URL.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](https://github.com/yugjasoliya08/visionai/issues) if you want to contribute.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).

---
*Built with ❤️ by Yug Jasoliya*
