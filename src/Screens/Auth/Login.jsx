import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { ROUTES } from '../../Constants';
import { useAuth } from '../../Context';
import { verifyUser, makeToken } from '../../Utils/secureAuth';

const { height } = Dimensions.get('window');

const Login = ({ navigation }) => {
  const { loginSuccess } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const btnScale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  const validate = () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Oops!', 'Please enter a valid parent email 📧');
      return false;
    }
    if (password.length < 4) {
      Alert.alert('Oops!', 'PIN must be at least 4 characters 🔒');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const result = await verifyUser({ email, pin: password });
      if (!result.ok) {
        Alert.alert('Login Failed', 'Invalid email or PIN. Please try again! 🔑');
        return;
      }
      await loginSuccess(result.user, makeToken(result.user.id));
    } catch (e) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── Top Hero ── */}
      <View style={styles.topBar}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🎓</Text>
        </View>
        <Text style={styles.heroTitle}>Little Genius</Text>
        <Text style={styles.heroSub}>Parent Login · Secure & Offline 🔒</Text>
      </View>

      {/* ── Form Card ── */}
      <View style={styles.formCard}>
        <Text style={styles.cardTitle}>Welcome Back 👋</Text>
        <Text style={styles.cardSub}>Sign in to continue your child's learning</Text>

        {/* Email */}
        <View style={[styles.inputRow, emailFocused && styles.inputFocused]}>
          <Text style={styles.inputIcon}>📧</Text>
          <TextInput
            style={styles.input}
            placeholder="Parent's Email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </View>

        {/* Password */}
        <View style={[styles.inputRow, passFocused && styles.inputFocused]}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Parent PIN / Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setPassFocused(true)}
            onBlur={() => setPassFocused(false)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={loading}
            activeOpacity={1}
          >
            <Text style={styles.submitBtnText}>
              {loading ? '⏳  Signing In...' : '🚀  Sign In'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New here? </Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.AUTH.SIGNUP)}>
            <Text style={styles.footerLink}>Create Kid Profile →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.offlineBadge}>🔒 100% Offline · No Internet Needed</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },

  // Hero top
  topBar: {
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 30,
    paddingTop: 60,
    minHeight: height * 0.35,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute', top: -50, left: -50,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: '#312E81', opacity: 0.6,
  },
  blob2: {
    position: 'absolute', bottom: -20, right: -20,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: '#4338CA', opacity: 0.4,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#312E81',
    borderWidth: 3,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    elevation: 10,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  logoEmoji: { fontSize: 42 },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.7,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A5B4FC',
    letterSpacing: 0.5,
  },

  // Form card
  formCard: {
    flex: 1,
    backgroundColor: '#F4F0FF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E1B4B',
    marginBottom: 5,
    letterSpacing: -0.5,
  },
  cardSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 22,
    lineHeight: 18,
  },

  // Inputs
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    gap: 10,
  },
  inputFocused: {
    borderColor: '#6366F1',
    backgroundColor: '#FAFAFE',
  },
  inputIcon: { fontSize: 16 },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    padding: 0,
  },

  // Button
  submitBtn: {
    backgroundColor: '#1E1B4B',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderBottomWidth: 4,
    borderBottomColor: '#312E81',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  footerText: { color: '#6B7280', fontWeight: '700', fontSize: 13 },
  footerLink: { color: '#6366F1', fontWeight: '900', fontSize: 13 },
  offlineBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default Login;
