/**
 * User Service - React Native
 * Multi-user account management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from './DatabaseService';

class UserService {
  constructor() {
    this.currentUser = null;
    this.accounts = [];
  }

  async init() {
    // Load saved accounts
    const accountsJson = await AsyncStorage.getItem('nabu_accounts');
    if (accountsJson) {
      this.accounts = JSON.parse(accountsJson);
    }

    // Load last active user
    const lastUserId = await AsyncStorage.getItem('nabu_last_user');
    if (lastUserId) {
      this.currentUser = this.accounts.find(a => a.id === lastUserId) || null;
    }
  }

  async register(username, password, avatar = '👤') {
    // Validate
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if exists
    if (this.accounts.find(a => a.username === username)) {
      throw new Error('Account already exists on this device');
    }

    const account = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username,
      passwordHash: await this.hashPassword(password),
      avatar,
      serverUrl: 'http://localhost:3001',
      createdAt: Date.now(),
      lastLogin: Date.now()
    };

    this.accounts.push(account);
    await this.saveAccounts();

    return this.login(username, password);
  }

  async login(username, password) {
    const account = this.accounts.find(a => a.username === username);
    if (!account) {
      throw new Error('Account not found');
    }

    const passwordHash = await this.hashPassword(password);
    if (account.passwordHash !== passwordHash) {
      throw new Error('Invalid password');
    }

    account.lastLogin = Date.now();
    account.session = {
      token: this.generateToken(),
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000)
    };

    this.currentUser = account;
    await this.saveAccounts();
    await AsyncStorage.setItem('nabu_last_user', account.id);

    return account;
  }

  async logout() {
    if (this.currentUser) {
      const account = this.accounts.find(a => a.id === this.currentUser.id);
      if (account) {
        account.session = null;
      }
    }
    this.currentUser = null;
    await AsyncStorage.removeItem('nabu_last_user');
    await this.saveAccounts();
  }

  async switchAccount(userId) {
    const account = this.accounts.find(a => a.id === userId);
    if (!account) {
      throw new Error('Account not found');
    }

    this.currentUser = account;
    await AsyncStorage.setItem('nabu_last_user', userId);
    return account;
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getAccounts() {
    return this.accounts.map(a => ({
      id: a.id,
      username: a.username,
      avatar: a.avatar,
      lastLogin: a.lastLogin,
      isActive: a.id === this.currentUser?.id
    }));
  }

  async deleteAccount(userId) {
    this.accounts = this.accounts.filter(a => a.id !== userId);
    if (this.currentUser?.id === userId) {
      this.currentUser = null;
      await AsyncStorage.removeItem('nabu_last_user');
    }
    await this.saveAccounts();
  }

  async saveAccounts() {
    await AsyncStorage.setItem('nabu_accounts', JSON.stringify(this.accounts));
  }

  async hashPassword(password) {
    // Simple hash - use bcrypt in production
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'nabu-salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  generateToken() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
  }
}

export default new UserService();
