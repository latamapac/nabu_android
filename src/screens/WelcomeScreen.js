/**
 * Welcome Screen - First Time Setup
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView
} from 'react-native';

export const WelcomeScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🏛️</Text>
        <Text style={styles.title}>Welcome to Nabu</Text>
        <Text style={styles.subtitle}>
          Your personal, private, offline-first messenger
        </Text>

        <View style={styles.features}>
          <Feature icon="🔒" title="Private" desc="All data stays on your device" />
          <Feature icon="📴" title="Offline" desc="No internet required" />
          <Feature icon="🔐" title="Secure" desc="Local encryption" />
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Your data never leaves this device
        </Text>
      </View>
    </ScrollView>
  );
};

const Feature = ({ icon, title, desc }) => (
  <View style={styles.feature}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDesc}>{desc}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
  },
  features: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  feature: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00D084',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    marginTop: 20,
    fontSize: 12,
    color: '#555',
  },
});
