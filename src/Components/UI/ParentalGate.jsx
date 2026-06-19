import React, { useState, useEffect, useCallback } from 'react';
import { Modal, View, Text, TextInput, StyleSheet } from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { Spacing, Radius, textStyles, Elevation } from '../../Theme';
import Button from '../Common/Button';

// ──────────────────────────────────────────────────────────────
// ParentalGate — a simple adult-verification gate. Shown BEFORE
// destructive actions and external links so a young child cannot
// complete them alone. Uses a two-digit multiplication challenge.
// ──────────────────────────────────────────────────────────────
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const makeChallenge = () => {
  const a = randomInt(3, 9);
  const b = randomInt(11, 19);
  return { a, b, answer: a * b };
};

const ParentalGate = ({ visible, title = 'Ask a Grown-Up', onSuccess, onCancel }) => {
  const colors = useThemeColors();
  const [challenge, setChallenge] = useState(makeChallenge);
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

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

  const s = makeStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.card, Elevation.xl, { backgroundColor: colors.surface }]}>
          <Text style={styles.emoji}>🧑‍🍼</Text>
          <Text style={[textStyles.h2, s.title]}>{title}</Text>
          <Text style={[textStyles.body, s.subtitle]}>Parents only — please solve this to continue:</Text>

          <View style={[styles.questionBox, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.question, { color: colors.primaryDark }]}>
              {challenge.a} × {challenge.b} = ?
            </Text>
          </View>

          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceAlt, borderColor: error ? colors.error : colors.border, color: colors.textPrimary },
            ]}
            keyboardType="number-pad"
            placeholder="Type the answer"
            placeholderTextColor={colors.textMuted}
            value={value}
            onChangeText={(t) => { setValue(t.replace(/[^0-9]/g, '')); setError(false); }}
            maxLength={4}
            autoFocus
          />

          {error && <Text style={[styles.errorText, { color: colors.error }]}>That's not right — try again 🙂</Text>}

          <Button title="Continue" variant="primary" size="md" onPress={handleVerify} style={styles.continueBtn} />
          <Button title="Cancel" variant="ghost" size="sm" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    title: { color: colors.textPrimary, marginBottom: Spacing.xs, textAlign: 'center' },
    subtitle: { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  });

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xxl },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emoji: { fontSize: 44, marginBottom: Spacing.md },
  questionBox: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  question: { fontSize: 26, fontFamily: 'Baloo2_800ExtraBold', letterSpacing: 1 },
  input: {
    width: '100%',
    borderWidth: 2,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 18,
    fontFamily: 'Baloo2_700Bold',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  errorText: { fontFamily: 'Baloo2_700Bold', fontSize: 12, marginBottom: Spacing.sm },
  continueBtn: { marginTop: Spacing.sm, marginBottom: Spacing.xs },
});

export default ParentalGate;
