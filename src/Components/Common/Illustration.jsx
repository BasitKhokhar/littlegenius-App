import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { SVGS } from '../../Assets/svg';

// ──────────────────────────────────────────────────────────────────────
// Illustration — renders a registered SVG by name, with a graceful
// fallback so migration can be incremental and never crashes.
//
//   <Illustration name="apple" size={80} />
//   <Illustration name="apple" fallback="🍎" size={64} />   // during migration
//
// If `name` isn't in the SVG registry yet, we render `fallback` (an emoji
// or nothing). That means data files can be switched to icon names one at a
// time — anything not yet drawn simply keeps showing its old emoji.
// ──────────────────────────────────────────────────────────────────────
const Illustration = ({
  name,
  size = 64,
  width,
  height,
  fallback = null,
  style,
  accessibilityLabel,
  ...rest
}) => {
  const Svg = name ? SVGS[name] : null;

  if (Svg) {
    return (
      <Svg
        width={width ?? size}
        height={height ?? size}
        accessibilityLabel={accessibilityLabel ?? name}
        {...rest}
      />
    );
  }

  if (fallback == null) return null;

  return (
    <View style={[styles.fallbackWrap, { width: width ?? size, height: height ?? size }, style]}>
      <Text style={{ fontSize: (width ?? size) * 0.72 }} accessibilityLabel={accessibilityLabel}>
        {fallback}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackWrap: { alignItems: 'center', justifyContent: 'center' },
});

export default React.memo(Illustration);
