/**
 * Conversation List Screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image
} from 'react-native';
import UserService from '../services/UserService';
import DatabaseService from '../services/DatabaseService';

export const ConversationListScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const currentUser = UserService.getCurrentUser();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const convs = await DatabaseService.execute(
        'SELECT * FROM conversations WHERE is_archived = 0 ORDER BY updated_at DESC'
      );
      setConversations(convs[0].rows.raw());
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.conversationItem}
      onPress={() => navigation.navigate('Chat', { conversationId: item.id, title: item.name })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar || '👤'}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>
            {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : ''}
          </Text>
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {item.last_message_preview || 'No messages yet'}
        </Text>
      </View>
      {item.unread_count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity 
          style={styles.accountButton}
          onPress={() => navigation.navigate('AccountSwitch')}
        >
          <Text style={styles.avatarText}>{currentUser?.avatar || '👤'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
      />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  accountButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    marginBottom: 8,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  preview: {
    fontSize: 14,
    color: '#888',
  },
  badge: {
    backgroundColor: '#00D084',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
