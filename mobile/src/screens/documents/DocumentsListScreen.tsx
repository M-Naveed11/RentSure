import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { GeneratedDocument, DOCUMENT_TEMPLATES } from '../../types';

export default function DocumentsListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [docs, setDocs] = useState<GeneratedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isPremium = user?.plan === 'PREMIUM';

  async function load() {
    try {
      const { data } = await api.get<GeneratedDocument[]>('/documents');
      setDocs(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
    >
      {!isPremium && (
        <View style={styles.upsell}>
          <Text style={styles.upsellText}>🔒 Document generation requires Premium plan</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Templates</Text>
      {DOCUMENT_TEMPLATES.map((t) => (
        <TouchableOpacity
          key={t.type}
          style={styles.templateCard}
          onPress={() => navigation.navigate('DocumentForm', { template: t })}
        >
          <Text style={styles.templateLabel}>{t.label}</Text>
          <Text style={styles.templateDesc}>{t.desc}</Text>
        </TouchableOpacity>
      ))}

      {docs.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Your Documents</Text>
          {docs.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={styles.docRow}
              onPress={() => navigation.navigate('DocumentDetail', { id: d.id })}
            >
              <Text style={styles.docTitle} numberOfLines={1}>{d.title}</Text>
              <Text style={styles.docDate}>{new Date(d.created_at).toLocaleDateString()}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  container: { padding: 16 },
  upsell: { backgroundColor: '#fffbeb', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#fde68a' },
  upsellText: { fontSize: 13, color: '#92400e', textAlign: 'center', fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  templateCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  templateLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  templateDesc: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  docRow: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between',
  },
  docTitle: { fontSize: 13, fontWeight: '600', color: '#111827', flex: 1 },
  docDate: { fontSize: 11, color: '#9ca3af', marginLeft: 8 },
});
