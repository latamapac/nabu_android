/**
 * Database Service - React Native (Offline-First)
 * SQLite wrapper for Android - Local-only mode
 */

import SQLite from 'react-native-sqlite-storage';
import { Platform } from 'react-native';

SQLite.enablePromise(true);

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      const dbName = 'nabu-local.db';
      
      this.db = await SQLite.openDatabase({
        name: dbName,
        location: 'default',
        createFromLocation: false
      });

      await this.createSchema();
      this.isInitialized = true;
      
      console.log('[Database] Local SQLite initialized');
    } catch (error) {
      console.error('[Database] Init failed:', error);
      throw error;
    }
  }

  async createSchema() {
    // Users table - LOCAL ONLY (no server)
    await this.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        display_name TEXT,
        avatar TEXT DEFAULT '👤',
        password_hash TEXT NOT NULL,
        is_local INTEGER DEFAULT 1,
        is_superuser INTEGER DEFAULT 0,
        public_key TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        last_login INTEGER
      )
    `);

    // Conversations table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL DEFAULT 'local',
        name TEXT NOT NULL,
        description TEXT,
        avatar TEXT,
        participants TEXT,
        last_message_preview TEXT,
        last_message_at INTEGER,
        unread_count INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);

    // Messages table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        sender_name TEXT,
        content TEXT,
        content_type TEXT DEFAULT 'text',
        is_encrypted INTEGER DEFAULT 0,
        reply_to_id TEXT,
        reactions TEXT,
        read_by TEXT,
        delivery_status TEXT DEFAULT 'sent',
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      )
    `);

    // Settings table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);

    // Indexes
    await this.execute('CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at DESC)');
    await this.execute('CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC)');
    
    console.log('[Database] Schema created');
  }

  // ========== USER OPERATIONS (LOCAL ONLY) ==========
  
  async createUser(user) {
    const sql = `
      INSERT INTO users (id, username, display_name, avatar, password_hash, is_local, is_superuser, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `;
    const id = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await this.execute(sql, [
      id,
      user.username.toLowerCase(),
      user.displayName || user.username,
      user.avatar || '👤',
      user.passwordHash,
      user.isSuperuser ? 1 : 0,
      Date.now()
    ]);
    return { ...user, id };
  }

  async getUserByUsername(username) {
    const [result] = await this.execute(
      'SELECT * FROM users WHERE username = ? COLLATE NOCASE',
      [username.toLowerCase()]
    );
    if (result.rows.length === 0) return null;
    return this.hydrateUser(result.rows.item(0));
  }

  async getUserById(id) {
    const [result] = await this.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (result.rows.length === 0) return null;
    return this.hydrateUser(result.rows.item(0));
  }

  async updateLastLogin(userId) {
    await this.execute(
      'UPDATE users SET last_login = ? WHERE id = ?',
      [Date.now(), userId]
    );
  }

  async getUserCount() {
    const [result] = await this.execute('SELECT COUNT(*) as count FROM users');
    return result.rows.item(0).count;
  }

  // ========== MESSAGE OPERATIONS ==========
  
  async saveMessage(message) {
    const sql = `
      INSERT INTO messages (id, conversation_id, sender_id, sender_name, content, content_type, delivery_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'sent', ?)
    `;
    const id = message.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await this.execute(sql, [
      id,
      message.conversationId,
      message.sender?.id,
      message.sender?.name,
      message.content,
      message.contentType || 'text',
      message.timestamp || Date.now()
    ]);
    
    // Update conversation preview
    await this.updateConversationPreview(message.conversationId, message);
    
    return { ...message, id };
  }

  async getMessages(conversationId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    const sql = 'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const [result] = await this.execute(sql, [conversationId, limit, offset]);
    
    const messages = [];
    for (let i = 0; i < result.rows.length; i++) {
      messages.push(this.hydrateMessage(result.rows.item(i)));
    }
    return messages;
  }

  // ========== CONVERSATION OPERATIONS ==========
  
  async createConversation(conversation) {
    const sql = `
      INSERT INTO conversations (id, type, name, description, avatar, participants, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const id = conversation.id || `conv-${Date.now()}`;
    await this.execute(sql, [
      id,
      conversation.type || 'local',
      conversation.name,
      conversation.description || '',
      conversation.avatar || '💬',
      JSON.stringify(conversation.participants || []),
      Date.now(),
      Date.now()
    ]);
    return { ...conversation, id };
  }

  async getConversations() {
    const sql = 'SELECT * FROM conversations WHERE is_archived = 0 ORDER BY updated_at DESC';
    const [result] = await this.execute(sql);
    
    const conversations = [];
    for (let i = 0; i < result.rows.length; i++) {
      conversations.push(this.hydrateConversation(result.rows.item(i)));
    }
    return conversations;
  }

  async updateConversationPreview(conversationId, message) {
    await this.execute(`
      UPDATE conversations 
      SET last_message_preview = ?, last_message_at = ?, updated_at = ?
      WHERE id = ?
    `, [
      message.content?.substring(0, 100) || '...',
      message.timestamp || Date.now(),
      Date.now(),
      conversationId
    ]);
  }

  // ========== SETTINGS ==========
  
  async setSetting(key, value) {
    await this.execute(
      'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
      [key, JSON.stringify(value), Date.now()]
    );
  }

  async getSetting(key, defaultValue = null) {
    const [result] = await this.execute('SELECT value FROM settings WHERE key = ?', [key]);
    if (result.rows.length === 0) return defaultValue;
    try {
      return JSON.parse(result.rows.item(0).value);
    } catch {
      return result.rows.item(0).value;
    }
  }

  // ========== HELPERS ==========
  
  async execute(sql, params = []) {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.executeSql(sql, params);
  }

  hydrateUser(row) {
    return {
      id: row.id,
      username: row.username,
      displayName: row.display_name,
      avatar: row.avatar,
      passwordHash: row.password_hash,
      isLocal: row.is_local === 1,
      isSuperuser: row.is_superuser === 1,
      publicKey: row.public_key,
      createdAt: row.created_at,
      lastLogin: row.last_login
    };
  }

  hydrateMessage(row) {
    return {
      id: row.id,
      conversationId: row.conversation_id,
      sender: { id: row.sender_id, name: row.sender_name },
      content: row.content,
      contentType: row.content_type,
      status: row.delivery_status,
      timestamp: row.created_at
    };
  }

  hydrateConversation(row) {
    return {
      id: row.id,
      type: row.type,
      name: row.name,
      description: row.description,
      avatar: row.avatar,
      participants: JSON.parse(row.participants || '[]'),
      lastMessagePreview: row.last_message_preview,
      lastMessageAt: row.last_message_at,
      unreadCount: row.unread_count,
      isArchived: row.is_archived === 1,
      updatedAt: row.updated_at
    };
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

export default new DatabaseService();
