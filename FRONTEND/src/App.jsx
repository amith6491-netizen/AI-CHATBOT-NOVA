import { useState, useRef, useEffect } from "react";
import { useChatStore } from "./store";
import Sidebar from "./ChatGPTSidebar";

function Message({ msg, isUser }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: "16px",
      animation: "fadeSlideIn 0.3s ease-out both",
    }}>
      <div style={{
        maxWidth: "85%",
        padding: "12px 16px",
        background: isUser ? "#10A37F" : "#1a1a1a",
        border: isUser ? "none" : "1px solid #2d2d2d",
        borderRadius: "12px",
        color: isUser ? "white" : "#ececec",
        fontSize: "15px",
        lineHeight: "1.5",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function AIChatbot() {
  const { messages, addMessage, clearChat } = useChatStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);

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

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        textarea::-webkit-scrollbar { display: none; }
        .messages-area::-webkit-scrollbar { width: 6px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: #3d3d3d; border-radius: 3px; }
        .messages-area::-webkit-scrollbar-thumb:hover { background: #505050; }
      `}</style>

      <div style={{
        display: "flex",
        height: "100vh",
        background: "#ffffff",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}>
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Chat Area */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid #d1d5db",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#ffffff",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "#333",
                }}
              >
                ☰
              </button>
              <h1 style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#0d0d0d",
              }}>NOVA</h1>
            </div>
            <div style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}>
              <select style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: "white",
                color: "#333",
                fontSize: "14px",
                cursor: "pointer",
              }}>
                <option>Groq - Mixtral</option>
              </select>
            </div>
          </div>

          {/* Messages Container */}
          <div
            className="messages-area"
            ref={chatRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 40px",
              display: "flex",
              flexDirection: "column",
              background: "#ffffff",
            }}
          >
            {messages.length === 0 ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
              }}>
                <h2 style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#0d0d0d",
                  marginBottom: "10px",
                }}>Welcome to NOVA</h2>
                <p style={{
                  fontSize: "16px",
                  color: "#565869",
                  marginBottom: "30px",
                }}>Start a conversation with your AI assistant</p>
                
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  maxWidth: "600px",
                }}>
                  {[
                    { title: "Write", desc: "Help me write a Python script" },
                    { title: "Explain", desc: "Explain quantum computing" },
                    { title: "Create", desc: "Create a recipe for pasta" },
                    { title: "Brainstorm", desc: "Help me brainstorm ideas" },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(item.desc)}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid #d1d5db",
                        background: "#f7f7f7",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "#ececf1";
                        e.currentTarget.style.borderColor = "#b4b4b4";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "#f7f7f7";
                        e.currentTarget.style.borderColor = "#d1d5db";
                      }}
                    >
                      <div style={{
                        fontWeight: "600",
                        color: "#0d0d0d",
                        marginBottom: "4px",
                        fontSize: "14px",
                      }}>{item.title}</div>
                      <div style={{
                        fontSize: "12px",
                        color: "#565869",
                      }}>{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <Message key={idx} msg={msg} isUser={msg.role === "user"} />
                ))}
                {loading && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                  }}>
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#10A37F",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      color: "white",
                      fontWeight: "bold",
                    }}>N</div>
                    <div style={{
                      display: "flex",
                      gap: "4px",
                      alignItems: "center",
                    }}>
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#10A37F",
                            animation: "pulse 1.4s ease-in-out infinite",
                            animationDelay: `${i * 0.2}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {error && (
                  <div style={{
                    padding: "12px 16px",
                    background: "#fee2e2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    color: "#dc2626",
                    fontSize: "14px",
                    marginBottom: "16px",
                  }}>
                    ⚠️ {error}
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div style={{
            padding: "16px 20px 20px",
            background: "#ffffff",
            borderTop: "1px solid #d1d5db",
          }}>
            <div style={{
              display: "flex",
              gap: "12px",
              maxWidth: "900px",
              margin: "0 auto",
            }}>
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "flex-end",
                background: "#f7f7f7",
                border: "1px solid #d1d5db",
                borderRadius: "12px",
                padding: "12px 16px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#8b8b8b";
                e.currentTarget.style.background = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
                e.currentTarget.style.background = "#f7f7f7";
              }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Message NOVA..."
                  rows={1}
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    outline: "none",
                    color: "#0d0d0d",
                    fontSize: "16px",
                    resize: "none",
                    fontFamily: "inherit",
                    maxHeight: "200px",
                    overflow: "auto",
                  }}
                  onInput={e => {
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  style={{
                    background: input.trim() && !loading ? "#10A37F" : "#d1d5db",
                    border: "none",
                    borderRadius: "8px",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    marginLeft: "8px",
                    flexShrink: 0,
                  }}
                  onMouseOver={(e) => {
                    if (input.trim() && !loading) {
                      e.currentTarget.style.background = "#0d9367";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (input.trim() && !loading) {
                      e.currentTarget.style.background = "#10A37F";
                    }
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <polyline points="23 12 20 9 20 15 1 15"></polyline>
                  </svg>
                </button>
              </div>
            </div>
            <p style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#8b8b8b",
              marginTop: "12px",
            }}>
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
