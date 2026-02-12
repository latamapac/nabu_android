/**
 * Chat Screen
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import MessageService from '../services/MessageService';
import DatabaseService from '../services/DatabaseService';

export const ChatScreen = ({ route, navigation }) => {
  const { conversationId, title } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title });
    loadMessages();
    
    // Listen for new messages
    MessageService.on('message:sent', handleNewMessage);
    
    return () => {
      MessageService.listeners.delete('message:sent');
    };
  }, []);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const msgs = await MessageService.getMessages(conversationId, { limit: 50 });
      setMessages(msgs.reverse());
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    if (message.conversationId === conversationId) {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    try {
      await MessageService.sendMessage(conversationId, text);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender?.id === 'me';
    
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
        {!isMe && (
          <Text style={styles.senderName}>{item.sender?.name}</Text>
        )}
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
            {item.content}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isMe && (
            <Text style={styles.status}> {item.status === 'sent' ? '✓' : '⏳'}</Text>
          )}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={scrollToBottom}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#666"
          multiline
          maxHeight={100}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  messageList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  bubble: {
    borderRadius: 18,
    padding: 12,
  },
  myBubble: {
    backgroundColor: '#00D084',
  },
  theirBubble: {
    backgroundColor: '#2a2a2a',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myText: {
    color: '#000',
  },
  theirText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  status: {
    color: '#00D084',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: '#0a0a0a',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00D084',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#1a1a1a',
  },
  sendButtonText: {
    fontSize: 20,
    color: '#000',
    marginLeft: 2,
  },
});
