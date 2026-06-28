import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert,
} from 'react-native';
import { api } from '../../api/client';
import { Analysis } from '../../types';
import ScoreCircle from '../../components/ScoreCircle';
import FlagCard from '../../components/FlagCard';

export default function AnalysisDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Analysis>(`/analyses/${id}`);
      setAnalysis(data);
    } catch {
      Alert.alert('Error', 'Could not load analysis');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Poll while processing
  useEffect(() => {
    if (analysis?.status !== 'PROCESSING') return;
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [analysis?.status, load]);

  async function handleDelete() {
    Alert.alert('Delete Analysis', 'Are you sure you want to delete this analysis?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await api.delete(`/analyses/${id}`);
          navigation.goBack();
        },
      },
    ]);
  }

  if (loading || !analysis) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (analysis.status === 'PROCESSING') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.processingText}>Analyzing your lease with AI…</Text>
      </View>
    );
  }

  if (analysis.status === 'FAILED') {
    return (
      <View style={styles.center}>
        <Text style={styles.failedText}>Analysis failed. Please try uploading again.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.scoreSection}>
        <ScoreCircle score={analysis.overall_score ?? 0} />
        <Text style={styles.fileName}>{analysis.file_name}</Text>
      </View>

      {analysis.summary && (
        <View style={styles.summaryBox}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summaryText}>{analysis.summary}</Text>
        </View>
      )}

      {(analysis.annual_rent || analysis.fair_rent_min) && (
        <View style={styles.rentBox}>
          <Text style={styles.sectionTitle}>Rent Comparison</Text>
          <View style={styles.rentRow}>
            <View>
              <Text style={styles.rentLabel}>Your Rent</Text>
              <Text style={styles.rentValue}>AED {analysis.annual_rent?.toLocaleString() ?? '—'}</Text>
            </View>
            <View>
              <Text style={styles.rentLabel}>Fair Range</Text>
              <Text style={styles.rentValue}>
                {analysis.fair_rent_min && analysis.fair_rent_max
                  ? `${analysis.fair_rent_min.toLocaleString()} - ${analysis.fair_rent_max.toLocaleString()}`
                  : '—'}
              </Text>
            </View>
          </View>
          {analysis.rent_verdict && <Text style={styles.verdict}>{analysis.rent_verdict}</Text>}
        </View>
      )}

      {!!analysis.red_flags?.length && (
        <View style={styles.flagSection}>
          <Text style={styles.sectionTitle}>🔴 Red Flags ({analysis.red_flags.length})</Text>
          {analysis.red_flags.map((f, i) => <FlagCard key={i} flag={f} type="red" />)}
        </View>
      )}

      {!!analysis.yellow_flags?.length && (
        <View style={styles.flagSection}>
          <Text style={styles.sectionTitle}>🟡 Yellow Flags ({analysis.yellow_flags.length})</Text>
          {analysis.yellow_flags.map((f, i) => <FlagCard key={i} flag={f} type="yellow" />)}
        </View>
      )}

      {!!analysis.green_flags?.length && (
        <View style={styles.flagSection}>
          <Text style={styles.sectionTitle}>🟢 Green Flags ({analysis.green_flags.length})</Text>
          {analysis.green_flags.map((f, i) => <FlagCard key={i} flag={f} type="green" />)}
        </View>
      )}

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteBtnText}>Delete Analysis</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb', padding: 20 },
  container: { padding: 20 },
  processingText: { marginTop: 16, color: '#6b7280', fontSize: 14 },
  failedText: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
  scoreSection: { alignItems: 'center', marginBottom: 20 },
  fileName: { marginTop: 12, fontSize: 14, fontWeight: '600', color: '#374151' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  summaryBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  summaryText: { fontSize: 13, color: '#374151', lineHeight: 19 },
  rentBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  rentRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  rentLabel: { fontSize: 11, color: '#9ca3af' },
  rentValue: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 2 },
  verdict: { marginTop: 12, fontSize: 13, color: '#2563eb', fontWeight: '600' },
  flagSection: { marginBottom: 16 },
  deleteBtn: { padding: 14, alignItems: 'center', marginTop: 8, marginBottom: 30 },
  deleteBtnText: { color: '#dc2626', fontWeight: '600', fontSize: 14 },
});
