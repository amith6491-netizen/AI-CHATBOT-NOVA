import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are NOVA, an advanced AI assistant. You are intelligent, witty, and helpful. Keep responses concise and conversational unless the user asks for detailed explanations.`;

function TypingIndicator() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "6px",
      padding: "14px 18px", background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(99,202,183,0.15)", borderRadius: "18px 18px 18px 4px",
      width: "fit-content", backdropFilter: "blur(12px)",
    }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#63CAB7",
          animation: "bounce 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: "16px",
      animation: "fadeSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
    }}>
      {!isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg, #63CAB7, #3B8FD4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginRight: 10, flexShrink: 0, marginTop: 4,
          boxShadow: "0 0 16px rgba(99,202,183,0.35)",
          fontSize: 14, fontWeight: 700, color: "#0A0F1E",
          fontFamily: "'Syne', sans-serif",
        }}>N</div>
      )}
      <div style={{
        maxWidth: "72%",
        padding: "13px 18px",
        background: isUser
          ? "linear-gradient(135deg, #3B8FD4, #2A6CB8)"
          : "rgba(255,255,255,0.04)",
        border: isUser
          ? "1px solid rgba(59,143,212,0.4)"
          : "1px solid rgba(99,202,183,0.12)",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        backdropFilter: "blur(12px)",
        boxShadow: isUser
          ? "0 4px 20px rgba(59,143,212,0.25)"
          : "0 4px 20px rgba(0,0,0,0.2)",
      }}>
        <p style={{
          margin: 0,
          color: isUser ? "#fff" : "#CBD5E8",
          fontSize: 14.5,
          lineHeight: 1.65,
          fontFamily: "'DM Sans', sans-serif",
          whiteSpace: "pre-wrap",
        }}>{msg.content}</p>
      </div>
      {isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg, #3B8FD4, #1a4fa0)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginLeft: 10, flexShrink: 0, marginTop: 4,
          fontSize: 13, color: "#fff",
          fontFamily: "'Syne', sans-serif", fontWeight: 700,
        }}>U</div>
      )}
    </div>
  );
}

export default function AIChatbot() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm NOVA, your AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "The backend could not process the request.");
      }
      const reply = data.reply || "Sorry, I couldn't get a response.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      setError(error.message || "Connection error. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = ["What can you do?", "Tell me a fun fact 🎲", "Help me brainstorm ideas", "Explain quantum physics simply"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.1); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-30px, 20px) scale(0.9); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        textarea::-webkit-scrollbar { display: none; }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: rgba(99,202,183,0.2); border-radius: 2px; }

        .send-btn:hover { transform: scale(1.05); background: linear-gradient(135deg, #7DD4C6, #5BAAE0) !important; }
        .send-btn:active { transform: scale(0.97); }
        .suggestion-chip:hover { background: rgba(99,202,183,0.12) !important; border-color: rgba(99,202,183,0.4) !important; transform: translateY(-1px); }
        .clear-btn:hover { color: #ef4444 !important; }
      `}</style>

      <div style={{
        minHeight: "100vh", width: "100%",
        background: "#080D1A",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background Orbs */}
        <div style={{
          position: "absolute", top: "10%", left: "5%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,202,183,0.08) 0%, transparent 70%)",
          animation: "orb1 8s ease-in-out infinite", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "5%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,143,212,0.08) 0%, transparent 70%)",
          animation: "orb2 10s ease-in-out infinite", pointerEvents: "none",
        }} />
        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.025,
          backgroundImage: "linear-gradient(rgba(99,202,183,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,202,183,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px", pointerEvents: "none",
        }} />

        {/* Chat Container */}
        <div style={{
          width: "100%", maxWidth: 760,
          height: "92vh", maxHeight: 800,
          display: "flex", flexDirection: "column",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(99,202,183,0.12)",
          borderRadius: 24,
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.6), 0 0 80px rgba(99,202,183,0.04)",
          margin: "0 16px",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(255,255,255,0.02)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "14px",
                background: "linear-gradient(135deg, #63CAB7 0%, #3B8FD4 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 800,
                color: "#0A0F1E",
                fontFamily: "'Syne', sans-serif",
                boxShadow: "0 0 24px rgba(99,202,183,0.4)",
              }}>N</div>
              <div>
                <div style={{
                  fontSize: 18, fontWeight: 700, color: "#F0F6FF",
                  fontFamily: "'Syne', sans-serif", letterSpacing: "-0.3px",
                }}>NOVA</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#63CAB7",
                    animation: "pulse 2s ease-in-out infinite",
                    boxShadow: "0 0 6px #63CAB7",
                  }} />
                  <span style={{ fontSize: 12, color: "#63CAB7", fontWeight: 500 }}>Online · AI Assistant</span>
                </div>
              </div>
            </div>
            <button
              className="clear-btn"
              onClick={() => setMessages([{ role: "assistant", content: "Hello! I'm NOVA, your AI assistant. How can I help you today?" }])}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "8px 14px", cursor: "pointer",
                color: "#8899B4", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                transition: "color 0.2s",
              }}
            >Clear chat</button>
          </div>

          {/* Messages */}
          <div className="messages-area" style={{
            flex: 1, overflowY: "auto",
            padding: "24px 20px",
            display: "flex", flexDirection: "column",
          }}>
            {messages.length === 1 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: "#4A5878", fontSize: 12, marginBottom: 12, textAlign: "center", textTransform: "uppercase", letterSpacing: "1px" }}>Try asking</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {suggestions.map(s => (
                    <button key={s} className="suggestion-chip"
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      style={{
                        background: "rgba(99,202,183,0.06)", border: "1px solid rgba(99,202,183,0.2)",
                        borderRadius: 20, padding: "8px 16px", cursor: "pointer",
                        color: "#8BBDCF", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.2s",
                      }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, animation: "fadeSlideIn 0.3s both" }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "linear-gradient(135deg, #63CAB7, #3B8FD4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "#0A0F1E",
                  fontFamily: "'Syne', sans-serif",
                  boxShadow: "0 0 16px rgba(99,202,183,0.35)", flexShrink: 0,
                }}>N</div>
                <TypingIndicator />
              </div>
            )}
            {error && (
              <div style={{
                textAlign: "center", color: "#f87171", fontSize: 13,
                padding: "10px 16px", background: "rgba(239,68,68,0.08)",
                borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)",
                marginBottom: 12,
              }}>{error}</div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: "16px 20px 20px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(0,0,0,0.15)",
          }}>
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(99,202,183,0.15)",
              borderRadius: 16, padding: "12px 14px",
              transition: "border-color 0.2s",
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Message NOVA..."
                rows={1}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "#CBD5E8", fontSize: 14.5, resize: "none",
                  fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6,
                  maxHeight: 120, overflow: "auto",
                  caretColor: "#63CAB7",
                }}
                onInput={e => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{
                  width: 40, height: 40, borderRadius: 12, border: "none",
                  background: input.trim() && !loading
                    ? "linear-gradient(135deg, #63CAB7, #3B8FD4)"
                    : "rgba(255,255,255,0.06)",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.2s",
                  boxShadow: input.trim() && !loading ? "0 0 20px rgba(99,202,183,0.3)" : "none",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke={input.trim() && !loading ? "#0A0F1E" : "#3A4A6B"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim() && !loading ? "#0A0F1E" : "#3A4A6B"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p style={{ textAlign: "center", color: "#2E3D58", fontSize: 11, marginTop: 10, letterSpacing: "0.3px" }}>
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </>
  );
}