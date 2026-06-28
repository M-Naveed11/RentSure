import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { AnalysisListItem } from '../../types';

export default function AnalysesListScreen({ navigation }: any) {
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const { data } = await api.get<AnalysisListItem[]>('/analyses');
      setAnalyses(data);
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
    <View style={styles.flex}>
      <FlatList
        data={analyses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No analyses yet. Tap + to upload your first lease.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('AnalysisDetail', { id: item.id })}
          >
            <View style={styles.info}>
              <Text style={styles.file} numberOfLines={1}>{item.file_name}</Text>
              <Text style={styles.meta}>
                {item.emirate || '—'} {item.annual_rent ? `· AED ${item.annual_rent.toLocaleString()}` : ''}
              </Text>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            {item.status === 'PROCESSING' ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : item.overall_score != null ? (
              <View style={[styles.scoreBadge, scoreColor(item.overall_score)]}>
                <Text style={styles.scoreText}>{item.overall_score}</Text>
              </View>
            ) : (
              <View style={[styles.scoreBadge, { backgroundColor: '#fee2e2' }]}>
                <Text style={styles.scoreText}>!</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AnalysesUpload')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function scoreColor(score: number) {
  if (score >= 70) return { backgroundColor: '#dcfce7' };
  if (score >= 40) return { backgroundColor: '#fef9c3' };
  return { backgroundColor: '#fee2e2' };
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  list: { padding: 16 },
  empty: { color: '#9ca3af', fontSize: 14, textAlign: 'center', marginTop: 40 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb',
  },
  info: { flex: 1 },
  file: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  date: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  scoreBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  scoreText: { fontWeight: '700', fontSize: 13, color: '#111827' },
  fab: {
    position: 'absolute', right: 20, bottom: 20, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#2563eb', justifyContent: 'center',
    alignItems: 'center', elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '400', marginTop: -2 },
});
