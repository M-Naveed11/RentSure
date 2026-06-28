import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { api } from '../../api/client';
import { LANGUAGES } from '../../types';

export default function DocumentFormScreen({ route, navigation }: any) {
  const { template } = route.params;
  const [form, setForm] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState('en');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      const { data } = await api.post('/documents/generate', {
        type: template.type,
        language,
        input_data: form,
      });
      navigation.replace('DocumentDetail', { id: data.id });
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Generation failed. Please upgrade to Premium.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.title}>{template.label}</Text>
      <Text style={styles.desc}>{template.desc}</Text>

      <Text style={styles.label}>Document Language</Text>
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
      </View>

      {template.fields.map((f: { key: string; label: string }) => (
        <View key={f.key} style={styles.fieldGroup}>
          <Text style={styles.label}>{f.label}</Text>
          <TextInput
            style={styles.input}
            value={form[f.key] || ''}
            onChangeText={(v) => update(f.key, v)}
            multiline={f.key.includes('reason') || f.key.includes('issues') || f.key.includes('details') || f.key.includes('counter')}
          />
        </View>
      ))}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleGenerate} disabled={generating}>
        {generating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate Document</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  desc: { fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  langRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  langBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  langBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  langText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  langTextActive: { color: '#fff' },
  fieldGroup: { marginBottom: 14 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 10, padding: 12, fontSize: 14,
  },
  error: { color: '#dc2626', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  button: { backgroundColor: '#2563eb', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
