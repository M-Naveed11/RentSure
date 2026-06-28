import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FlagItem } from '../types';

interface Props {
  flag: FlagItem;
  type: 'red' | 'yellow' | 'green';
}

const COLORS = {
  red: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: '🔴' },
  yellow: { bg: '#fefce8', border: '#fef08a', text: '#854d0e', icon: '🟡' },
  green: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: '🟢' },
};

export default function FlagCard({ flag, type }: Props) {
  const [open, setOpen] = useState(false);
  const c = COLORS[type];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.bg, borderColor: c.border }]}
      onPress={() => setOpen(!open)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{c.icon}</Text>
        <Text style={[styles.clause, { color: c.text }]} numberOfLines={open ? undefined : 2}>
          {flag.clause}
        </Text>
      </View>
      {open && (
        <View style={styles.body}>
          <Text style={styles.label}>Issue</Text>
          <Text style={styles.text}>{flag.issue}</Text>
          {flag.law_reference && (
            <>
              <Text style={styles.label}>Law Reference</Text>
              <Text style={styles.text}>{flag.law_reference}</Text>
            </>
          )}
          <Text style={styles.label}>Recommendation</Text>
          <Text style={styles.text}>{flag.recommendation}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  icon: { fontSize: 16, marginRight: 8 },
  clause: { flex: 1, fontSize: 14, fontWeight: '600' },
  body: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)' },
  label: { fontSize: 11, fontWeight: '700', color: '#6b7280', marginTop: 8, textTransform: 'uppercase' },
  text: { fontSize: 13, color: '#374151', marginTop: 2, lineHeight: 18 },
});
