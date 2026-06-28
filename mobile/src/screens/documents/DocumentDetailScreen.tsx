import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Share, Alert,
} from 'react-native';
import { api } from '../../api/client';
import { GeneratedDocument } from '../../types';

export default function DocumentDetailScreen({ route }: any) {
  const { id } = route.params;
  const [doc, setDoc] = useState<GeneratedDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<GeneratedDocument>(`/documents/${id}`);
        setDoc(data);
      } catch {
        Alert.alert('Error', 'Could not load document');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleShare() {
    if (!doc) return;
    try {
      await Share.share({ title: doc.title, message: `${doc.title}\n\n${doc.content}` });
    } catch {
      // ignore
    }
  }

  if (loading || !doc) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{doc.title}</Text>
        <View style={styles.contentBox}>
          <Text style={styles.content}>{doc.content}</Text>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
        <Text style={styles.shareBtnText}>Share / Export</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  container: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  contentBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  content: { fontSize: 13, lineHeight: 20, color: '#374151' },
  shareBtn: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
    backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center',
  },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
