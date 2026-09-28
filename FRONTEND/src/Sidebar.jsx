import React, { useEffect, useState } from 'react';
import { useChatStore } from './store';

export default function Sidebar() {
  const {
    username,
    profileImage,
    clearChat,
    conversations,
    loadConversation,
    loadConversations,
    currentConversationId,
  } = useChatStore();

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col h-screen border-r border-slate-700">
      {/* Profile Section */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={profileImage}
            alt={username}
            className="w-12 h-12 rounded-full border-2 border-blue-500"
          />
          <div>
            <p className="font-semibold text-sm">{username}</p>
            <p className="text-xs text-slate-400">Online</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition"
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-slate-700 space-y-2">
        <button
          onClick={clearChat}
          className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-300 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
        >
          🗑️ Clear Chat
        </button>
      </div>

      {/* Previous Conversations */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs font-semibold text-slate-400 mb-3 uppercase">Recent Chats</p>
        {conversations.length === 0 ? (
          <p className="text-xs text-slate-500">No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              className={`w-full text-left p-3 rounded-lg mb-2 transition text-sm line-clamp-2 ${
                currentConversationId === conv.id
                  ? 'bg-blue-600/40 border border-blue-500'
                  : 'bg-slate-700/50 hover:bg-slate-700'
              }`}
            >
              <div className="font-medium">{conv.title}</div>
              <div className="text-xs text-slate-400">{conv.timestamp}</div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 text-xs text-slate-400 text-center">
        <p>NOVA AI Chatbot</p>
        <p className="text-xs mt-1">Powered by Groq</p>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

function SettingsModal({ onClose }) {
  const { setUsername, setTemperature, temperature, username } = useChatStore();
  const [newUsername, setNewUsername] = useState(username);
  const [newTemp, setNewTemp] = useState(temperature);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full m-4 border border-slate-700">
        <h2 className="text-xl font-bold mb-4">Settings</h2>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Username</label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Temperature */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Temperature: {newTemp.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={newTemp}
            onChange={(e) => setNewTemp(parseFloat(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-slate-400 mt-1">Lower = more focused, Higher = more creative</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setUsername(newUsername);
              setTemperature(newTemp);
              onClose();
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
