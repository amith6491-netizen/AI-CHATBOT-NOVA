import React, { useEffect, useState } from 'react';
import { useChatStore } from './store';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ChatGPTSidebar({ sidebarOpen, setSidebarOpen, isDark }) {
  const {
    username,
    setUsername,
    clearChat,
    conversations,
    loadConversation,
    loadConversations,
    messages,
    tokensUsed,
    theme,
    setTheme,
  } = useChatStore();

  const [showSettings, setShowSettings] = useState(false);
  const [newUsername, setNewUsername] = useState(username);

  useEffect(() => {
    loadConversations();
  }, []);

  const exportToPDF = async () => {
    const chatElement = document.querySelector('.messages-area');
    if (!chatElement) return;

    try {
      const canvas = await html2canvas(chatElement, {
        backgroundColor: isDark ? '#080D1A' : '#ffffff',
        scale: 2,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`NOVA_Chat_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      alert('Error exporting PDF. Please try again.');
    }
  };

  const copyAllMessages = () => {
    const text = messages.map(m => `${m.role === 'user' ? 'You' : 'NOVA'}: ${m.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    alert('Chat copied to clipboard!');
  };

  return (
    <>
      <div style={{
        width: sidebarOpen ? "260px" : "0px",
        background: isDark 
          ? "linear-gradient(to-bottom, rgba(10, 15, 30, 0.8), rgba(8, 13, 26, 0.9))"
          : "linear-gradient(to-bottom, #ffffff, #f9fafb)",
        borderRight: sidebarOpen ? (isDark ? "1px solid rgba(99, 202, 183, 0.12)" : "1px solid #e5e5e5") : "none",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        overflow: "hidden",
        height: "100vh",
        backdropFilter: "blur(10px)",
        position: "relative",
        zIndex: 100,
      }}>
        {/* Header */}
        <div style={{
          padding: "16px",
          borderBottom: isDark ? "1px solid rgba(99, 202, 183, 0.12)" : "1px solid #e5e5e5",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <h2 style={{
            fontSize: "16px",
            fontWeight: "600",
            color: isDark ? "#F0F6FF" : "#1f2937",
            fontFamily: "'Syne', sans-serif",
          }}>NOVA</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              color: isDark ? "#8899B4" : "#6b7280",
              transition: "color 0.2s",
              display: window.innerWidth <= 768 ? "block" : "none",
            }}
          >
            ✕
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => clearChat()}
          style={{
            margin: "16px",
            padding: "12px 16px",
            background: isDark ? "rgba(99, 202, 183, 0.06)" : "rgba(99, 202, 183, 0.1)",
            border: isDark ? "1px solid rgba(99, 202, 183, 0.2)" : "1px solid rgba(99, 202, 183, 0.3)",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            color: isDark ? "#8BBDCF" : "#10A37F",
            transition: "all 0.2s",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = isDark ? "rgba(99, 202, 183, 0.12)" : "rgba(99, 202, 183, 0.15)";
            e.currentTarget.style.borderColor = isDark ? "rgba(99, 202, 183, 0.4)" : "rgba(99, 202, 183, 0.5)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = isDark ? "rgba(99, 202, 183, 0.06)" : "rgba(99, 202, 183, 0.1)";
            e.currentTarget.style.borderColor = isDark ? "rgba(99, 202, 183, 0.2)" : "rgba(99, 202, 183, 0.3)";
          }}
        >
          ➕ New chat
        </button>

        {/* Quick Actions */}
        <div style={{
          padding: "0 12px",
          marginBottom: "16px",
        }}>
          <button
            onClick={copyAllMessages}
            disabled={messages.length === 0}
            style={{
              width: "100%",
              padding: "10px",
              background: messages.length > 0 
                ? (isDark ? "rgba(99, 202, 183, 0.06)" : "rgba(99, 202, 183, 0.1)")
                : (isDark ? "rgba(99, 202, 183, 0.02)" : "rgba(99, 202, 183, 0.05)"),
              border: isDark ? "1px solid rgba(99, 202, 183, 0.15)" : "1px solid rgba(99, 202, 183, 0.2)",
              borderRadius: "8px",
              cursor: messages.length > 0 ? "pointer" : "not-allowed",
              fontSize: "13px",
              color: messages.length > 0 ? (isDark ? "#8BBDCF" : "#10A37F") : (isDark ? "#4A5878" : "#9ca3af"),
              marginBottom: "8px",
              transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
              opacity: messages.length > 0 ? 1 : 0.6,
            }}
            onMouseOver={(e) => {
              if (messages.length > 0) {
                e.currentTarget.style.background = isDark ? "rgba(99, 202, 183, 0.12)" : "rgba(99, 202, 183, 0.15)";
                e.currentTarget.style.borderColor = isDark ? "rgba(99, 202, 183, 0.4)" : "rgba(99, 202, 183, 0.5)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = messages.length > 0 
                ? (isDark ? "rgba(99, 202, 183, 0.06)" : "rgba(99, 202, 183, 0.1)")
                : (isDark ? "rgba(99, 202, 183, 0.02)" : "rgba(99, 202, 183, 0.05)");
              e.currentTarget.style.borderColor = isDark ? "rgba(99, 202, 183, 0.15)" : "rgba(99, 202, 183, 0.2)";
            }}
          >
            📋 Copy Chat
          </button>
          <button
            onClick={exportToPDF}
            disabled={messages.length === 0}
            style={{
              width: "100%",
              padding: "10px",
              background: messages.length > 0 
                ? (isDark ? "rgba(99, 202, 183, 0.06)" : "rgba(99, 202, 183, 0.1)")
                : (isDark ? "rgba(99, 202, 183, 0.02)" : "rgba(99, 202, 183, 0.05)"),
              border: isDark ? "1px solid rgba(99, 202, 183, 0.15)" : "1px solid rgba(99, 202, 183, 0.2)",
              borderRadius: "8px",
              cursor: messages.length > 0 ? "pointer" : "not-allowed",
              fontSize: "13px",
              color: messages.length > 0 ? (isDark ? "#8BBDCF" : "#10A37F") : (isDark ? "#4A5878" : "#9ca3af"),
              transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
              opacity: messages.length > 0 ? 1 : 0.6,
            }}
            onMouseOver={(e) => {
              if (messages.length > 0) {
                e.currentTarget.style.background = isDark ? "rgba(99, 202, 183, 0.12)" : "rgba(99, 202, 183, 0.15)";
                e.currentTarget.style.borderColor = isDark ? "rgba(99, 202, 183, 0.4)" : "rgba(99, 202, 183, 0.5)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = messages.length > 0 
                ? (isDark ? "rgba(99, 202, 183, 0.06)" : "rgba(99, 202, 183, 0.1)")
                : (isDark ? "rgba(99, 202, 183, 0.02)" : "rgba(99, 202, 183, 0.05)");
              e.currentTarget.style.borderColor = isDark ? "rgba(99, 202, 183, 0.15)" : "rgba(99, 202, 183, 0.2)";
            }}
          >
            📄 Export PDF
          </button>
        </div>

        {/* Chat History */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 12px",
          marginBottom: "16px",
        }}>
          <p style={{
            fontSize: "12px",
            fontWeight: "600",
            color: isDark ? "#4A5878" : "#9ca3af",
            marginBottom: "8px",
            paddingLeft: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            History
          </p>
          {conversations.length === 0 ? (
            <p style={{
              fontSize: "13px",
              color: isDark ? "#4A5878" : "#9ca3af",
              paddingLeft: "4px",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              No conversations yet
            </p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  background: isDark ? "rgba(99, 202, 183, 0.06)" : "rgba(99, 202, 183, 0.1)",
                  border: isDark ? "1px solid rgba(99, 202, 183, 0.15)" : "1px solid rgba(99, 202, 183, 0.2)",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: isDark ? "#8BBDCF" : "#10A37F",
                  transition: "all 0.2s",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = isDark ? "rgba(99, 202, 183, 0.12)" : "rgba(99, 202, 183, 0.15)";
                  e.currentTarget.style.borderColor = isDark ? "rgba(99, 202, 183, 0.4)" : "rgba(99, 202, 183, 0.5)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = isDark ? "rgba(99, 202, 183, 0.06)" : "rgba(99, 202, 183, 0.1)";
                  e.currentTarget.style.borderColor = isDark ? "rgba(99, 202, 183, 0.15)" : "rgba(99, 202, 183, 0.2)";
                }}
              >
                {conv.title}
              </button>
            ))
          )}
        </div>

        {/* Footer - Settings and Profile */}
        <div style={{
          borderTop: isDark ? "1px solid rgba(99, 202, 183, 0.12)" : "1px solid #e5e5e5",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              width: "100%",
              padding: "12px",
              background: isDark ? "rgba(99, 202, 183, 0.06)" : "rgba(99, 202, 183, 0.1)",
              border: isDark ? "1px solid rgba(99, 202, 183, 0.15)" : "1px solid rgba(99, 202, 183, 0.2)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500",
              color: isDark ? "#8BBDCF" : "#10A37F",
              transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = isDark ? "rgba(99, 202, 183, 0.12)" : "rgba(99, 202, 183, 0.15)";
              e.currentTarget.style.borderColor = isDark ? "rgba(99, 202, 183, 0.4)" : "rgba(99, 202, 183, 0.5)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = isDark ? "rgba(99, 202, 183, 0.06)" : "rgba(99, 202, 183, 0.1)";
              e.currentTarget.style.borderColor = isDark ? "rgba(99, 202, 183, 0.15)" : "rgba(99, 202, 183, 0.2)";
            }}
          >
            ⚙️ Settings
          </button>
          <div style={{
            padding: "10px 12px",
            background: isDark ? "rgba(99, 202, 183, 0.08)" : "rgba(99, 202, 183, 0.1)",
            borderRadius: "8px",
            fontSize: "12px",
            color: isDark ? "#8BBDCF" : "#10A37F",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <p style={{ margin: 0 }}>👤 {username}</p>
            <p style={{ marginTop: "4px", color: isDark ? "#4A5878" : "#9ca3af", margin: "4px 0 0 0" }}>💬 {messages.length} messages</p>
            <p style={{ marginTop: "4px", color: isDark ? "#4A5878" : "#9ca3af", margin: "4px 0 0 0" }}>⚡ {tokensUsed} tokens</p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)",
          padding: "16px",
        }}>
          <div style={{
            background: isDark ? "rgba(10, 15, 30, 0.95)" : "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            maxWidth: "400px",
            width: "100%",
            boxShadow: "0 0 60px rgba(99,202,183,0.2)",
            border: isDark ? "1px solid rgba(99, 202, 183, 0.15)" : "1px solid #e5e5e5",
            backdropFilter: "blur(12px)",
          }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: isDark ? "#F0F6FF" : "#1f2937",
              marginBottom: "20px",
              fontFamily: "'Syne', sans-serif",
            }}>Settings</h2>

            <div style={{
              marginBottom: "16px",
            }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: isDark ? "#8BBDCF" : "#1f2937",
                marginBottom: "8px",
                fontFamily: "'DM Sans', sans-serif",
              }}>Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: isDark ? "1px solid rgba(99, 202, 183, 0.15)" : "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  color: isDark ? "#CBD5E8" : "#1f2937",
                  background: isDark ? "rgba(255, 255, 255, 0.02)" : "#f9fafb",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>

            {/* Theme Toggle */}
            <div style={{
              marginBottom: "20px",
            }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: isDark ? "#8BBDCF" : "#1f2937",
                marginBottom: "8px",
                fontFamily: "'DM Sans', sans-serif",
              }}>Theme</label>
              <div style={{
                display: "flex",
                gap: "8px",
              }}>
                <button
                  onClick={() => setTheme('dark')}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: theme === 'dark' ? "linear-gradient(135deg, #63CAB7, #3B8FD4)" : isDark ? "rgba(99, 202, 183, 0.06)" : "#f0f0f0",
                    border: theme === 'dark' ? "none" : (isDark ? "1px solid rgba(99, 202, 183, 0.15)" : "1px solid #e5e5e5"),
                    borderRadius: "8px",
                    color: theme === 'dark' ? "white" : (isDark ? "#8BBDCF" : "#1f2937"),
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  🌙 Dark
                </button>
                <button
                  onClick={() => setTheme('light')}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: theme === 'light' ? "linear-gradient(135deg, #63CAB7, #3B8FD4)" : isDark ? "rgba(99, 202, 183, 0.06)" : "#f0f0f0",
                    border: theme === 'light' ? "none" : (isDark ? "1px solid rgba(99, 202, 183, 0.15)" : "1px solid #e5e5e5"),
                    borderRadius: "8px",
                    color: theme === 'light' ? "white" : (isDark ? "#8BBDCF" : "#1f2937"),
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  ☀️ Light
                </button>
              </div>
            </div>

            <div style={{
              display: "flex",
              gap: "10px",
              marginTop: "24px",
            }}>
              <button
                onClick={() => {
                  setUsername(newUsername);
                  setShowSettings(false);
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "linear-gradient(135deg, #63CAB7, #3B8FD4)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(99,202,183,0.4)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Save
              </button>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: isDark ? "rgba(99, 202, 183, 0.06)" : "#f0f0f0",
                  border: isDark ? "1px solid rgba(99, 202, 183, 0.15)" : "1px solid #e5e5e5",
                  borderRadius: "8px",
                  color: isDark ? "#8BBDCF" : "#1f2937",
                  fontWeight: "500",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
