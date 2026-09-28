import React, { useEffect, useState } from 'react';
import { useChatStore } from './store';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ChatGPTSidebar({ sidebarOpen, setSidebarOpen }) {
  const {
    username,
    setUsername,
    clearChat,
    conversations,
    loadConversation,
    loadConversations,
    messages,
    tokensUsed,
  } = useChatStore();

  const [showSettings, setShowSettings] = useState(false);
  const [newUsername, setNewUsername] = useState(username);

  useEffect(() => {
    loadConversations();
  }, []);

  const exportToPDF = async () => {
    const chatElement = document.querySelector('.messages-area');
    if (!chatElement) return;

    const canvas = await html2canvas(chatElement);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`NOVA_Chat_${new Date().getTime()}.pdf`);
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
        background: "linear-gradient(to-bottom, rgba(10, 15, 30, 0.8), rgba(8, 13, 26, 0.9))",
        borderRight: sidebarOpen ? "1px solid rgba(99, 202, 183, 0.12)" : "none",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        overflow: "hidden",
        height: "100vh",
        backdropFilter: "blur(10px)",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px",
          borderBottom: "1px solid rgba(99, 202, 183, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <h2 style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#F0F6FF",
            fontFamily: "'Syne', sans-serif",
          }}>NOVA</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              color: "#8899B4",
              transition: "color 0.2s",
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
            background: "rgba(99, 202, 183, 0.06)",
            border: "1px solid rgba(99, 202, 183, 0.2)",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            color: "#8BBDCF",
            transition: "all 0.2s",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(99, 202, 183, 0.12)";
            e.currentTarget.style.borderColor = "rgba(99, 202, 183, 0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(99, 202, 183, 0.06)";
            e.currentTarget.style.borderColor = "rgba(99, 202, 183, 0.2)";
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
              background: messages.length > 0 ? "rgba(99, 202, 183, 0.06)" : "rgba(99, 202, 183, 0.02)",
              border: "1px solid rgba(99, 202, 183, 0.15)",
              borderRadius: "8px",
              cursor: messages.length > 0 ? "pointer" : "not-allowed",
              fontSize: "13px",
              color: messages.length > 0 ? "#8BBDCF" : "#4A5878",
              marginBottom: "8px",
              transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
              opacity: messages.length > 0 ? 1 : 0.6,
            }}
            onMouseOver={(e) => {
              if (messages.length > 0) {
                e.currentTarget.style.background = "rgba(99, 202, 183, 0.12)";
                e.currentTarget.style.borderColor = "rgba(99, 202, 183, 0.4)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(99, 202, 183, 0.06)";
              e.currentTarget.style.borderColor = "rgba(99, 202, 183, 0.15)";
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
              background: messages.length > 0 ? "rgba(99, 202, 183, 0.06)" : "rgba(99, 202, 183, 0.02)",
              border: "1px solid rgba(99, 202, 183, 0.15)",
              borderRadius: "8px",
              cursor: messages.length > 0 ? "pointer" : "not-allowed",
              fontSize: "13px",
              color: messages.length > 0 ? "#8BBDCF" : "#4A5878",
              transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
              opacity: messages.length > 0 ? 1 : 0.6,
            }}
            onMouseOver={(e) => {
              if (messages.length > 0) {
                e.currentTarget.style.background = "rgba(99, 202, 183, 0.12)";
                e.currentTarget.style.borderColor = "rgba(99, 202, 183, 0.4)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(99, 202, 183, 0.06)";
              e.currentTarget.style.borderColor = "rgba(99, 202, 183, 0.15)";
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
            color: "#4A5878",
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
              color: "#4A5878",
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
                  background: "rgba(99, 202, 183, 0.06)",
                  border: "1px solid rgba(99, 202, 183, 0.15)",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#8BBDCF",
                  transition: "all 0.2s",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(99, 202, 183, 0.12)";
                  e.currentTarget.style.borderColor = "rgba(99, 202, 183, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(99, 202, 183, 0.06)";
                  e.currentTarget.style.borderColor = "rgba(99, 202, 183, 0.15)";
                }}
              >
                {conv.title}
              </button>
            ))
          )}
        </div>

        {/* Footer - Settings and Profile */}
        <div style={{
          borderTop: "1px solid rgba(99, 202, 183, 0.12)",
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
              background: "rgba(99, 202, 183, 0.06)",
              border: "1px solid rgba(99, 202, 183, 0.15)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500",
              color: "#8BBDCF",
              transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(99, 202, 183, 0.12)";
              e.currentTarget.style.borderColor = "rgba(99, 202, 183, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(99, 202, 183, 0.06)";
              e.currentTarget.style.borderColor = "rgba(99, 202, 183, 0.15)";
            }}
          >
            ⚙️ Settings
          </button>
          <div style={{
            padding: "10px 12px",
            background: "rgba(99, 202, 183, 0.08)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#8BBDCF",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <p>👤 {username}</p>
            <p style={{ marginTop: "4px", color: "#4A5878" }}>💬 {messages.length} messages</p>
            <p style={{ marginTop: "4px", color: "#4A5878" }}>⚡ {tokensUsed} tokens</p>
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
        }}>
          <div style={{
            background: "rgba(10, 15, 30, 0.95)",
            borderRadius: "16px",
            padding: "24px",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "0 0 60px rgba(99,202,183,0.2)",
            border: "1px solid rgba(99, 202, 183, 0.15)",
            backdropFilter: "blur(12px)",
          }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#F0F6FF",
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
                color: "#8BBDCF",
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
                  border: "1px solid rgba(99, 202, 183, 0.15)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  color: "#CBD5E8",
                  background: "rgba(255, 255, 255, 0.02)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
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
                  background: "rgba(99, 202, 183, 0.06)",
                  border: "1px solid rgba(99, 202, 183, 0.15)",
                  borderRadius: "8px",
                  color: "#8BBDCF",
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
