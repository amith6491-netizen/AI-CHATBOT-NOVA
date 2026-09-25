from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request as UrlRequest, urlopen
from dotenv import load_dotenv

# Load environment variables from the backend directory regardless of cwd.
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this backend

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434/api/chat")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

SYSTEM_PROMPT = """You are NOVA, an advanced AI assistant. 
You are intelligent, witty, and helpful. 
Keep responses concise and conversational unless the user asks for detailed explanations."""

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "NOVA backend is running ✅"})

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()

        if not data or not isinstance(data.get("messages"), list) or not data["messages"]:
            return jsonify({"error": "No messages provided"}), 400

        messages = data["messages"][-20:]
        if any(
            not isinstance(message, dict)
            or message.get("role") not in {"user", "assistant"}
            or not isinstance(message.get("content"), str)
            or not message["content"].strip()
            for message in messages
        ):
            return jsonify({"error": "Messages must contain user or assistant roles and non-empty content."}), 400

        payload = json.dumps({
            "model": OLLAMA_MODEL,
            "stream": False,
            "messages": [{"role": "system", "content": SYSTEM_PROMPT}, *messages],
            "options": {"num_predict": 1000},
        }).encode("utf-8")
        ollama_request = UrlRequest(
            OLLAMA_URL,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urlopen(ollama_request, timeout=120) as response:
            result = json.loads(response.read().decode("utf-8"))

        reply = result.get("message", {}).get("content", "").strip()
        if not reply:
            return jsonify({"error": "The local model returned an empty response."}), 502
        return jsonify({"reply": reply})

    except HTTPError as error:
        if error.code == 404:
            return jsonify({"error": f"Ollama model '{OLLAMA_MODEL}' is not installed. Run: ollama pull {OLLAMA_MODEL}"}), 503
        return jsonify({"error": "Ollama rejected the request. Check that the selected model is installed."}), 502
    except URLError:
        return jsonify({"error": "Ollama is not running. Start Ollama, then try again."}), 503
    except (json.JSONDecodeError, KeyError):
        return jsonify({"error": "Ollama returned an invalid response."}), 502
    except Exception:
        app.logger.exception("Unexpected chat provider error")
        return jsonify({"error": "The AI service is temporarily unavailable. Please try again."}), 500


if __name__ == "__main__":
    print("🚀 NOVA backend starting on http://localhost:5000")
    app.run(debug=True, port=5000)