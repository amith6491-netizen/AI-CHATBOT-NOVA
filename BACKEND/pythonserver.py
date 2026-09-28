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

# Hugging Face API Configuration
HF_API_KEY = os.getenv("HF_API_KEY")
HF_MODEL = os.getenv("HF_MODEL", "meta-llama/Llama-2-7b-chat-hf")
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"

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
        if not HF_API_KEY:
            return jsonify({"error": "HF_API_KEY not configured"}), 500

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

        # Format conversation for Hugging Face
        conversation = f"{SYSTEM_PROMPT}\n\n"
        for msg in messages:
            role = "User" if msg["role"] == "user" else "Assistant"
            conversation += f"{role}: {msg['content']}\n"
        conversation += "Assistant: "

        payload = {
            "inputs": conversation,
            "parameters": {
                "max_new_tokens": 500,
                "temperature": 0.7
            }
        }

        headers = {
            "Authorization": f"Bearer {HF_API_KEY}"
        }

        # Call Hugging Face API
        response = requests.post(HF_API_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()

        result = response.json()
        
        # Extract reply
        if isinstance(result, list) and len(result) > 0:
            reply = result[0].get("generated_text", "").strip()
            # Remove the prompt from the response
            if "Assistant: " in reply:
                reply = reply.split("Assistant: ")[-1].strip()
        else:
            reply = ""

        if not reply:
            return jsonify({"error": "AI returned an empty response"}), 502

        return jsonify({"reply": reply})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"AI API error: {str(e)}"}), 503
    except Exception as e:
        app.logger.exception("Unexpected error")
        return jsonify({"error": "The AI service is temporarily unavailable. Please try again."}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"🚀 NOVA backend starting on http://{host}:{port}")
    app.run(host=host, port=port)
