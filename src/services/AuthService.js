/**
 * Auth Service - Local Only
 * No server required - works completely offline
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from './DatabaseService';

// Simple hash function (in production, use proper hashing)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'nabu-local-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

class AuthService {
  constructor() {
    this.currentUser = null;
    this.sessionToken = null;
  }

  async init() {
    // Restore session if exists
    const session = await AsyncStorage.getItem('nabu_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.expiresAt > Date.now()) {
          this.currentUser = parsed.user;
          this.sessionToken = parsed.token;
        } else {
          await this.logout();
        }
      } catch {
        await AsyncStorage.removeItem('nabu_session');
      }
    }
  }

  // Register new user (LOCAL ONLY)
  async register(username, password, displayName, avatar = '👤') {
    // Validation
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }

    // Check if user exists
    const existing = await DatabaseService.getUserByUsername(username);
    if (existing) {
      throw new Error('Username already taken');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Get user count (first user becomes superuser)
    const userCount = await DatabaseService.getUserCount();
    const isSuperuser = userCount === 0;

    // Create user
    const user = await DatabaseService.createUser({
      username,
      displayName: displayName || username,
      avatar,
      passwordHash,
      isSuperuser
    });

    // Create session
    await this.createSession(user);

    console.log(`[Auth] Registered user: ${username} (superuser: ${isSuperuser})`);
    return user;
  }

  // Login (LOCAL ONLY)
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Username and password required');
    }

    // Get user
    const user = await DatabaseService.getUserByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Verify password
    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.passwordHash) {
      throw new Error('Invalid username or password');
    }

    // Update last login
    await DatabaseService.updateLastLogin(user.id);

    // Create session
    await this.createSession(user);

    console.log(`[Auth] Logged in: ${username}`);
    return user;
  }

  // Create session
  async createSession(user) {
    this.sessionToken = `session-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
    this.currentUser = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      isSuperuser: user.isSuperuser
    };

    // Store session
    await AsyncStorage.setItem('nabu_session', JSON.stringify({
      token: this.sessionToken,
      user: this.currentUser,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    }));
  }

  // Logout
  async logout() {
    this.currentUser = null;
    this.sessionToken = null;
    await AsyncStorage.removeItem('nabu_session');
    await AsyncStorage.removeItem('nabu_current_user');
  }

  // Check if logged in
  isLoggedIn() {
    return !!this.currentUser && !!this.sessionToken;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    if (!this.currentUser) {
      throw new Error('Not logged in');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    // Verify current password
    const user = await DatabaseService.getUserById(this.currentUser.id);
    const currentHash = await hashPassword(currentPassword);
    
    if (currentHash !== user.passwordHash) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    const newHash = await hashPassword(newPassword);
    await DatabaseService.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newHash, user.id]
    );

    return true;
  }

  // Update profile
  async updateProfile(updates) {
    if (!this.currentUser) {
      throw new Error('Not logged in');
    }

    const allowedFields = ['displayName', 'avatar'];
    const setClause = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClause.push(`${field.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)} = ?`);
        values.push(updates[field]);
      }
    }

    if (setClause.length === 0) return;

    values.push(this.currentUser.id);
    await DatabaseService.execute(
      `UPDATE users SET ${setClause.join(', ')} WHERE id = ?`,
      values
    );

    // Update current user
    Object.assign(this.currentUser, updates);
    await this.createSession(this.currentUser);

    return this.currentUser;
  }

  // Check if first user (for initial setup)
  async isFirstUser() {
    const count = await DatabaseService.getUserCount();
    return count === 0;
  }
}

export default new AuthService();
