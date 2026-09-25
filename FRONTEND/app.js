import React, { useState, useEffect, useRef } from "react";
import "./app.css";;

function App() {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("chatHistory");
    return savedMessages
      ? JSON.parse(savedMessages)
      : [{ text: "Hello 👋 I am your AI assistant.", sender: "bot" }];
  });
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const chatEndRef = useRef(null);

  // Save chat history
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage = { text: input, sender: "user" };
  setMessages((prev) => [...prev, userMessage]);

  const userInput = input;
  setInput("");

  try {
    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userInput }),
    });

    const data = await response.json();

    const botMessage = {
      text: data.reply,
      sender: "bot",
    };

    setMessages((prev) => [...prev, botMessage]);

  } catch (error) {
    console.error("Error:", error);
  }
};

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <div className="chat-container">
        
        <div className="header">
          <h2>AI Chatbot</h2>
          <button
            className="toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <div className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        <div className="input-area">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend}>Send</button>
        </div>

      </div>
    </div>
  );
}

export default App;