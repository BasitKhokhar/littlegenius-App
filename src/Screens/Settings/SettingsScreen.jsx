import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Switch,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Header, ParentalGate } from '../../Components/UI';
import { Card, Button, Badge } from '../../Components/Common';
import { useAuth, useDialog, useNotifications, useVoice } from '../../Context';
import { useTheme } from '../../Context/ThemeContext';
import { LEGAL_URLS, SUPPORT_EMAIL } from '../../Constants';
import SpeechEngine from '../../Utils/speechEngine';
import { SPEECH_PHRASES } from '../../Data/speechCatalog';
import { Spacing, Radius, textStyles, coloredShadow } from '../../Theme';
import { useTabBarClearance } from '../../Hooks';

// Grown-up-friendly preset reminder times (no extra native date-picker dep).
const TIME_PRESETS = [
  { label: 'Morning', time: '8:00 AM', hour: 8, minute: 0 },
  { label: 'Afternoon', time: '4:00 PM', hour: 16, minute: 0 },
  { label: 'Evening', time: '7:00 PM', hour: 19, minute: 0 },
];

const formatTime = (h, m) => {
  const period = h >= 12 ? 'PM' : 'AM';
  const hr12 = h % 12 === 0 ? 12 : h % 12;
  return `${hr12}:${String(m).padStart(2, '0')} ${period}`;
};

const SettingsScreen = ({ navigation }) => {
  const { user, stars, logout, deleteAccount } = useAuth();
  const { showConfirm } = useDialog();
  const { colors, isDark, toggle } = useTheme();
  const { persona, setPersona } = useVoice();
  const { enabled: remindersOn, hour, minute, setEnabled, setTime } = useNotifications();

  // Preview the chosen voice by speaking a short line in it.
  const previewVoice = (next) => {
    setPersona(next);
    SpeechEngine.speak(
      next === 'kid' ? SPEECH_PHRASES.VOICE_PREVIEW_KID : SPEECH_PHRASES.VOICE_PREVIEW_TEACHER,
      'en-US',
    );
  };
  const bottomPad = useTabBarClearance();

  const [gate, setGate] = useState(null);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const requestGate = (title, action) => setGate({ title, action });
  const runGate = () => {
    const action = gate?.action;
    setGate(null);
    action?.();
  };

  // Toggle daily reminders. If the OS permission is denied, guide the grown-up
  // to system settings and leave the switch off.
  const toggleReminder = async (value) => {
    const ok = await setEnabled(value);
    if (value && !ok) {
      showConfirm({
        title: 'Notifications Are Off',
        message:
          'To get daily learning reminders, please turn on notifications for Little Genius in your device settings.',
        emoji: '🔔',
        variant: 'confirm',
        confirmLabel: 'Open Settings',
        cancelLabel: 'Not Now',
        onConfirm: () => Linking.openSettings().catch(() => {}),
      });
    }
  };

  const pickTime = (h, m) => {
    setTime(h, m);
    setTimePickerVisible(false);
  };

  const openLink = (url) => Linking.openURL(url).catch(() => {});
  const contactSupport = () =>
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Little%20Genius%20Support`).catch(() => {});

  const confirmDelete = () => {
    showConfirm({
      title: 'Reset Profile?',
      message: 'This permanently removes this profile and all saved progress on this device. This cannot be undone.',
      emoji: '🗑️',
      variant: 'error',
      confirmLabel: 'Reset Forever',
      cancelLabel: 'Cancel',
      onConfirm: deleteAccount,
    });
  };

  const confirmSwitch = () => {
    showConfirm({
      title: 'Switch Profile?',
      message: "You'll go back to the profile setup screen. Saved progress stays on this device.",
      emoji: '🔄',
      variant: 'confirm',
      confirmLabel: 'Switch',
      cancelLabel: 'Cancel',
      onConfirm: logout,
    });
  };

  const gatedLink = (title, url) => requestGate(title, () => openLink(url));

  const LEGAL_ROWS = [
    { icon: '🔏', label: 'Privacy Policy', onPress: () => gatedLink('Open Privacy Policy', LEGAL_URLS.PRIVACY) },
    { icon: '📜', label: 'Terms & Conditions', onPress: () => gatedLink('Open Terms', LEGAL_URLS.TERMS) },
    { icon: '🛡️', label: 'Child Safety', onPress: () => gatedLink('Open Child Safety', LEGAL_URLS.CHILD_SAFETY) },
    { icon: '🗑️', label: 'Data Deletion', onPress: () => gatedLink('Open Data Deletion', LEGAL_URLS.DATA_DELETION) },
    { icon: '💬', label: 'Help & Support', onPress: () => requestGate('Contact Support', contactSupport) },
  ];

  const s = makeStyles(colors);

  const InfoRow = ({ icon, label, value, last }) => (
    <View style={[s.infoRow, last && { borderBottomWidth: 0 }]}>
      <View style={s.infoIconCircle}>
        <Text style={styles.infoIcon}>{icon}</Text>
      </View>
      <View style={styles.infoTextBlock}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header title="Settings & Profile" showBack={false} />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false}>
        {/* Profile Hero */}
        <LinearGradient
          colors={colors.gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.profileHero, coloredShadow(colors.brandSurface, 'lg')]}
        >
          <View style={styles.avatarRing}>
            <View style={[styles.avatarCircle, { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
              <Text style={styles.avatarEmoji}>{user?.avatar || '🦁'}</Text>
            </View>
          </View>
          <Text style={styles.kidName}>{user?.name || 'Student'}</Text>
          <Text style={styles.kidAge}>{user?.age || '4 Years'} Old</Text>
          <Badge label={`${stars || 0} Stars Earned`} icon="⭐" tone="glass" style={{ marginTop: Spacing.md }} />
        </LinearGradient>

        {/* Appearance */}
        <Card elevation="sm" style={styles.card}>
          <Text style={s.cardTitle}>🎨 Appearance</Text>
          <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
            <View style={s.infoIconCircle}>
              <Text style={styles.infoIcon}>{isDark ? '🌙' : '☀️'}</Text>
            </View>
            <View style={styles.infoTextBlock}>
              <Text style={s.infoValue}>Dark Mode</Text>
              <Text style={s.infoLabel}>{isDark ? 'On' : 'Off'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggle}
              trackColor={{ false: colors.borderStrong, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Voice */}
        <Card elevation="sm" style={styles.card}>
          <Text style={s.cardTitle}>🎙️ Voice</Text>
          <Text style={[s.aboutText, { marginBottom: Spacing.md }]}>
            Choose who reads the lessons aloud. Tap to hear a preview.
          </Text>
          {[
            { key: 'teacher', emoji: '👩‍🏫', label: 'Teacher', hint: 'Warm, clear grown-up voice' },
            { key: 'kid', emoji: '🧒', label: 'Kid Voice', hint: 'Playful and fun' },
          ].map((v) => {
            const active = persona === v.key;
            return (
              <TouchableOpacity
                key={v.key}
                style={[s.timeChip, active && s.timeChipActive]}
                onPress={() => previewVoice(v.key)}
                activeOpacity={0.85}
              >
                <View style={s.infoIconCircle}>
                  <Text style={styles.infoIcon}>{v.emoji}</Text>
                </View>
                <View style={[styles.infoTextBlock, { marginLeft: Spacing.md }]}>
                  <Text style={[s.timeChipLabel, active && s.timeChipTextActive]}>{v.label}</Text>
                  <Text style={s.infoLabel}>{v.hint}</Text>
                </View>
                {active && <Text style={[s.timeValue, { marginRight: 0 }]}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* Reminders */}
        <Card elevation="sm" style={styles.card}>
          <Text style={s.cardTitle}>🔔 Reminders</Text>
          <View style={[s.infoRow, !remindersOn && { borderBottomWidth: 0 }]}>
            <View style={s.infoIconCircle}>
              <Text style={styles.infoIcon}>⏰</Text>
            </View>
            <View style={styles.infoTextBlock}>
              <Text style={s.infoValue}>Daily Learning Reminder</Text>
              <Text style={s.infoLabel}>{remindersOn ? 'On' : 'Off'}</Text>
            </View>
            <Switch
              value={remindersOn}
              onValueChange={toggleReminder}
              trackColor={{ false: colors.borderStrong, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          {remindersOn && (
            <TouchableOpacity
              style={[s.linkRow, { borderBottomWidth: 0 }]}
              onPress={() => requestGate('Set Reminder Time', () => setTimePickerVisible(true))}
              activeOpacity={0.7}
            >
              <View style={s.infoIconCircle}>
                <Text style={styles.infoIcon}>🕒</Text>
              </View>
              <View style={styles.infoTextBlock}>
                <Text style={s.infoValue}>Reminder Time</Text>
                <Text style={s.infoLabel}>Tap to change</Text>
              </View>
              <Text style={s.timeValue}>{formatTime(hour, minute)}</Text>
              <Text style={s.chevron}>›</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Profile */}
        <Card elevation="sm" style={styles.card}>
          <Text style={s.cardTitle}>🧒 Profile</Text>
          <InfoRow icon="🎂" label="Age" value={user?.age || '4 Years'} />
          <InfoRow icon="📡" label="App Mode" value="100% Offline Learning" last />
        </Card>

        {/* About */}
        <Card elevation="sm" style={styles.card}>
          <Text style={s.cardTitle}>📚 About Little Genius</Text>
          <Text style={s.aboutText}>
            Designed for children in Playgroup, Nursery & Class One. Bilingual lessons in English,
            Urdu, Numbers, Islamic values (Duas, 99 Names, Prophets, Wudu & Salah), My Pakistan,
            Moral Stories and IQ Games — all offline, no internet required.
          </Text>
          <View style={styles.featureTags}>
            {['English ABC', 'Urdu Haroof', 'Numbers 1–100', 'Islamic', 'My Pakistan', 'Stories', 'IQ Games'].map((f) => (
              <Badge key={f} label={f} tone="tonal" />
            ))}
          </View>
        </Card>

        {/* Legal & Privacy */}
        <Card elevation="sm" style={styles.card}>
          <Text style={s.cardTitle}>📋 Legal & Privacy</Text>
          {LEGAL_ROWS.map((row, idx) => (
            <TouchableOpacity
              key={row.label}
              style={[s.linkRow, idx === LEGAL_ROWS.length - 1 && { borderBottomWidth: 0 }]}
              onPress={row.onPress}
              activeOpacity={0.7}
            >
              <View style={s.infoIconCircle}>
                <Text style={styles.infoIcon}>{row.icon}</Text>
              </View>
              <Text style={s.linkLabel}>{row.label}</Text>
              <Text style={s.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </Card>

        <Button title="Switch Profile" icon="🔄" variant="primary" size="lg" onPress={confirmSwitch} style={styles.actionBtn} />
        <Button title="Reset Profile & Data" icon="🗑️" variant="danger" size="md" onPress={() => requestGate('Reset Profile', confirmDelete)} style={styles.actionBtn} />

        <Text style={s.versionText}>Little Genius v1.0.0 · Play Store Edition</Text>
      </ScrollView>

      <ParentalGate
        visible={!!gate}
        title={gate?.title || 'Ask a Grown-Up'}
        onSuccess={runGate}
        onCancel={() => setGate(null)}
      />

      <Modal
        visible={timePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimePickerVisible(false)}
      >
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>🕒 Reminder Time</Text>
            <Text style={s.modalSubtitle}>
              When should we remind {user?.name || 'your child'} to learn?
            </Text>
            {TIME_PRESETS.map((p) => {
              const active = p.hour === hour && p.minute === minute;
              return (
                <TouchableOpacity
                  key={p.label}
                  style={[s.timeChip, active && s.timeChipActive]}
                  onPress={() => pickTime(p.hour, p.minute)}
                  activeOpacity={0.85}
                >
                  <Text style={[s.timeChipLabel, active && s.timeChipTextActive]}>{p.label}</Text>
                  <Text style={[s.timeChipTime, active && s.timeChipTextActive]}>{p.time}</Text>
                </TouchableOpacity>
              );
            })}
            <Button
              title="Close"
              variant="ghost"
              size="md"
              onPress={() => setTimePickerVisible(false)}
              style={{ marginTop: Spacing.sm }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    cardTitle: { ...textStyles.title, color: colors.textPrimary, marginBottom: Spacing.lg },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
      gap: Spacing.md,
    },
    infoIconCircle: {
      width: 40,
      height: 40,
      borderRadius: Radius.sm,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoLabel: { ...textStyles.caption, color: colors.textMuted },
    infoValue: { ...textStyles.bodyStrong, color: colors.textPrimary },
    aboutText: { ...textStyles.body, color: colors.textSecondary, marginBottom: Spacing.md },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
      gap: Spacing.md,
    },
    linkLabel: { flex: 1, ...textStyles.bodyStrong, color: colors.textPrimary },
    chevron: { fontSize: 22, color: colors.textMuted, fontFamily: 'Baloo2_800ExtraBold' },
    timeValue: { ...textStyles.bodyStrong, color: colors.primary, marginRight: Spacing.xs },
    versionText: { ...textStyles.caption, color: colors.textMuted, textAlign: 'center' },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
    },
    modalCard: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
    },
    modalTitle: { ...textStyles.title, color: colors.textPrimary, textAlign: 'center' },
    modalSubtitle: {
      ...textStyles.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.xs,
      marginBottom: Spacing.lg,
    },
    timeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: Radius.lg,
      borderWidth: 1.5,
      borderColor: colors.borderStrong,
      marginBottom: Spacing.sm,
    },
    timeChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
    timeChipLabel: { ...textStyles.bodyStrong, color: colors.textPrimary },
    timeChipTime: { ...textStyles.body, color: colors.textSecondary },
    timeChipTextActive: { color: colors.primary },
  });

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
  profileHero: {
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    padding: 4,
    marginBottom: Spacing.md,
  },
  avatarCircle: { flex: 1, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 42 },
  kidName: { ...textStyles.h1, fontSize: 24, color: '#FFFFFF', marginBottom: 4 },
  kidAge: { ...textStyles.caption, color: '#C7D2FE' },
  card: { marginBottom: Spacing.lg },
  infoIcon: { fontSize: 18 },
  infoTextBlock: { flex: 1 },
  featureTags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionBtn: { marginBottom: Spacing.md },
});

export default SettingsScreen;
