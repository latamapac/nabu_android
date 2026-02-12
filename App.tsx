/**
 * Nabu Messenger - Android App (Offline-First)
 * Fully local - no server required
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, useColorScheme } from 'react-native';

// Services
import DatabaseService from './src/services/DatabaseService';
import AuthService from './src/services/AuthService';
import MessageService from './src/services/MessageService';

// Screens
import { SplashScreen } from './src/screens/SplashScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ConversationListScreen } from './src/screens/ConversationListScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { NewConversationScreen } from './src/screens/NewConversationScreen';

// Context
import { AppProvider, useApp } from './src/context/AppContext';

const Stack = createStackNavigator();

function Navigation() {
  const { isLoading, isLoggedIn, isFirstLaunch } = useApp();
  const isDarkMode = useColorScheme() === 'dark';

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#0a0a0a' : '#ffffff'}
      />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff' }
          }}
        >
          {!isLoggedIn ? (
            // Auth Stack
            isFirstLaunch ? (
              // First time - show welcome
              <>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            ) : (
              // Return user - show login
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            )
          ) : (
            // Main Stack
            <>
              <Stack.Screen 
                name="Conversations" 
                component={ConversationListScreen}
                options={{ gestureEnabled: false }}
              />
              <Stack.Screen name="Chat" component={ChatScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="NewConversation" component={NewConversationScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Navigation />
    </AppProvider>
  );
}
