import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

// ──────────────────────────────────────────────────────────────
// MarksBadge — animated school-style marks chip ("7/10") with a
// spring pop, colour-coded verdict and star row. Used by the
// Tracing Worksheet to grade each attempt.
//
// Props: marks (0-10), outOf (default 10), size ('sm'|'lg')
// ──────────────────────────────────────────────────────────────

const verdictFor = (marks, outOf) => {
  const r = marks / outOf;
  if (r >= 0.8) return { label: 'Amazing! 🌟', color: '#10B981' };
  if (r >= 0.5) return { label: 'Good job! 👍', color: '#F59E0B' };
  return { label: 'Try again! 💪', color: '#EC4899' };
};

const MarksBadge = ({ marks, outOf = 10, size = 'lg' }) => {
  const pop = useRef(new Animated.Value(0)).current;
  const verdict = verdictFor(marks, outOf);
  const starCount = Math.round((marks / outOf) * 3);

  useEffect(() => {
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 90, useNativeDriver: true }).start();
  }, [marks, pop]);

  const small = size === 'sm';

  return (
    <Animated.View
      style={[
        styles.badge,
        small && styles.badgeSm,
        { borderColor: verdict.color, transform: [{ scale: pop }] },
      ]}
    >
      <Text style={[styles.marks, small && styles.marksSm, { color: verdict.color }]}>
        {marks}/{outOf}
      </Text>
      {!small && (
        <>
          <View style={styles.starsRow}>
            {[0, 1, 2].map((i) => (
              <Text key={i} style={styles.star}>{i < starCount ? '⭐' : '☆'}</Text>
            ))}
          </View>
          <Text style={[styles.verdict, { color: verdict.color }]}>{verdict.label}</Text>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 20,
    borderWidth: 3,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 6,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  badgeSm: {
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  marks: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  marksSm: { fontSize: 14 },
  starsRow: { flexDirection: 'row', gap: 3, marginTop: 2 },
  star: { fontSize: 18 },
  verdict: { fontSize: 12, fontWeight: '900', marginTop: 4 },
});

export default MarksBadge;
