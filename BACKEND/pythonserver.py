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

        ollama_url = os.getenv("OLLAMA_URL", OLLAMA_URL)
        ollama_model = os.getenv("OLLAMA_MODEL", OLLAMA_MODEL)

        payload = json.dumps({
            "model": ollama_model,
            "stream": False,
            "messages": [{"role": "system", "content": SYSTEM_PROMPT}, *messages],
            "options": {"num_predict": 1000},
        }).encode("utf-8")

        headers = {"Content-Type": "application/json"}
        api_key = os.getenv("OLLAMA_API_KEY")
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        ollama_request = UrlRequest(
            ollama_url,
            data=payload,
            headers=headers,
            method="POST",
        )
        with urlopen(ollama_request, timeout=120) as response:
            result = json.loads(response.read().decode("utf-8"))

        reply = result.get("message", {}).get("content", "").strip()
        if not reply:
            return jsonify({"error": "The local model returned an empty response."}), 502
        return jsonify({"reply": reply})

    except HTTPError as error:
        current_model = os.getenv("OLLAMA_MODEL", OLLAMA_MODEL)
        if error.code == 404:
            return jsonify({"error": f"Ollama model '{current_model}' is not installed. Run: ollama pull {current_model}"}), 503
        return jsonify({"error": "Ollama rejected the request. Check that the selected model is installed."}), 502
    except URLError:
        return jsonify({"error": "Ollama is not running. Start Ollama, then try again."}), 503
    except (json.JSONDecodeError, KeyError):
        return jsonify({"error": "Ollama returned an invalid response."}), 502
    except Exception:
        app.logger.exception("Unexpected chat provider error")
        return jsonify({"error": "The AI service is temporarily unavailable. Please try again."}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"🚀 NOVA backend starting on http://{host}:{port}")
    app.run(host=host, port=port)