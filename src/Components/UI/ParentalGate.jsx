import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

// ──────────────────────────────────────────────────────────────
// ParentalGate — a simple adult-verification gate.
//
// Shown BEFORE account creation and BEFORE destructive actions
// (e.g. delete account) so a young child cannot complete them alone.
// Uses a two-digit multiplication question that is easy for an adult
// but not solvable by a pre-reader, as recommended for kids apps.
// ──────────────────────────────────────────────────────────────
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const makeChallenge = () => {
  const a = randomInt(3, 9);
  const b = randomInt(11, 19);
  return { a, b, answer: a * b };
};

const ParentalGate = ({ visible, title = 'Ask a Grown-Up', onSuccess, onCancel }) => {
  const [challenge, setChallenge] = useState(makeChallenge);
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  // Fresh question every time the gate opens.
  useEffect(() => {
    if (visible) {
      setChallenge(makeChallenge());
      setValue('');
      setError(false);
    }
  }, [visible]);

  const handleVerify = useCallback(() => {
    if (parseInt(value, 10) === challenge.answer) {
      onSuccess?.();
    } else {
      setError(true);
      setChallenge(makeChallenge());
      setValue('');
    }
  }, [value, challenge, onSuccess]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🧑‍🍼</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Parents only — please solve this to continue:
          </Text>

          <View style={styles.questionBox}>
            <Text style={styles.question}>
              {challenge.a} × {challenge.b} = ?
            </Text>
          </View>

          <TextInput
            style={[styles.input, error && styles.inputError]}
            keyboardType="number-pad"
            placeholder="Type the answer"
            placeholderTextColor="#9CA3AF"
            value={value}
            onChangeText={(t) => { setValue(t.replace(/[^0-9]/g, '')); setError(false); }}
            maxLength={4}
            autoFocus
          />

          {error && <Text style={styles.errorText}>That's not right — try again 🙂</Text>}

          <TouchableOpacity style={styles.primaryBtn} onPress={handleVerify} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.85}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  emoji: { fontSize: 44, marginBottom: 10 },
  title: { fontSize: 20, fontWeight: '900', color: '#1E1B4B', marginBottom: 6 },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18,
  },
  questionBox: {
    backgroundColor: '#EDE9FE',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  question: { fontSize: 26, fontWeight: '900', color: '#4338CA', letterSpacing: 1 },
  input: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  errorText: { color: '#EF4444', fontWeight: '700', fontSize: 12, marginBottom: 8 },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    borderBottomWidth: 4,
    borderBottomColor: '#312E81',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },
  cancelBtn: { paddingVertical: 12, marginTop: 4 },
  cancelBtnText: { color: '#6B7280', fontSize: 13, fontWeight: '800' },
});

export default ParentalGate;
