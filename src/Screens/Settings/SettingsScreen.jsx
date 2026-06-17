import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Header, ParentalGate } from '../../Components/UI';
import { useAuth } from '../../Context';
import { LEGAL_URLS, SUPPORT_EMAIL } from '../../Constants';

const SettingsScreen = ({ navigation }) => {
  const { user, stars, logout, deleteAccount } = useAuth();

  // Generic parental-gate: { title, action } — the gate runs `action`
  // only after an adult solves the challenge. Used for BOTH external
  // links (Google Families policy) and account deletion.
  const [gate, setGate] = useState(null);
  const requestGate = (title, action) => setGate({ title, action });
  const runGate = () => {
    const action = gate?.action;
    setGate(null);
    action?.();
  };

  const openLink = (url) => Linking.openURL(url).catch(() => {});
  const contactSupport = () =>
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Little%20Genius%20Support`).catch(() => {});

  // Confirmation → permanent deletion (already behind the gate).
  const confirmDelete = () => {
    Alert.alert(
      'Delete Account?',
      'This permanently removes this profile and all saved progress on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Forever', style: 'destructive', onPress: deleteAccount },
      ],
      { cancelable: true }
    );
  };

  // Every external link is opened behind the parental gate.
  const gatedLink = (title, url) => requestGate(title, () => openLink(url));

  const LEGAL_ROWS = [
    { icon: '🔏', label: 'Privacy Policy', onPress: () => gatedLink('Open Privacy Policy', LEGAL_URLS.PRIVACY) },
    { icon: '📜', label: 'Terms & Conditions', onPress: () => gatedLink('Open Terms', LEGAL_URLS.TERMS) },
    { icon: '🛡️', label: 'Child Safety', onPress: () => gatedLink('Open Child Safety', LEGAL_URLS.CHILD_SAFETY) },
    { icon: '🗑️', label: 'Data Deletion', onPress: () => gatedLink('Open Data Deletion', LEGAL_URLS.DATA_DELETION) },
    { icon: '💬', label: 'Help & Support', onPress: () => requestGate('Contact Support', contactSupport) },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Settings & Profile"
        showBack={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero */}
        <View style={styles.profileHero}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>{user?.avatar || '🦁'}</Text>
            </View>
          </View>
          <Text style={styles.kidName}>{user?.name || 'Student'}</Text>
          <Text style={styles.kidAge}>{user?.age || '4 Years'} Old</Text>
          <View style={styles.starsBadge}>
            <Text style={styles.starsEmoji}>⭐</Text>
            <Text style={styles.starsCount}>{stars || 0} Stars Earned</Text>
          </View>
        </View>

        {/* Account Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔐 Account Settings</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIcon}>📧</Text>
            </View>
            <View style={styles.infoTextBlock}>
              <Text style={styles.infoLabel}>Parent's Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'parent@mail.com'}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIcon}>📡</Text>
            </View>
            <View style={styles.infoTextBlock}>
              <Text style={styles.infoLabel}>App Mode</Text>
              <Text style={styles.infoValue}>100% Offline Learning</Text>
            </View>
          </View>
        </View>

        {/* About Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 About Little Genius</Text>
          <Text style={styles.aboutText}>
            Designed for children in Playgroup, Nursery & Class One.
            Bilingual lessons in English, Urdu, Numbers, Islamic values
            (Duas, 99 Names, Prophets, Wudu & Salah), My Pakistan,
            Moral Stories and IQ Games — all offline, no internet required.
          </Text>

          <View style={styles.featureTags}>
            {['English ABC', 'Urdu Haroof', 'Numbers 1–100', 'Islamic', 'My Pakistan', 'Stories', 'IQ Games'].map((f) => (
              <View key={f} style={styles.featureTag}>
                <Text style={styles.featureTagText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Legal & Privacy Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Legal & Privacy</Text>
          {LEGAL_ROWS.map((row, idx) => (
            <TouchableOpacity
              key={row.label}
              style={[styles.linkRow, idx === LEGAL_ROWS.length - 1 && { borderBottomWidth: 0 }]}
              onPress={row.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.infoIconCircle}>
                <Text style={styles.infoIcon}>{row.icon}</Text>
              </View>
              <Text style={styles.linkLabel}>{row.label}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={logout}
          activeOpacity={0.88}
        >
          <Text style={styles.signOutBtnText}>🚪  Sign Out</Text>
        </TouchableOpacity>

        {/* Delete Account (parents only) */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => requestGate('Delete Account', confirmDelete)}
          activeOpacity={0.88}
        >
          <Text style={styles.deleteBtnText}>🗑️  Delete Account & Data</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Little Genius v1.0.0 · Play Store Edition</Text>
      </ScrollView>

      <ParentalGate
        visible={!!gate}
        title={gate?.title || 'Ask a Grown-Up'}
        onSuccess={runGate}
        onCancel={() => setGate(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F0FF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 60,
  },

  // Profile hero
  profileHero: {
    backgroundColor: '#1E1B4B',
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 18,
    elevation: 8,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#6366F1',
    padding: 4,
    marginBottom: 14,
  },
  avatarCircle: {
    flex: 1,
    borderRadius: 44,
    backgroundColor: '#312E81',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 42 },
  kidName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  kidAge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A5B4FC',
    marginBottom: 14,
  },
  starsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#312E81',
    borderWidth: 1.5,
    borderColor: '#4338CA',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 16,
    gap: 6,
  },
  starsEmoji: { fontSize: 14 },
  starsCount: { fontSize: 14, fontWeight: '900', color: '#FCD34D' },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1E1B4B',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: { fontSize: 18 },
  infoTextBlock: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', marginBottom: 2 },
  infoValue: { fontSize: 13, fontWeight: '800', color: '#1E1B4B' },

  aboutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 14,
  },
  featureTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  featureTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4338CA',
  },

  // Legal link rows
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  linkLabel: { flex: 1, fontSize: 13, fontWeight: '800', color: '#1E1B4B' },
  chevron: { fontSize: 22, color: '#C4B5FD', fontWeight: '900' },

  // Sign out
  signOutBtn: {
    backgroundColor: '#1E1B4B',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    borderBottomWidth: 4,
    borderBottomColor: '#312E81',
  },
  signOutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  // Delete account
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#FCA5A5',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default SettingsScreen;
