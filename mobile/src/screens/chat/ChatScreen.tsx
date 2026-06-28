import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { api } from '../../api/client';
import { ChatMessage } from '../../types';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
  { code: 'ur', label: 'UR' },
  { code: 'hi', label: 'HI' },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const { data } = await api.get<ChatMessage[]>('/chat/history');
      setMessages(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content,
      language,
      analysis_id: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const { data } = await api.post<ChatMessage>('/chat/message', { content, language });
      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, data]);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  async function clearChat() {
    Alert.alert('Clear Chat', 'Delete all chat history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive',
        onPress: async () => {
          await api.delete('/chat/clear');
          setMessages([]);
        },
      },
    ]);
  }

  const isRTL = language === 'ar' || language === 'ur';

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.langRow}>
        {LANGUAGES.map((l) => (
          <TouchableOpacity
            key={l.code}
            style={[styles.langBtn, language === l.code && styles.langBtnActive]}
            onPress={() => setLanguage(l.code)}
          >
            <Text style={[styles.langText, language === l.code && styles.langTextActive]}>{l.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.clearBtn} onPress={clearChat}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Ask me anything about your tenancy rights, UAE laws, or lease terms.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[
            styles.bubble,
            item.role === 'USER' ? styles.userBubble : styles.assistantBubble,
          ]}>
            <Text style={[
              styles.bubbleText,
              item.role === 'USER' && styles.userText,
              isRTL && styles.rtlText,
            ]}>
              {item.content}
            </Text>
          </View>
        )}
      />

      {sending && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.typingText}>AI is typing…</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, isRTL && styles.rtlText]}
          placeholder="Type your question…"
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={sending}>
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  langRow: {
    flexDirection: 'row', padding: 10, gap: 6, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  langBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f3f4f6' },
  langBtnActive: { backgroundColor: '#2563eb' },
  langText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  langTextActive: { color: '#fff' },
  clearBtn: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 6 },
  clearBtnText: { fontSize: 12, color: '#dc2626', fontWeight: '600' },
  messageList: { padding: 16, flexGrow: 1 },
  empty: { textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 40, paddingHorizontal: 20 },
  bubble: { maxWidth: '85%', borderRadius: 14, padding: 12, marginBottom: 10 },
  userBubble: { backgroundColor: '#2563eb', alignSelf: 'flex-end' },
  assistantBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#e5e7eb' },
  bubbleText: { fontSize: 14, lineHeight: 20, color: '#111827' },
  userText: { color: '#fff' },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  typingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 6, gap: 6 },
  typingText: { fontSize: 12, color: '#9ca3af' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 10, gap: 8,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb',
  },
  input: {
    flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 14, maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#2563eb',
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnText: { color: '#fff', fontSize: 16 },
});
