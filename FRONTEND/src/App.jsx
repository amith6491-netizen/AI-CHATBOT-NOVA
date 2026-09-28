import { useState, useRef, useEffect } from "react";
import { useChatStore } from "./store";
import Sidebar from "./ChatGPTSidebar";

function TypingIndicator({ isDark }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "6px",
      padding: "14px 18px", 
      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
      border: isDark ? "1px solid rgba(99,202,183,0.15)" : "1px solid rgba(99,202,183,0.3)",
      borderRadius: "18px 18px 18px 4px",
      width: "fit-content", 
      backdropFilter: "blur(12px)",
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

function Message({ msg, isDark }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: "16px",
      animation: "fadeSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
      maxWidth: "100%",
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
        maxWidth: "calc(100% - 50px)",
        padding: "13px 18px",
        background: isUser
          ? "linear-gradient(135deg, #3B8FD4, #2A6CB8)"
          : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
        border: isUser
          ? "1px solid rgba(59,143,212,0.4)"
          : isDark ? "1px solid rgba(99,202,183,0.12)" : "1px solid rgba(99,202,183,0.3)",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        backdropFilter: "blur(12px)",
        boxShadow: isUser
          ? "0 4px 20px rgba(59,143,212,0.25)"
          : "0 4px 20px rgba(0,0,0,0.2)",
        wordBreak: "break-word",
      }}>
        <p style={{
          margin: 0,
          color: isUser ? "#fff" : isDark ? "#CBD5E8" : "#1f2937",
          fontSize: "14.5px",
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
  const { messages, addMessage, clearChat, theme, setTheme } = useChatStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);

    const userMsg = { role: "user", content: text };
    addMessage(userMsg);
    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ""
        ? import.meta.env.VITE_API_URL
        : (typeof window !== "undefined" && window.location.port === "5173" ? "http://localhost:5000" : "");
      
      const response = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "The backend could not process the request.");
      }
      const reply = data.reply || "Sorry, I couldn't get a response.";
      addMessage({ role: "assistant", content: reply });
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

        body { margin: 0; padding: 0; }
        textarea::-webkit-scrollbar { display: none; }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: rgba(99,202,183,0.2); border-radius: 2px; }

        .send-btn:hover { transform: scale(1.05); background: linear-gradient(135deg, #7DD4C6, #5BAAE0) !important; }
        .send-btn:active { transform: scale(0.97); }
        .suggestion-chip:hover { background: rgba(99,202,183,0.12) !important; border-color: rgba(99,202,183,0.4) !important; transform: translateY(-1px); }

        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>

      <div style={{
        display: "flex",
        height: "100vh",
        background: isDark ? "#080D1A" : "#f5f5f5",
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden",
      }}>
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isDark={isDark} />

        {/* Main Chat Area */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: isDark ? "#080D1A" : "#ffffff",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Background Orbs */}
          {isDark && (
            <>
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
            </>
          )}

          {/* Header */}
          <div style={{
            padding: "16px",
            borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #e5e5e5",
            background: isDark ? "rgba(255,255,255,0.02)" : "#ffffff",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            zIndex: 10,
            flexWrap: "wrap",
            gap: "8px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: "200px" }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: isDark ? "#CBD5E8" : "#1f2937",
                  display: window.innerWidth <= 768 ? "block" : "none",
                }}
              >
                ☰
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "12px",
                  background: "linear-gradient(135deg, #63CAB7 0%, #3B8FD4 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800,
                  color: "#0A0F1E",
                  fontFamily: "'Syne', sans-serif",
                  boxShadow: "0 0 24px rgba(99,202,183,0.4)",
                }}>N</div>
                <div>
                  <div style={{
                    fontSize: 16, fontWeight: 700, color: isDark ? "#F0F6FF" : "#1f2937",
                    fontFamily: "'Syne', sans-serif",
                  }}>NOVA</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#63CAB7",
                      animation: "pulse 2s ease-in-out infinite",
                      boxShadow: "0 0 6px #63CAB7",
                    }} />
                    <span style={{ fontSize: 11, color: "#63CAB7", fontWeight: 500 }}>Online</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => clearChat()}
              style={{
                background: isDark ? "rgba(255,255,255,0.04)" : "#f0f0f0",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e5e5e5",
                borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                color: isDark ? "#8899B4" : "#6b7280", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}
            >Clear</button>
          </div>

          {/* Messages */}
          <div className="messages-area" ref={chatRef} style={{
            flex: 1, overflowY: "auto",
            padding: "20px 16px",
            display: "flex", flexDirection: "column",
            zIndex: 5,
            background: isDark ? "transparent" : "#ffffff",
          }}>
            {messages.length === 0 && (
              <div style={{ marginBottom: 24, textAlign: "center" }}>
                <p style={{ color: isDark ? "#4A5878" : "#9ca3af", fontSize: 12, marginBottom: 12, textTransform: "uppercase", letterSpacing: "1px" }}>Try asking</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: "400px", margin: "0 auto" }}>
                  {suggestions.map(s => (
                    <button key={s}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      style={{
                        background: isDark ? "rgba(99,202,183,0.06)" : "rgba(99,202,183,0.1)",
                        border: isDark ? "1px solid rgba(99,202,183,0.2)" : "1px solid rgba(99,202,183,0.3)",
                        borderRadius: 16, padding: "8px 12px", cursor: "pointer",
                        color: isDark ? "#8BBDCF" : "#10A37F", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.2s",
                      }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => <Message key={i} msg={msg} isDark={isDark} />)}
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
                <TypingIndicator isDark={isDark} />
              </div>
            )}
            {error && (
              <div style={{
                textAlign: "center", color: "#f87171", fontSize: 13,
                padding: "10px 16px", background: isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.1)",
                borderRadius: 10, border: isDark ? "1px solid rgba(239,68,68,0.2)" : "1px solid #fca5a5",
                marginBottom: 12,
              }}>{error}</div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: "12px 16px 16px",
            borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #e5e5e5",
            background: isDark ? "rgba(0,0,0,0.15)" : "#f9fafb",
            zIndex: 10,
          }}>
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 10,
              background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
              border: isDark ? "1px solid rgba(99,202,183,0.15)" : "1px solid #e5e5e5",
              borderRadius: 12, padding: "10px 12px",
              transition: "border-color 0.2s",
              maxWidth: "100%",
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
                  color: isDark ? "#CBD5E8" : "#1f2937", fontSize: 14, resize: "none",
                  fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
                  maxHeight: 100, overflow: "auto",
                  caretColor: "#63CAB7",
                }}
                onInput={e => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                }}
              />
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: "none",
                  background: input.trim() && !loading
                    ? "linear-gradient(135deg, #63CAB7, #3B8FD4)"
                    : isDark ? "rgba(255,255,255,0.06)" : "#f0f0f0",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.2s",
                  boxShadow: input.trim() && !loading ? "0 0 20px rgba(99,202,183,0.3)" : "none",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke={input.trim() && !loading ? "#0A0F1E" : "#999"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim() && !loading ? "#0A0F1E" : "#999"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p style={{ textAlign: "center", color: isDark ? "#2E3D58" : "#9ca3af", fontSize: 10, marginTop: 8, letterSpacing: "0.3px" }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
