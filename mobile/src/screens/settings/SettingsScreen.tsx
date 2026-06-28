import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface Usage {
  plan: string;
  analyses_this_month: number;
  analyses_limit: number;
  chats_today: number;
  chats_limit: number;
}

export default function SettingsScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    api.get<Usage>('/users/usage').then(({ data }) => setUsage(data)).catch(() => {});
  }, []);

  async function handleCheckout(plan: string) {
    setCheckoutLoading(plan);
    try {
      const { data } = await api.post('/payments/checkout', { plan });
      await Linking.openURL(data.checkout_url);
    } catch {
      Alert.alert('Error', 'Could not start checkout');
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handlePortal() {
    try {
      const { data } = await api.get('/payments/portal');
      await Linking.openURL(data.portal_url);
    } catch {
      Alert.alert('Error', 'Could not open billing portal');
    }
  }

  function confirmLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  }

  const isPremium = user?.plan === 'PREMIUM';
  const initials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.profileRow} onPress={() => navigation.navigate('Profile')}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Usage</Text>
      <View style={styles.card}>
        <View style={styles.usageRow}>
          <Text style={styles.usageLabel}>Analyses this month</Text>
          <Text style={styles.usageValue}>
            {usage?.analyses_this_month ?? 0} / {usage?.analyses_limit === 999 ? '∞' : usage?.analyses_limit ?? '—'}
          </Text>
        </View>
        <View style={styles.usageRow}>
          <Text style={styles.usageLabel}>Chats today</Text>
          <Text style={styles.usageValue}>
            {usage?.chats_today ?? 0} / {usage?.chats_limit === 999 ? '∞' : usage?.chats_limit ?? '—'}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Billing</Text>
      <View style={styles.card}>
        {isPremium ? (
          <>
            <Text style={styles.planBadge}>✓ Premium Plan Active</Text>
            <TouchableOpacity style={styles.outlineBtn} onPress={handlePortal}>
              <Text style={styles.outlineBtnText}>Manage Subscription</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => handleCheckout('monthly')}
              disabled={!!checkoutLoading}
            >
              {checkoutLoading === 'monthly' ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.upgradeBtnText}>Upgrade — AED 29/month</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.upgradeBtn, styles.upgradeBtnOutline]}
              onPress={() => handleCheckout('lifetime')}
              disabled={!!checkoutLoading}
            >
              {checkoutLoading === 'lifetime' ? <ActivityIndicator color="#2563eb" /> : (
                <Text style={styles.upgradeBtnOutlineText}>Lifetime — AED 199 one-time</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
        <Text style={styles.logoutBtnText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20, paddingBottom: 40 },
  profileRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#e5e7eb',
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#dbeafe',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#2563eb' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  profileEmail: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  chevron: { fontSize: 22, color: '#9ca3af' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  usageLabel: { fontSize: 13, color: '#6b7280' },
  usageValue: { fontSize: 13, fontWeight: '700', color: '#111827' },
  planBadge: { fontSize: 14, fontWeight: '700', color: '#16a34a', marginBottom: 12 },
  outlineBtn: { borderWidth: 1, borderColor: '#2563eb', borderRadius: 10, padding: 14, alignItems: 'center' },
  outlineBtnText: { color: '#2563eb', fontWeight: '700', fontSize: 14 },
  upgradeBtn: { backgroundColor: '#2563eb', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 10 },
  upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  upgradeBtnOutline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#2563eb' },
  upgradeBtnOutlineText: { color: '#2563eb', fontWeight: '700', fontSize: 14 },
  logoutBtn: { padding: 14, alignItems: 'center', marginTop: 4 },
  logoutBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 14 },
});
