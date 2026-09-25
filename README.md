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