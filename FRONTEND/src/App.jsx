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
  
  // Clean up markdown formatting but preserve table structure and content
  let cleanContent = msg.content
    .replace(/\\n/g, '\n')  // Convert escaped newlines
    .replace(/\\t/g, '  ')  // Convert escaped tabs
    .replace(/\\r/g, '')    // Remove carriage returns
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')  // Remove bold-italic but keep text
    .replace(/\*\*(.+?)\*\*/g, '$1')  // Remove bold but keep text
    .replace(/\*(.+?)\*/g, '$1')  // Remove italic but keep text
    .replace(/__(.+?)__/g, '$1')  // Remove bold underscores but keep text
    .replace(/_(.+?)_/g, '$1')  // Remove italic underscores but keep text
    .replace(/`(.+?)`/g, '$1')  // Remove backticks but keep code text
    .replace(/^#+\s+/gm, '')  // Remove header symbols but keep text
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1')  // Convert links to plain text
    .replace(/^-{3,}$/gm, '─────────')  // Convert markdown dividers to readable line
    .replace(/^(\s*)[-*]\s+/gm, '$1• ')  // Keep bullet points but clean up
    .trim();
  
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: "8px",
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
        maxWidth: "85%",
        padding: "10px 14px",
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
          wordBreak: "break-word",
        }}>{cleanContent}</p>
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
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
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

        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

        html, body, #root {
          height: 100%;
          height: 100dvh;
          width: 100%;
          overflow: hidden;
        }

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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        textarea::-webkit-scrollbar { display: none; }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: rgba(99,202,183,0.2); border-radius: 2px; }

        .send-btn:hover { transform: scale(1.05); background: linear-gradient(135deg, #7DD4C6, #5BAAE0) !important; }
        .send-btn:active { transform: scale(0.97); }
        .suggestion-chip:hover { background: rgba(99,202,183,0.12) !important; border-color: rgba(99,202,183,0.4) !important; transform: translateY(-1px); }

        .mobile-hamburger-btn {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-hamburger-btn {
            display: inline-flex !important;
          }
          .hide-on-mobile { display: none !important; }
        }
      `}</style>

      <div style={{
        display: "flex",
        height: "100%",
        height: "100dvh",
        width: "100%",
        background: isDark ? "#080D1A" : "#f5f5f5",
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden",
        position: "relative",
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
          height: "100%",
          width: "100%",
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

          {/* Header - Fixed at top center */}
          <div style={{
            padding: "12px 16px",
            borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #e5e5e5",
            background: isDark ? "rgba(8,13,26,0.92)" : "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            zIndex: 20,
            flexShrink: 0,
            position: "relative",
            width: "100%",
          }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <button
                className="mobile-hamburger-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6",
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "8px 11px",
                  cursor: "pointer",
                  fontSize: "18px",
                  lineHeight: 1,
                  color: isDark ? "#CBD5E8" : "#1f2937",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Toggle Menu"
              >
                ☰
              </button>
            </div>

            {/* Center Title */}
            <div style={{
              flex: 2,
              textAlign: "center",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "10px",
                background: "linear-gradient(135deg, #63CAB7 0%, #3B8FD4 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 800,
                color: "#0A0F1E",
                fontFamily: "'Syne', sans-serif",
                boxShadow: "0 0 18px rgba(99,202,183,0.35)",
              }}>N</div>
              <div style={{ textAlign: "left" }}>
                <div style={{
                  fontSize: 16, fontWeight: 700, color: isDark ? "#F0F6FF" : "#1f2937",
                  fontFamily: "'Syne', sans-serif", lineHeight: 1.1,
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

            {/* Right - Theme toggle & Clear Button */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6",
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
                  borderRadius: 8, padding: "7px 9px", cursor: "pointer",
                  fontSize: 13, lineHeight: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? "☀️" : "🌙"}
              </button>
              <button
                onClick={() => clearChat()}
                style={{
                  background: isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e5e7eb",
                  borderRadius: 8, padding: "7px 11px", cursor: "pointer",
                  color: isDark ? "#8899B4" : "#4b5563", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >Clear</button>
            </div>
          </div>

          {/* Messages Container - Centered */}
          <div className="messages-area" ref={chatRef} style={{
            flex: 1, overflowY: "auto",
            padding: "20px 16px",
            display: "flex", flexDirection: "column",
            zIndex: 5,
            background: isDark ? "transparent" : "#ffffff",
            alignItems: "center",
            width: "100%",
          }}>
            {/* Content wrapper - max width */}
            <div style={{
              width: "100%",
              maxWidth: "800px",
              display: "flex",
              flexDirection: "column",
            }}>
              {messages.length === 0 && (
                <div style={{ marginBottom: 24, textAlign: "center", width: "100%", paddingTop: "10px" }}>
                  <h2 style={{
                    fontSize: "26px",
                    fontWeight: "600",
                    color: isDark ? "#F0F6FF" : "#1f2937",
                    marginBottom: "8px",
                    fontFamily: "'Syne', sans-serif",
                  }}>Welcome to NOVA</h2>
                  <p style={{ color: isDark ? "#4A5878" : "#6b7280", fontSize: 14, marginBottom: 16 }}>Start a conversation with your AI assistant</p>
                  <p style={{ color: isDark ? "#4A5878" : "#9ca3af", fontSize: 11, marginBottom: 16, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Try asking</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: "420px", margin: "0 auto" }}>
                    {suggestions.map(s => (
                      <button key={s}
                        className="suggestion-chip"
                        onClick={() => { setInput(s); inputRef.current?.focus(); }}
                        style={{
                          background: isDark ? "rgba(99,202,183,0.06)" : "#f0fdf4",
                          border: isDark ? "1px solid rgba(99,202,183,0.2)" : "1px solid #bbf7d0",
                          borderRadius: 12, padding: "10px 12px", cursor: "pointer",
                          color: isDark ? "#8BBDCF" : "#0f766e", fontSize: 12.5, fontFamily: "'DM Sans', sans-serif",
                          transition: "all 0.2s",
                          lineHeight: 1.3,
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
          </div>

          {/* Input Area - Fixed at bottom */}
          <div style={{
            padding: "10px 16px 14px",
            borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #e5e5e5",
            background: isDark ? "rgba(8,13,26,0.92)" : "rgba(249,250,251,0.95)",
            backdropFilter: "blur(10px)",
            zIndex: 10,
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}>
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 8,
              background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
              border: isDark ? "1px solid rgba(99,202,183,0.18)" : "1px solid #d1d5db",
              borderRadius: 12, padding: "8px 12px",
              transition: "border-color 0.2s",
              maxWidth: "800px",
              width: "100%",
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
                  fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4,
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
                  width: 36, height: 36, borderRadius: 10,
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e5e7eb",
                  background: input.trim() && !loading
                    ? "linear-gradient(135deg, #63CAB7, #3B8FD4)"
                    : isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.2s",
                  boxShadow: input.trim() && !loading ? "0 0 20px rgba(99,202,183,0.3)" : "none",
                }}
              >
                {loading ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{
                    animation: "spin 1s linear infinite",
                  }}>
                    <circle cx="12" cy="12" r="10" stroke={isDark ? "#63CAB7" : "#63CAB7"} strokeWidth="2" fill="none" opacity="0.2"/>
                    <path d="M12 2 A 10 10 0 0 1 22 12" stroke={isDark ? "#63CAB7" : "#63CAB7"} strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke={input.trim() && !loading ? "#0A0F1E" : (isDark ? "#4A5878" : "#9ca3af")} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim() && !loading ? "#0A0F1E" : (isDark ? "#4A5878" : "#9ca3af")} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
