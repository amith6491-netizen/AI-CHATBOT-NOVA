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
      // Create a temporary container with white background and black text
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.top = '-9999px';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = chatElement.offsetWidth + 'px';
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.color = '#000000';
      tempDiv.style.fontFamily = "'DM Sans', sans-serif";
      tempDiv.style.lineHeight = '1.6';
      document.body.appendChild(tempDiv);

      // Copy messages with formatting
      messages.forEach((msg, index) => {
        const messageDiv = document.createElement('div');
        messageDiv.style.marginBottom = '16px';
        messageDiv.style.padding = '12px';
        messageDiv.style.backgroundColor = msg.role === 'user' ? '#e3f2fd' : '#f5f5f5';
        messageDiv.style.borderRadius = '8px';
        messageDiv.style.color = '#000000';
        messageDiv.style.fontSize = '14px';

        const label = document.createElement('strong');
        label.style.color = msg.role === 'user' ? '#1976d2' : '#333333';
        label.textContent = msg.role === 'user' ? 'You: ' : 'NOVA: ';
        label.style.display = 'block';
        label.style.marginBottom = '6px';

        const content = document.createElement('div');
        content.style.whiteSpace = 'pre-wrap';
        content.style.wordWrap = 'break-word';
        content.textContent = msg.content;
        content.style.color = '#000000';

        messageDiv.appendChild(label);
        messageDiv.appendChild(content);
        tempDiv.appendChild(messageDiv);
      });

      // Convert to canvas with white background
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 190; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
      heightLeft -= 267; // A4 height minus margins

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
        heightLeft -= 267;
      }

      // Save PDF
      pdf.save(`NOVA_Chat_${new Date().toLocaleDateString()}.pdf`);

      // Clean up
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Error exporting PDF:', error);
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
      <style>{`
        @media (max-width: 768px) {
          .sidebar-container-custom {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            height: 100dvh !important;
            max-width: 82vw !important;
            box-shadow: 10px 0 35px rgba(0, 0, 0, 0.5) !important;
            z-index: 1000 !important;
          }
          .mobile-sidebar-close {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .sidebar-backdrop {
            display: none !important;
          }
          .mobile-sidebar-close {
            display: none !important;
          }
        }
      `}</style>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(3px)",
            WebkitBackdropFilter: "blur(3px)",
            zIndex: 998,
          }}
        />
      )}

      <div
        className="sidebar-container-custom"
        style={{
          width: sidebarOpen ? "270px" : "0px",
          background: isDark 
            ? "linear-gradient(180deg, #0e1526 0%, #080d1a 100%)"
            : "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
          borderRight: sidebarOpen ? (isDark ? "1px solid rgba(99, 202, 183, 0.12)" : "1px solid #e5e5e5") : "none",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          height: "100%",
          height: "100dvh",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          position: "relative",
          zIndex: 100,
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px",
          borderBottom: isDark ? "1px solid rgba(99, 202, 183, 0.12)" : "1px solid #e5e5e5",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <h2 style={{
            fontSize: "16px",
            fontWeight: "600",
            color: isDark ? "#F0F6FF" : "#1f2937",
            fontFamily: "'Syne', sans-serif",
          }}>NOVA</h2>
          <button
            className="mobile-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            style={{
              background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
              borderRadius: "6px",
              padding: "4px 8px",
              cursor: "pointer",
              fontSize: "16px",
              lineHeight: 1,
              color: isDark ? "#8899B4" : "#6b7280",
              transition: "color 0.2s",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Close menu"
          >
            ✕
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => {
            clearChat();
            if (window.innerWidth <= 768) setSidebarOpen(false);
          }}
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
            flexShrink: 0,
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
                onClick={() => {
                  loadConversation(conv.id);
                  if (window.innerWidth <= 768) setSidebarOpen(false);
                }}
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
