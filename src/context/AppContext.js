/**
 * App Context - Offline-First
 * No server required
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import DatabaseService from '../services/DatabaseService';
import AuthService from '../services/AuthService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await DatabaseService.init();
      
      // Initialize auth
      await AuthService.init();
      
      // Check if first user ever
      const firstUser = await AuthService.isFirstUser();
      setIsFirstLaunch(firstUser);
      
      // Check if logged in
      const loggedIn = AuthService.isLoggedIn();
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        setCurrentUser(AuthService.getCurrentUser());
      }
      
      console.log('[App] Initialized - First launch:', firstUser, 'Logged in:', loggedIn);
    } catch (error) {
      console.error('[App] Init failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, password, displayName, avatar) => {
    const user = await AuthService.register(username, password, displayName, avatar);
    setCurrentUser(user);
    setIsLoggedIn(true);
    setIsFirstLaunch(false);
    return user;
  };

  const login = async (username, password) => {
    const user = await AuthService.login(username, password);
    setCurrentUser(user);
    setIsLoggedIn(true);
    return user;
  };

  const logout = async () => {
    await AuthService.logout();
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  const updateProfile = async (updates) => {
    const user = await AuthService.updateProfile(updates);
    setCurrentUser(user);
    return user;
  };

  const value = {
    isLoading,
    isLoggedIn,
    isFirstLaunch,
    currentUser,
    register,
    login,
    logout,
    updateProfile
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
