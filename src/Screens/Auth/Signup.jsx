import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  Linking,
} from 'react-native';
import { ROUTES, LEGAL_URLS } from '../../Constants';
import { useAuth } from '../../Context';
import { ParentalGate } from '../../Components/UI';
import { registerUser, makeToken } from '../../Utils/secureAuth';

const { width, height } = Dimensions.get('window');

const AVATARS = ['🐯', '🐱', '🦄', '🦁', '🦉', '🦊', '🐨', '🐼'];
const AGE_OPTIONS = ['2 Years', '3 Years', '4 Years', '5 Years', '6 Years', '7 Years', '8 Years', '9 Years', '10 Years'];

const Signup = ({ navigation }) => {
  const { loginSuccess } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('4 Years');
  const [selectedAvatar, setSelectedAvatar] = useState('🐯');
  const [showPassword, setShowPassword] = useState(false);
  const [isAgeModalVisible, setIsAgeModalVisible] = useState(false);
  const [consent, setConsent] = useState(false);
  const [showGate, setShowGate] = useState(false);

  const btnScale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  const openLink = (url) => Linking.openURL(url).catch(() => {});

  const validate = () => {
    if (!name.trim()) { Alert.alert('Oops!', "Enter child's nickname! 🌟"); return false; }
    if (!email.trim() || !email.includes('@')) { Alert.alert('Oops!', 'Enter a valid parent email 📧'); return false; }
    if (password.length < 4) { Alert.alert('Oops!', 'PIN must be at least 4 characters 🔒'); return false; }
    if (!consent) { Alert.alert('One More Thing', 'Please confirm you are the parent/guardian and agree to the Privacy Policy & Terms.'); return false; }
    return true;
  };

  // Parents-only gate runs before any account is created.
  const handleCreatePress = () => {
    if (!validate()) return;
    setShowGate(true);
  };

  const handleRegister = async () => {
    setShowGate(false);
    try {
      setLoading(true);
      const result = await registerUser({
        name,
        email,
        pin: password,
        age,
        avatar: selectedAvatar,
      });
      if (!result.ok) {
        Alert.alert('Already Registered', result.error || 'Could not create account.');
        return;
      }
      await loginSuccess(result.user, makeToken(result.user.id));
    } catch (e) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── Top Hero Bar ── */}
      <View style={styles.topBar}>
        {/* Decorative blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        <View style={styles.avatarRing}>
          <Text style={styles.heroAvatar}>{selectedAvatar}</Text>
        </View>
        <Text style={styles.heroTitle}>Create Kid Profile</Text>
        <Text style={styles.heroSub}>Offline · Free · Fun 🚀</Text>
      </View>

      {/* ── Form Card ── */}
      <View style={styles.formCard}>

        {/* Avatar Row */}
        <View style={styles.avatarRow}>
          {AVATARS.map((av) => {
            const sel = selectedAvatar === av;
            return (
              <TouchableOpacity
                key={av}
                style={[styles.avatarChip, sel && styles.avatarChipSel]}
                onPress={() => setSelectedAvatar(av)}
                activeOpacity={0.8}
              >
                <Text style={styles.avatarChipEmoji}>{av}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Nickname */}
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>🎒</Text>
          <TextInput
            style={styles.input}
            placeholder="Child's Nickname"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Email */}
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>📧</Text>
          <TextInput
            style={styles.input}
            placeholder="Parent's Email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password + Age on same row */}
        <View style={styles.twoCol}>
          <View style={[styles.inputRow, styles.halfInput]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="PIN (4+)"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={{ fontSize: 14 }}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.inputRow, styles.halfInput, { justifyContent: 'space-between' }]}
            onPress={() => setIsAgeModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.inputIcon}>🎂</Text>
            <Text style={[styles.input, { flex: 1, color: '#111827' }]}>{age}</Text>
            <Text style={{ fontSize: 11, color: '#9CA3AF' }}>▾</Text>
          </TouchableOpacity>
        </View>

        {/* Parental consent */}
        <TouchableOpacity
          style={styles.consentRow}
          activeOpacity={0.8}
          onPress={() => setConsent((c) => !c)}
        >
          <View style={[styles.checkbox, consent && styles.checkboxOn]}>
            {consent && <Text style={styles.checkboxTick}>✓</Text>}
          </View>
          <Text style={styles.consentText}>
            I am the parent/guardian and I agree to the{' '}
            <Text style={styles.consentLink} onPress={() => openLink(LEGAL_URLS.PRIVACY)}>
              Privacy Policy
            </Text>{' '}
            and{' '}
            <Text style={styles.consentLink} onPress={() => openLink(LEGAL_URLS.TERMS)}>
              Terms
            </Text>.
          </Text>
        </TouchableOpacity>

        {/* Create Account Button */}
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            style={[styles.createBtn, loading && { opacity: 0.7 }]}
            onPress={handleCreatePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={loading}
            activeOpacity={1}
          >
            <Text style={styles.createBtnText}>
              {loading ? '⏳  Creating...' : '🎉  Create Free Account'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Login link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already registered? </Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.AUTH.LOGIN)}>
            <Text style={styles.footerLink}>Sign In →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.offlineBadge}>🔒 100% Offline · No Internet Required</Text>
      </View>

      {/* ── Age Picker Modal ── */}
      <Modal
        visible={isAgeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAgeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Child's Age 🎂</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {AGE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.modalOpt, age === opt && styles.modalOptSel]}
                  onPress={() => { setAge(opt); setIsAgeModalVisible(false); }}
                >
                  <Text style={[styles.modalOptText, age === opt && { color: '#4338CA', fontWeight: '900' }]}>
                    {opt}
                  </Text>
                  {age === opt && <Text style={{ color: '#6366F1', fontWeight: '900' }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setIsAgeModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Parents-only gate before account creation ── */}
      <ParentalGate
        visible={showGate}
        title="Create Account"
        onSuccess={handleRegister}
        onCancel={() => setShowGate(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },

  // ── Top hero bar ──────────────────────────────────────────
  topBar: {
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 24,
    paddingTop: 54,          // Accounts for translucent status bar
    overflow: 'hidden',
    minHeight: height * 0.26,
  },
  blob1: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#312E81',
    opacity: 0.6,
  },
  blob2: {
    position: 'absolute',
    bottom: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4338CA',
    opacity: 0.4,
  },
  avatarRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#312E81',
    borderWidth: 3,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  heroAvatar: { fontSize: 36 },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A5B4FC',
    letterSpacing: 0.5,
  },

  // ── Form card ──────────────────────────────────────────────
  formCard: {
    flex: 1,
    backgroundColor: '#F4F0FF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    marginTop: -2,
  },

  // Avatar chips
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  avatarChip: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarChipSel: {
    borderColor: '#6366F1',
    backgroundColor: '#EDE9FE',
  },
  avatarChipEmoji: { fontSize: 18 },

  // Inputs
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 10,
    gap: 8,
  },
  inputIcon: { fontSize: 15 },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    padding: 0,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 2,
  },
  halfInput: {
    flex: 1,
    marginBottom: 10,
  },

  // Consent
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginTop: 2,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#A5B4FC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxOn: { backgroundColor: '#4338CA', borderColor: '#4338CA' },
  checkboxTick: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  consentText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#6B7280',
    lineHeight: 17,
  },
  consentLink: { color: '#4338CA', fontWeight: '900', textDecorationLine: 'underline' },

  // Create button
  createBtn: {
    backgroundColor: '#1E1B4B',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 2,
    elevation: 4,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderBottomWidth: 4,
    borderBottomColor: '#312E81',
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  footerText: { color: '#6B7280', fontWeight: '700', fontSize: 13 },
  footerLink: { color: '#6366F1', fontWeight: '900', fontSize: 13 },
  offlineBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '55%',
  },
  modalHandle: {
    width: 40, height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16, fontWeight: '900',
    color: '#1E1B4B',
    textAlign: 'center',
    marginBottom: 14,
  },
  modalOpt: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOptSel: {
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
    paddingHorizontal: 10,
    borderBottomColor: 'transparent',
  },
  modalOptText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  modalCancel: {
    backgroundColor: '#F4F0FF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCancelText: { fontSize: 14, fontWeight: '900', color: '#6366F1' },
});

export default Signup;
