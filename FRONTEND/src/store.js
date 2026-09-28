import { create } from 'zustand';

export const useChatStore = create((set) => ({
  messages: [],
  conversations: [],
  currentConversationId: null,
  username: localStorage.getItem('username') || 'User',
  profileImage: localStorage.getItem('profileImage') || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
  tokensUsed: 0,
  currentModel: 'mixtral-8x7b-32768',
  temperature: 0.7,
  theme: localStorage.getItem('theme') || 'dark',

  // Add message
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
    tokensUsed: state.tokensUsed + Math.ceil(message.content.length / 4),
  })),

  // Clear chat
  clearChat: () => set({ messages: [], tokensUsed: 0 }),

  // Save conversation
  saveConversation: () => set((state) => {
    const conversationId = Date.now();
    const newConversation = {
      id: conversationId,
      title: state.messages[0]?.content.substring(0, 30) || 'New Chat',
      messages: state.messages,
      timestamp: new Date().toLocaleString(),
      tokensUsed: state.tokensUsed,
    };
    localStorage.setItem(`conversation_${conversationId}`, JSON.stringify(newConversation));
    return {
      conversations: [newConversation, ...state.conversations],
      currentConversationId: conversationId,
    };
  }),

  // Load conversations
  loadConversations: () => {
    const saved = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('conversation_')) {
        saved.push(JSON.parse(localStorage.getItem(key)));
      }
    }
    set({ conversations: saved.sort((a, b) => b.timestamp - a.timestamp) });
  },

  // Load conversation
  loadConversation: (id) => {
    const conversation = JSON.parse(localStorage.getItem(`conversation_${id}`));
    if (conversation) {
      set({
        messages: conversation.messages,
        tokensUsed: conversation.tokensUsed,
        currentConversationId: id,
      });
    }
  },

  // Update username
  setUsername: (username) => {
    localStorage.setItem('username', username);
    set({ username });
  },

  // Update profile image
  setProfileImage: (image) => {
    localStorage.setItem('profileImage', image);
    set({ profileImage });
  },

  // Update settings
  setTemperature: (temp) => set({ temperature: temp }),
  setModel: (model) => set({ currentModel: model }),
  
  // Toggle theme
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },
}));
