/**
 * Splash Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🏛️</Text>
      <Text style={styles.title}>Nabu Messenger</Text>
      <Text style={styles.subtitle}>Loading...</Text>
      <ActivityIndicator size="large" color="#00D084" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
  loader: {
    marginTop: 30,
  },
});
