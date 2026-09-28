from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://ai-chatbot-nova-1.onrender.com",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

# Groq API Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """You are NOVA, an advanced AI assistant. 
You are intelligent, witty, and helpful. 
Keep responses concise and conversational unless the user asks for detailed explanations."""

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "NOVA backend is running ✅"})

@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return {}, 200
    
    try:
        if not GROQ_API_KEY:
            return jsonify({"error": "GROQ_API_KEY not configured"}), 500

        data = request.get_json(silent=True)

        if not data or not isinstance(data.get("messages"), list) or not data["messages"]:
            return jsonify({"error": "No messages provided or invalid JSON"}), 400

        messages = data["messages"][-20:]
        if any(
            not isinstance(message, dict)
            or message.get("role") not in {"user", "assistant"}
            or not isinstance(message.get("content"), str)
            or not message["content"].strip()
            for message in messages
        ):
            return jsonify({"error": "Messages must contain user or assistant roles and non-empty content."}), 400

        # Prepare request for Groq
        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                *messages
            ],
            "max_tokens": 1000,
            "temperature": 0.7
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GROQ_API_KEY}"
        }

        # Call Groq API
        response = requests.post(GROQ_API_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()

        result = response.json()
        reply = result.get("choices", [{}])[0].get("message", {}).get("content", "").strip()

        if not reply:
            return jsonify({"error": "Groq returned an empty response"}), 502

        return jsonify({"reply": reply})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Groq API error: {str(e)}"}), 503
    except Exception as e:
        app.logger.exception("Unexpected error")
        return jsonify({"error": "The AI service is temporarily unavailable. Please try again."}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"🚀 NOVA backend starting on http://{host}:{port}")
    app.run(host=host, port=port)
