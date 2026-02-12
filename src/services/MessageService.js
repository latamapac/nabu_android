/**
 * Message Service - Local Only
 * No server - works completely offline
 */

import DatabaseService from './DatabaseService';

class MessageService {
  constructor() {
    this.listeners = new Map();
  }

  // Send message (LOCAL ONLY - no server)
  async sendMessage(conversationId, content, options = {}) {
    const { currentUser } = options;
    
    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      sender: {
        id: currentUser?.id || 'local-user',
        name: currentUser?.displayName || 'Me'
      },
      content,
      contentType: 'text',
      replyToId: options.replyToId,
      timestamp: Date.now(),
      status: 'sent' // Always sent locally
    };

    // Save to local DB only
    const saved = await DatabaseService.saveMessage(message);
    
    this.emit('message:sent', saved);
    return saved;
  }

  // Get messages (LOCAL ONLY)
  async getMessages(conversationId, options = {}) {
    return DatabaseService.getMessages(conversationId, options);
  }

  // Create conversation
  async createConversation(name, avatar = '💬', currentUser) {
    return DatabaseService.createConversation({
      name,
      avatar,
      participants: [currentUser?.id]
    });
  }

  // Get all conversations
  async getConversations() {
    return DatabaseService.getConversations();
  }

  // Event handling
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }
}

export default new MessageService();
