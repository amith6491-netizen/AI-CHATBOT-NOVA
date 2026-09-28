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
    saveConversation,
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
        background: "#f7f7f7",
        borderRight: sidebarOpen ? "1px solid #d1d5db" : "none",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        overflow: "hidden",
        height: "100vh",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px",
          borderBottom: "1px solid #d1d5db",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <h2 style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#0d0d0d",
          }}>NOVA</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              color: "#565869",
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
            background: "#ffffff",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            color: "#0d0d0d",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#f7f7f7";
            e.currentTarget.style.borderColor = "#8b8b8b";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.borderColor = "#d1d5db";
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
              background: messages.length > 0 ? "#ffffff" : "#f0f0f0",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              cursor: messages.length > 0 ? "pointer" : "not-allowed",
              fontSize: "13px",
              color: messages.length > 0 ? "#0d0d0d" : "#999999",
              marginBottom: "8px",
              transition: "all 0.2s",
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
              background: messages.length > 0 ? "#ffffff" : "#f0f0f0",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              cursor: messages.length > 0 ? "pointer" : "not-allowed",
              fontSize: "13px",
              color: messages.length > 0 ? "#0d0d0d" : "#999999",
              transition: "all 0.2s",
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
            color: "#8b8b8b",
            marginBottom: "8px",
            paddingLeft: "4px",
            textTransform: "uppercase",
          }}>
            History
          </p>
          {conversations.length === 0 ? (
            <p style={{
              fontSize: "13px",
              color: "#8b8b8b",
              paddingLeft: "4px",
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
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#0d0d0d",
                  transition: "all 0.2s",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#f0f0f0";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                }}
              >
                {conv.title}
              </button>
            ))
          )}
        </div>

        {/* Footer - Settings and Profile */}
        <div style={{
          borderTop: "1px solid #d1d5db",
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
              background: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500",
              color: "#0d0d0d",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#f7f7f7";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#ffffff";
            }}
          >
            ⚙️ Settings
          </button>
          <div style={{
            padding: "10px 12px",
            background: "#ececf1",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#565869",
          }}>
            <p>👤 {username}</p>
            <p style={{ marginTop: "4px" }}>💬 {messages.length} messages</p>
            <p style={{ marginTop: "4px" }}>⚡ {tokensUsed} tokens</p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#0d0d0d",
              marginBottom: "20px",
            }}>Settings</h2>

            <div style={{
              marginBottom: "16px",
            }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#0d0d0d",
                marginBottom: "8px",
              }}>Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  color: "#0d0d0d",
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
                  background: "#10A37F",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#0d9367";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#10A37F";
                }}
              >
                Save
              </button>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#f7f7f7",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  color: "#0d0d0d",
                  fontWeight: "500",
                  cursor: "pointer",
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
