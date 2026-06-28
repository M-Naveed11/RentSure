import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { pick, types, errorCodes, isErrorWithCode, DocumentPickerResponse } from '@react-native-documents/picker';
import { api } from '../../api/client';

export default function AnalysesUploadScreen({ navigation }: any) {
  const [file, setFile] = useState<DocumentPickerResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function pickFile() {
    try {
      const [result] = await pick({ type: types.pdf });
      setFile(result);
      setError('');
    } catch (e) {
      if (!isErrorWithCode(e) || e.code !== errorCodes.OPERATION_CANCELED) {
        setError('Could not select file');
      }
    }
  }

  async function uploadAndAnalyze() {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name || 'lease.pdf',
        type: 'application/pdf',
      } as any);

      const { data: analysis } = await api.post('/analyses/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await api.post(`/analyses/analyze/${analysis.id}`);

      navigation.replace('AnalysisDetail', { id: analysis.id });
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.dropZone} onPress={pickFile} disabled={uploading}>
        <Text style={styles.icon}>📄</Text>
        {file ? (
          <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
        ) : (
          <>
            <Text style={styles.dropTitle}>Tap to select your lease PDF</Text>
            <Text style={styles.dropSub}>PDF only, max 10MB</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.hint}>Ejari, RERA, or standard lease contracts</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, (!file || uploading) && styles.buttonDisabled]}
        onPress={uploadAndAnalyze}
        disabled={!file || uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Analyse Lease</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 20 },
  dropZone: {
    borderWidth: 2, borderColor: '#d1d5db', borderStyle: 'dashed', borderRadius: 14,
    paddingVertical: 48, alignItems: 'center', backgroundColor: '#fff', marginTop: 12,
  },
  icon: { fontSize: 40, marginBottom: 12 },
  dropTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  dropSub: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  fileName: { fontSize: 14, fontWeight: '600', color: '#2563eb', paddingHorizontal: 20 },
  hint: { textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 12 },
  error: { color: '#dc2626', textAlign: 'center', marginTop: 16, fontSize: 13 },
  button: {
    backgroundColor: '#2563eb', borderRadius: 10, padding: 16,
    alignItems: 'center', marginTop: 24,
  },
  buttonDisabled: { backgroundColor: '#93c5fd' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
