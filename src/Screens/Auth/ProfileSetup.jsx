import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth, useDialog } from '../../Context';
import { useThemeColors } from '../../Context/ThemeContext';
import { makeToken } from '../../Utils/secureAuth';
import { Input, Button, BottomSheet } from '../../Components/Common';
import { lightColors as C, gradients } from '../../Theme/colors';
import { Spacing, Radius, textStyles, coloredShadow } from '../../Theme';

const { height } = Dimensions.get('window');

const AVATARS = ['🐯', '🐱', '🦄', '🦁', '🦉', '🦊', '🐨', '🐼'];
const AGE_OPTIONS = ['2 Years', '3 Years', '4 Years', '5 Years', '6 Years', '7 Years', '8 Years', '9 Years', '10 Years'];

// ProfileSetup — one-time, no-login profile for the offline app.
const ProfileSetup = () => {
  const { loginSuccess } = useAuth();
  const { showAlert } = useDialog();
  const colors = useThemeColors();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('4 Years');
  const [selectedAvatar, setSelectedAvatar] = useState('🐯');
  const [isAgeModalVisible, setIsAgeModalVisible] = useState(false);

  const handleStart = async () => {
    if (!name.trim()) {
      showAlert({ title: 'One quick thing!', message: "Please enter your child's nickname to get started. 🌟", variant: 'error' });
      return;
    }
    try {
      setLoading(true);
      const profile = { id: `user_${Date.now()}`, name: name.trim(), age, avatar: selectedAvatar };
      await AsyncStorage.setItem('onboarding_complete', 'true');
      await loginSuccess(profile, makeToken(profile.id));
    } catch (e) {
      showAlert({ title: 'Oops!', message: 'Could not create the profile. Please try again.', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const s = makeStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.brandSurface }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── Top Hero ── */}
      <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topBar}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <View style={[styles.avatarRing, coloredShadow(C.primary, 'lg')]}>
          <Text style={styles.heroAvatar}>{selectedAvatar}</Text>
        </View>
        <Text style={styles.heroTitle}>{name.trim() ? `Hi, ${name.trim()}! 👋` : 'Create Your Profile'}</Text>
        <Text style={styles.heroSub}>Offline · Free · No Sign-Up 🚀</Text>
      </LinearGradient>

      {/* ── Form Card ── */}
      <ScrollView
        style={[styles.formCard, { backgroundColor: colors.bg }]}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.sectionLabel}>Pick a Fun Avatar</Text>
        <View style={styles.avatarRow}>
          {AVATARS.map((av) => {
            const sel = selectedAvatar === av;
            return (
              <TouchableOpacity
                key={av}
                style={[s.avatarChip, sel && s.avatarChipSel]}
                onPress={() => setSelectedAvatar(av)}
                activeOpacity={0.8}
              >
                <Text style={styles.avatarChipEmoji}>{av}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.sectionLabel}>Nickname</Text>
        <Input
          icon="🎒"
          placeholder="e.g. Ali, Zara, Champ..."
          value={name}
          onChangeText={setName}
          maxLength={20}
        />

        <Text style={s.sectionLabel}>Age</Text>
        <TouchableOpacity activeOpacity={0.85} onPress={() => setIsAgeModalVisible(true)} style={[s.selectRow]}>
          <Text style={styles.inputIcon}>🎂</Text>
          <Text style={[styles.selectText, { color: colors.textPrimary }]}>{age}</Text>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>▾</Text>
        </TouchableOpacity>

        <Button
          title={loading ? 'Setting Up...' : 'Start Learning'}
          icon={loading ? '⏳' : '🎉'}
          variant="gradient"
          size="lg"
          loading={loading}
          onPress={handleStart}
          style={styles.startBtn}
        />

        <Text style={[styles.offlineBadge, { color: colors.textMuted }]}>🔒 100% Offline · No Internet Required</Text>
      </ScrollView>

      {/* ── Age Picker ── */}
      <BottomSheet visible={isAgeModalVisible} title="Select Child's Age 🎂" onClose={() => setIsAgeModalVisible(false)} maxHeightRatio={0.55}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {AGE_OPTIONS.map((opt) => {
            const sel = age === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[s.ageOpt, sel && { backgroundColor: colors.primaryLight, borderBottomColor: 'transparent', borderRadius: Radius.sm }]}
                onPress={() => { setAge(opt); setIsAgeModalVisible(false); }}
              >
                <Text style={[textStyles.bodyStrong, { color: sel ? colors.primary : colors.textSecondary }]}>{opt}</Text>
                {sel && <Text style={{ color: colors.primary, fontFamily: 'Baloo2_800ExtraBold' }}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </BottomSheet>
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    sectionLabel: { ...textStyles.overline, color: colors.primary, marginBottom: Spacing.md, marginTop: Spacing.sm },
    avatarChip: {
      width: 56,
      height: 56,
      borderRadius: Radius.md,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarChipSel: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
    selectRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.lg,
      minHeight: 52,
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    ageOpt: {
      paddingVertical: 13,
      paddingHorizontal: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  });

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.xxl,
    paddingTop: 58,
    overflow: 'hidden',
    minHeight: height * 0.3,
  },
  blob1: { position: 'absolute', top: -40, left: -40, width: 170, height: 170, borderRadius: 85, backgroundColor: 'rgba(255,255,255,0.08)' },
  blob2: { position: 'absolute', bottom: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.06)' },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroAvatar: { fontSize: 48 },
  heroTitle: { ...textStyles.h1, fontSize: 24, color: C.onBrand, marginBottom: 5, textAlign: 'center' },
  heroSub: { ...textStyles.caption, color: C.onBrandMuted, letterSpacing: 0.5 },

  formCard: { flex: 1, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, marginTop: -2 },
  formContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: 30 },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: Spacing.md, gap: Spacing.sm },
  avatarChipEmoji: { fontSize: 28 },
  inputIcon: { fontSize: 17 },
  selectText: { flex: 1, ...textStyles.bodyStrong },
  startBtn: { marginTop: Spacing.sm, marginBottom: Spacing.md },
  offlineBadge: { ...textStyles.caption, textAlign: 'center' },
});

export default ProfileSetup;
