import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useChatStore } from './store';

const SUGGESTED_PROMPTS = [
  'What is machine learning?',
  'Explain quantum computing',
  'How does AI work?',
  'Write a Python function',
  'What is blockchain?',
  'Explain neural networks',
  'Write a funny joke',
  'Create a recipe',
];

export default function RightPanel({ onPromptSelect, chatRef }) {
  const { messages, tokensUsed, username, saveConversation } = useChatStore();

  // Export to PDF
  const exportToPDF = async () => {
    if (!chatRef.current) return;

    const canvas = await html2canvas(chatRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`NOVA_Chat_${new Date().getTime()}.pdf`);
  };

  // Copy all messages
  const copyAllMessages = () => {
    const text = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    alert('Chat copied to clipboard!');
  };

  // Share chat link (placeholder)
  const shareChat = () => {
    const shareUrl = `${window.location.origin}?chat=${encodeURIComponent(JSON.stringify(messages))}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  return (
    <div className="w-80 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col h-screen border-l border-slate-700 overflow-y-auto">
      {/* Conversation Summary */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-bold mb-3">📊 Session Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Messages:</span>
            <span className="font-semibold">{messages.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Tokens Used:</span>
            <span className="font-semibold text-blue-400">{tokensUsed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Session:</span>
            <span className="font-semibold text-green-400">Active</span>
          </div>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-bold mb-3">💡 Suggested Prompts</h3>
        <div className="space-y-2">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onPromptSelect(prompt)}
              className="w-full text-left bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 p-3 rounded-lg text-xs transition border border-blue-500/30 hover:border-blue-500/60"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-bold mb-3">⚡ Actions</h3>
        <div className="space-y-2">
          <button
            onClick={copyAllMessages}
            disabled={messages.length === 0}
            className="w-full bg-purple-600/20 hover:bg-purple-600/40 disabled:opacity-50 text-purple-300 py-2 px-3 rounded-lg text-xs font-medium transition"
          >
            📋 Copy Chat
          </button>
          <button
            onClick={exportToPDF}
            disabled={messages.length === 0}
            className="w-full bg-green-600/20 hover:bg-green-600/40 disabled:opacity-50 text-green-300 py-2 px-3 rounded-lg text-xs font-medium transition"
          >
            📄 Export PDF
          </button>
          <button
            onClick={shareChat}
            disabled={messages.length === 0}
            className="w-full bg-indigo-600/20 hover:bg-indigo-600/40 disabled:opacity-50 text-indigo-300 py-2 px-3 rounded-lg text-xs font-medium transition"
          >
            🔗 Share Link
          </button>
          <button
            onClick={saveConversation}
            disabled={messages.length === 0}
            className="w-full bg-orange-600/20 hover:bg-orange-600/40 disabled:opacity-50 text-orange-300 py-2 px-3 rounded-lg text-xs font-medium transition"
          >
            💾 Save Chat
          </button>
        </div>
      </div>

      {/* Chat Info */}
      <div className="p-4 flex-1">
        <h3 className="text-sm font-bold mb-3">ℹ️ Chat Info</h3>
        <div className="bg-slate-700/50 p-3 rounded-lg text-xs space-y-2">
          <div>
            <p className="text-slate-400">User</p>
            <p className="font-semibold">{username}</p>
          </div>
          <div>
            <p className="text-slate-400">Model</p>
            <p className="font-semibold text-blue-400">Groq API</p>
          </div>
          <div>
            <p className="text-slate-400">Status</p>
            <p className="font-semibold text-green-400">Connected ✓</p>
          </div>
          <div>
            <p className="text-slate-400">Time</p>
            <p className="font-semibold">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
        <p>NOVA v1.0</p>
        <p>Powered by Groq & React</p>
      </div>
    </div>
  );
}
