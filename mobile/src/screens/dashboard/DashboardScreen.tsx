import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { AnalysisListItem } from '../../types';

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const { data } = await api.get<AnalysisListItem[]>('/analyses');
      setAnalyses(data.slice(0, 5));
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const firstName = user?.name?.split(' ')[0] || 'there';
  const analysesLimit = user?.plan === 'PREMIUM' ? '∞' : '1';
  const chatsLimit = user?.plan === 'PREMIUM' ? '∞' : '5';

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
      <Text style={styles.greeting}>Welcome back, {firstName} 👋</Text>
      <Text style={styles.sub}>Here's what's happening with your tenancy</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user?.analyses_this_month ?? 0}/{analysesLimit}</Text>
          <Text style={styles.statLabel}>Analyses this month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user?.chats_today ?? 0}/{chatsLimit}</Text>
          <Text style={styles.statLabel}>Chats today</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AnalysesTab', { screen: 'AnalysesUpload' })}>
          <Text style={styles.actionEmoji}>📄</Text>
          <Text style={styles.actionText}>Upload Lease</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ChatTab')}>
          <Text style={styles.actionEmoji}>💬</Text>
          <Text style={styles.actionText}>Ask AI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('DocumentsTab')}>
          <Text style={styles.actionEmoji}>📝</Text>
          <Text style={styles.actionText}>Generate Doc</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Analyses</Text>
      {analyses.length === 0 ? (
        <Text style={styles.empty}>No analyses yet. Upload your first lease to get started.</Text>
      ) : (
        analyses.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={styles.analysisRow}
            onPress={() => navigation.navigate('AnalysesTab', { screen: 'AnalysisDetail', params: { id: a.id } })}
          >
            <View style={styles.analysisInfo}>
              <Text style={styles.analysisFile} numberOfLines={1}>{a.file_name}</Text>
              <Text style={styles.analysisMeta}>{a.emirate || '—'} · {a.status}</Text>
            </View>
            {a.overall_score != null && (
              <View style={[styles.scoreBadge, scoreColor(a.overall_score)]}>
                <Text style={styles.scoreText}>{a.overall_score}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
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
  container: { padding: 20 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#111827' },
  sub: { fontSize: 14, color: '#6b7280', marginTop: 2, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  statValue: { fontSize: 22, fontWeight: '700', color: '#2563eb' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  actionBtn: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb',
  },
  actionEmoji: { fontSize: 22, marginBottom: 6 },
  actionText: { fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  empty: { color: '#9ca3af', fontSize: 14, textAlign: 'center', marginTop: 20 },
  analysisRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb',
  },
  analysisInfo: { flex: 1 },
  analysisFile: { fontSize: 14, fontWeight: '600', color: '#111827' },
  analysisMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  scoreBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  scoreText: { fontWeight: '700', fontSize: 13, color: '#111827' },
});
