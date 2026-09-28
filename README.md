# NOVA AI Chatbot

NOVA is a full-stack AI chatbot application built with a **Python Flask backend** and a **React + Vite frontend**. The app is deployed on **Render** and uses **Groq API** for AI inference—no local setup required!

**Live Demo:** https://ai-chatbot-nova-1.onrender.com

---

## 🚀 Quick Start (Cloud Deployment)

NOVA is already deployed and live. Just visit the link above and start chatting!

No installation needed. The app runs entirely in the cloud with:
- **Frontend**: Deployed on Render (React + Vite)
- **Backend**: Deployed on Render (Flask + Gunicorn)
- **AI Model**: Groq API (fast, free tier available)

---

## 📁 Project Structure

```
AI-CHATBOT-PROJECT/
├── BACKEND/
│   ├── pythonserver.py       # Flask server with /chat endpoint
│   ├── chatbot.py            # Chat logic (optional)
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Docker build for backend
│   └── .dockerignore         # Docker ignore rules
├── FRONTEND/
│   ├── src/
│   │   ├── App.jsx           # Main chat UI
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Styles
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.js        # Vite configuration
│   ├── Dockerfile            # Docker build for frontend
│   ├── nginx.conf            # Nginx reverse proxy config
│   └── index.html            # HTML entry point
├── docker-compose.yml        # Local Docker orchestration
├── README.md                 # This file
├── LICENSE                   # License
└── .env.example              # Environment template
```

---

## 🏗️ Architecture

### Cloud Deployment (Render)
```
User Browser
    ↓
[Frontend on Render] → 192.168.56.1:3000
    ↓ (VITE_API_URL)
[Backend on Render] → 192.168.56.1:5000
    ↓ (GROQ_API_KEY)
[Groq API] → AI Response
```

### Local Docker Deployment (Optional)
```
User Browser (localhost:3000)
    ↓
[Frontend Container - Nginx] → Port 80→3000
    ↓ (Reverse Proxy)
[Backend Container - Flask] → Port 5000
    ↓ (OLLAMA_URL)
[Local Ollama] → AI Response
```

---

## 🛠️ Tech Stack

### Backend
- **Python 3.11+**
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin requests
- **Gunicorn** - Production server
- **Requests** - HTTP client
- **python-dotenv** - Environment variables

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** (optional) - Styling

### Deployment
- **Render** - Cloud hosting (Backend + Frontend)
- **Groq API** - AI inference
- **Docker** - Containerization
- **Nginx** - Reverse proxy

---

## ⚙️ Environment Variables

### Backend (Groq API)
```env
# Required for cloud deployment
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=mixtral-8x7b-32768

# Optional (defaults shown)
PORT=5000
HOST=0.0.0.0
```

### Frontend
```env
# Backend API URL (leave empty for local /chat proxy)
VITE_API_URL=https://ai-chatbot-nova.onrender.com

# Optional (for local development)
# VITE_API_URL=http://localhost:5000
```

### Local Development (Ollama)
```env
OLLAMA_URL=http://127.0.0.1:11434/api/chat
OLLAMA_MODEL=llama3.2
```

---

## 🐳 Local Development with Docker

### Prerequisites
- [Docker Desktop](https://docs.docker.com/get-docker/)
- [Ollama](https://ollama.ai/) installed on host machine
- Model pulled: `ollama pull llama3.2`

### Run Locally
```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Stop everything
docker compose down
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 🚀 Cloud Deployment on Render

### Backend Setup
1. Create new **Web Service** on Render
2. Connect GitHub repository
3. **Root Directory:** `BACKEND`
4. **Build Command:** `pip install -r requirements.txt`
5. **Start Command:** `gunicorn -w 4 -b 0.0.0.0:$PORT pythonserver:app`
6. **Environment Variables:**
   ```
   GROQ_API_KEY=your_key_here
   GROQ_MODEL=mixtral-8x7b-32768
   PORT=5000
   ```
7. Deploy ✅

### Frontend Setup
1. Create new **Web Service** on Render
2. Connect same GitHub repository
3. **Root Directory:** `FRONTEND`
4. **Build Command:** `npm install && npm run build`
5. **Start Command:** `npm run preview`
6. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
7. Deploy ✅

---

## 💬 How It Works

```
1. User types message in browser
   ↓
2. Frontend sends POST /chat request with messages
   ↓
3. Backend receives request and validates
   ↓
4. Backend calls Groq API with system prompt + messages
   ↓
5. Groq returns AI-generated response
   ↓
6. Backend returns reply to frontend
   ↓
7. Frontend displays response in chat UI
```

---

## 🔧 Manual Setup (No Docker)

### Local Development

#### 1. Install dependencies

**Backend:**
```bash
cd BACKEND
pip install -r requirements.txt
```

**Frontend:**
```bash
cd FRONTEND
npm install
```

#### 2. Create environment files

**`BACKEND/.env`:**
```env
OLLAMA_URL=http://127.0.0.1:11434/api/chat
OLLAMA_MODEL=llama3.2
PORT=5000
```

Or for Groq API:
```env
GROQ_API_KEY=your_key
GROQ_MODEL=mixtral-8x7b-32768
PORT=5000
```

#### 3. Start Ollama (if using local model)
```bash
ollama serve
```

#### 4. Run backend
```bash
cd BACKEND
python pythonserver.py
```

Backend runs on: **http://localhost:5000**

#### 5. Run frontend (new terminal)
```bash
cd FRONTEND
npm run dev
```

Frontend runs on: **http://localhost:5173**

#### 6. Open browser
Visit: **http://localhost:5173**

---

## 🔑 Getting API Keys

### Groq API (Free)
1. Go to https://console.groq.com
2. Sign up (free)
3. Navigate to "API Keys"
4. Create new API key
5. Copy and paste into `GROQ_API_KEY` environment variable

### Hugging Face (Alternative)
1. Go to https://huggingface.co/settings/tokens
2. Create new token (free tier)
3. Use in backend configuration

---

## 🐛 Troubleshooting

### "GROQ_API_KEY not configured"
- ✅ Check Render environment variables
- ✅ Verify key is correct at https://console.groq.com
- ✅ Redeploy backend after adding key

### "Ollama is not running"
- Run: `ollama serve`
- Ensure port 11434 is open

### "Model not found"
- Run: `ollama pull llama3.2`
- Or switch to Groq API (recommended)

### CORS errors
- ✅ Backend has CORS enabled
- ✅ Frontend uses correct `VITE_API_URL`
- ✅ Check deployment domain matches config

### Frontend won't load
- ✅ Check Render frontend deployment status
- ✅ Verify `VITE_API_URL` is set correctly
- ✅ Check browser console for errors

---

## 📊 Deployed Services

| Service | Status | URL |
| :--- | :--- | :--- |
| Frontend | ✅ Live | https://ai-chatbot-nova-1.onrender.com |
| Backend | ✅ Live | https://ai-chatbot-nova.onrender.com |
| AI Provider | Groq API | https://console.groq.com |

---

## 📝 License

This project is licensed under the MIT License. See `LICENSE` file for details.

---

## 🤝 Contributing

Feel free to fork, modify, and extend this project. It's a great starting point for building AI-powered applications!

---

## 💡 Future Enhancements

- [ ] User authentication
- [ ] Chat history persistence
- [ ] Multiple AI model support
- [ ] Voice input/output
- [ ] Dark mode UI
- [ ] Kubernetes deployment
- [ ] Advanced analytics

---

## 📞 Support

For issues or questions:
1. Check the **Troubleshooting** section above
2. Review deployment logs on Render
3. Verify environment variables
4. Check Groq API status at https://status.groq.com

---

**Happy chatting with NOVA! 🚀**
