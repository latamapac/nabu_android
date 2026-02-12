/**
 * Message Bubble Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MessageBubble = ({ message, isMe }) => {
  return (
    <View style={[styles.container, isMe ? styles.myContainer : styles.theirContainer]}>
      {!isMe && (
        <Text style={styles.senderName}>{message.sender?.name}</Text>
      )}
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.text, isMe ? styles.myText : styles.theirText]}>
          {message.content}
        </Text>
      </View>
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        {isMe && <Text style={styles.status}> {message.status === 'sent' ? '✓' : '⏳'}</Text>}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myContainer: {
    alignSelf: 'flex-end',
  },
  theirContainer: {
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
  text: {
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
});
