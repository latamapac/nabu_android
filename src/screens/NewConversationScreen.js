/**
 * New Conversation Screen
 * Create local chat
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import DatabaseService from '../services/DatabaseService';
import { useApp } from '../context/AppContext';

export const NewConversationScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('💬');
  const { currentUser } = useApp();

  const avatars = ['💬', '👤', '👥', '💼', '🏠', '🎮', '📚', '💡', '🎯', '🎨'];

  const createConversation = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    try {
      const conversation = await DatabaseService.createConversation({
        name: name.trim(),
        avatar,
        participants: [currentUser?.id]
      });

      navigation.replace('Chat', {
        conversationId: conversation.id,
        title: conversation.name
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create conversation');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Conversation</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Choose Avatar</Text>
        <View style={styles.avatars}>
          {avatars.map(a => (
            <TouchableOpacity
              key={a}
              style={[styles.avatar, avatar === a && styles.avatarSelected]}
              onPress={() => setAvatar(a)}
            >
              <Text style={styles.avatarText}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Conversation name"
          placeholderTextColor="#666"
          autoFocus
        />

        <TouchableOpacity 
          style={[styles.button, !name.trim() && styles.buttonDisabled]}
          onPress={createConversation}
          disabled={!name.trim()}
        >
          <Text style={styles.buttonText}>Create</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  back: {
    fontSize: 24,
    color: '#00D084',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  avatars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
  },
  avatarSelected: {
    backgroundColor: '#00D084',
  },
  avatarText: {
    fontSize: 28,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#00D084',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#1a1a1a',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
