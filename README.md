# NOVA AI Chatbot

NOVA is a full-stack AI chatbot project built with a Python Flask backend and a React + Vite frontend. The app sends chat requests to a local Ollama model, so you can run it without any paid API key or external cloud service.

## Project overview

This project includes:

- A Python backend that handles chat requests and calls the local LLM through Ollama
- A modern React frontend for the chat interface
- Local AI model support using Ollama
- Simple, lightweight architecture for learning and customization

## What is included in this project

### Backend
Location: `BACKEND/`

Files:
- `BACKEND/pythonserver.py` - Flask server with `/chat` endpoint
- `BACKEND/chatbot.py` - chatbot logic and predefined response dictionary
- `BACKEND/requirements.txt` - Python dependencies

The backend does the following:
- loads environment variables from `BACKEND/.env`
- validates incoming chat messages
- sends the conversation to Ollama
- returns the model reply to the frontend

### Frontend
Location: `FRONTEND/`

Files:
- `FRONTEND/src/App.jsx` - main chat UI and message handling
- `FRONTEND/src/main.jsx` - app entry point
- `FRONTEND/src/index.css` - base styling
- `FRONTEND/package.json` - frontend scripts and dependencies

The frontend does the following:
- displays chat messages
- collects user input
- sends requests to the local Flask backend
- renders AI responses in the browser

### Root files
- `README.md` - project documentation
- `requirements.txt` - root environment dependencies
- `.venv/` - local virtual environment (created for project setup)

## Tech stack

- Python 3
- Flask
- Flask-CORS
- React
- Vite
- Ollama
- dotenv

## AI model used

This project uses Ollama as the local AI runtime.

Default model:
- `llama3.2`

The backend is configured with:
- `OLLAMA_URL=http://127.0.0.1:11434/api/chat`
- `OLLAMA_MODEL=llama3.2`

You can switch models by editing `BACKEND/.env` and setting a different value for `OLLAMA_MODEL`.

Example:

```env
OLLAMA_URL=http://127.0.0.1:11434/api/chat
OLLAMA_MODEL=llama3.2
```

If you want to use another installed model, run:

```powershell
ollama list
```

Then update:

```powershell
$env:OLLAMA_MODEL="your-model-name"
```

or create a `.env` file in the `BACKEND` folder with the new model.

## Prerequisites

Before running the project, install:

- Python 3.10+
- Node.js and npm
- Ollama

## Step-by-step setup

### 1. Install Ollama

Download and install Ollama from:
https://ollama.com/download

### 2. Pull the model

Open PowerShell and run:

```powershell
ollama pull llama3.2
```

This downloads the default model used by the project.

### 3. Create or activate the virtual environment

From the project root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 4. Install backend dependencies

```powershell
cd BACKEND
pip install -r requirements.txt
```

### 5. Create the environment file for the backend

Inside `BACKEND/`, create a file named `.env` if it does not already exist.

Example content:

```env
OLLAMA_URL=http://127.0.0.1:11434/api/chat
OLLAMA_MODEL=llama3.2
```

### 6. Start the backend server

In PowerShell:

```powershell
cd BACKEND
..\.venv\Scripts\python.exe pythonserver.py
```

The backend starts on:

- http://127.0.0.1:5000

### 7. Start the frontend

Open a second terminal and run:

```powershell
cd FRONTEND
npm install
npm run dev -- --host 0.0.0.0
```

The frontend runs on:


- http://localhost:5173/

### 8. Open the app in a browser

Visit:

```text
http://localhost:5173/
```

## Deployment

This project can be deployed in several ways depending on your goal and hosting budget.

### Option 1: Local development deployment

This is the default setup for the project.

- Run Ollama locally.
- Start the backend on the machine where the Flask app is running.
- Run the frontend with Vite.
- Access the app from `http://localhost:5173/`.

This is the easiest option for testing, learning, and local development.

### Option 2: Single-server production deployment

Use one VPS or physical server to host both the frontend and backend.

1. Install Python, Node.js, and Ollama on the server.
2. Pull the AI model:

```bash
ollama pull llama3.2
```

3. Start the backend:

```bash
cd BACKEND
pip install -r requirements.txt
python pythonserver.py
```

4. Build the frontend:

```bash
cd FRONTEND
npm install
npm run build
```

5. Serve the built frontend with a web server such as Nginx or a Node/Vite preview server.
6. Point the frontend to the backend URL in your app configuration.

This is a good option if you want full control and low hosting cost.

### Option 3: Frontend on static hosting + backend on a server

Split the deployment into two parts:

- Frontend: deploy to Vercel, Netlify, GitHub Pages, or Cloudflare Pages
- Backend: deploy to Render, Railway, Fly.io, DigitalOcean, Azure App Service, or a VPS

In this setup:

- the frontend is a static React app
- the backend remains a Python Flask service
- the frontend calls the backend API at a public URL such as:

```text
https://your-backend-domain.com/chat
```

Important: the deployed backend must still be able to reach an Ollama instance. If the backend is not on the same machine as Ollama, make sure the Ollama server is reachable from the deployed environment.

### Option 4: Cloud deployment with managed hosting

Common providers for this app:

- Render
- Railway
- Fly.io
- DigitalOcean App Platform
- Azure App Service
- AWS Elastic Beanstalk
- Heroku (older projects)

Typical steps:

1. Push the project to GitHub.
2. Create a new app/service in your provider.
3. Configure build commands for the frontend and backend.
4. Set environment variables such as:

```env
OLLAMA_URL=http://127.0.0.1:11434/api/chat
OLLAMA_MODEL=llama3.2
```

5. Start the backend process and deploy the frontend build.

This is the most practical option for a production-ready public app.

### Option 5: Docker deployment

You can also deploy with Docker containers.

Typical Docker setup:

- One container for the Flask backend
- One container for the frontend
- One container for Ollama

This works well if you want a portable deployment across machines or cloud providers.

Example architecture:

```text
Browser -> Frontend container -> Backend container -> Ollama container
```

### Option 6: Self-hosted environment with reverse proxy

For a production environment, you can run the app behind Nginx or Caddy:

- Frontend served on port 80 or 443
- Backend served on a private/internal port or subdomain
- Reverse proxy used to route traffic to the correct service

This is a common production setup for company or personal deployments.

### Recommended production workflow

For a robust public deployment:

1. Keep the backend as a Python Flask service.
2. Build the frontend with Vite.
3. Serve the frontend from a static host or CDN.
4. Deploy the backend on a server that can access Ollama.
5. Use environment variables for model and API URL settings.
6. Add a reverse proxy or TLS certificate for HTTPS.

### Production example commands

Backend:

```bash
cd BACKEND
pip install -r requirements.txt
gunicorn pythonserver:app --bind 0.0.0.0:5000
```

Frontend:

```bash
cd FRONTEND
npm install
npm run build
npm run preview -- --host 0.0.0.0
```

### Deployment notes

- This project currently depends on Ollama, so the model must be installed and accessible in the deployment environment.
- If the backend is running on a remote server, make sure the Ollama service is reachable over the network.
- Update the backend `.env` file or cloud environment variables to match the actual deployment URL and model name.
- The frontend should send requests to the backend domain, not to `localhost`, when deployed outside of a local machine.

## How the app works

1. The user types a message in the React chat UI.
2. The frontend sends the message to the Flask backend at `/chat`.
3. The backend validates the request.
4. The backend sends the conversation to Ollama using the configured model.
5. Ollama responds with generated text.
6. The backend sends the answer back to the frontend.
7. The UI displays the AI response.

## Files and folder structure

```text
AI-CHATBOT-PROJECT/
├── BACKEND/
│   ├── chatbot.py
│   ├── pythonserver.py
│   ├── requirements.txt
│   └── .env
├── FRONTEND/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── README.md
├── README.md
├── requirements.txt
├── .venv/
└── LICENSE
```

## Important notes

- The project uses local inference through Ollama, so no Anthropic or OpenAI API key is required.
- If Ollama is not running, the backend will return an error telling you to start it.
- If the selected model is missing, install it using `ollama pull <model-name>`.
- The app is designed as a local learning project and can be extended with more features.

## Common troubleshooting

### Ollama not running

Start it from the terminal:

```powershell
ollama serve
```

### Model not found

```powershell
ollama pull llama3.2
```

### Backend cannot connect to Ollama

Check that the `.env` file is correct:

```env
OLLAMA_URL=http://127.0.0.1:11434/api/chat
OLLAMA_MODEL=llama3.2
```

### Port issues

If port 5000 or 5173 is busy, stop the existing process or change the app configuration before restarting.

## Summary

This project is a simple AI chatbot app using:

- Flask backend
- React frontend
- Ollama local LLM
- Default model: `llama3.2`

It is a clean example of how to build a local AI chatbot without depending on a paid external model provider.

## Quick start

```powershell
# 1. Install Ollama and pull model
ollama pull llama3.2

# 2. Start backend
cd BACKEND
pip install -r requirements.txt
..\.venv\Scripts\python.exe pythonserver.py

# 3. Start frontend in another terminal
cd FRONTEND
npm install
npm run dev -- --host 0.0.0.0
```

Then open:

```text
http://localhost:5173/
```