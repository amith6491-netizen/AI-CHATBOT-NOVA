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
    return jsonify({
        "status": "NOVA backend is running ✅",
        "model": GROQ_MODEL,
        "api_configured": bool(GROQ_API_KEY)
    })

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
        
        # Validate messages
        for message in messages:
            if not isinstance(message, dict):
                return jsonify({"error": "Each message must be an object"}), 400
            if message.get("role") not in {"user", "assistant"}:
                return jsonify({"error": f"Invalid role: {message.get('role')}"}), 400
            if not isinstance(message.get("content"), str):
                return jsonify({"error": "Message content must be a string"}), 400
            if not message.get("content", "").strip():
                return jsonify({"error": "Message content cannot be empty"}), 400

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

        # Log request for debugging
        print(f"📤 Sending to Groq: Model={GROQ_MODEL}, Messages={len(messages)}")

        # Call Groq API
        response = requests.post(GROQ_API_URL, json=payload, headers=headers, timeout=30)
        
        # Check response status
        if response.status_code != 200:
            error_text = response.text
            print(f"❌ Groq error ({response.status_code}): {error_text}")
            return jsonify({
                "error": f"Groq API error: {response.status_code}",
                "details": error_text[:200]
            }), 503

        result = response.json()
        reply = result.get("choices", [{}])[0].get("message", {}).get("content", "").strip()

        if not reply:
            return jsonify({"error": "Groq returned an empty response"}), 502

        print(f"✅ Groq response received: {len(reply)} chars")
        return jsonify({"reply": reply})

    except requests.exceptions.Timeout:
        return jsonify({"error": "Groq API request timed out. Please try again."}), 504
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {str(e)}")
        return jsonify({"error": f"API request failed: {str(e)[:100]}"}), 503
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        app.logger.exception("Unexpected error")
        return jsonify({"error": "The AI service is temporarily unavailable. Please try again."}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"🚀 NOVA backend starting on http://{host}:{port}")
    print(f"📋 Model: {GROQ_MODEL}")
    print(f"🔑 API Key: {'✓ Configured' if GROQ_API_KEY else '✗ Not set'}")
    app.run(host=host, port=port)
