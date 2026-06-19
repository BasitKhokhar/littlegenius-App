import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../Context';
import { useThemeColors } from '../../Context/ThemeContext';
import { Spacing, Radius, Typography, textStyles, coloredShadow } from '../../Theme';
import IconButton from '../Common/IconButton';
import Badge from '../Common/Badge';

const Header = ({
  title = 'Little Genius',
  showBack = false,
  onBackPress = null,
  avatar = '🦁',
  stars = null,
  rightAction = null,
  useLogo = false,
}) => {
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const colors = useThemeColors();

  const displayStars = stars !== null ? stars : auth?.stars || 0;
  const displayAvatar = auth?.user?.avatar || avatar;

  return (
    <View
      style={[
        styles.header,
        coloredShadow(colors.brandSurface, 'md'),
        { backgroundColor: colors.brandSurface, paddingTop: Math.max(insets.top, 10) },
      ]}
    >
      <View style={styles.headerContent}>
        <View style={styles.leftSection}>
          {showBack ? (
            <IconButton
              glyph="←"
              tone="glass"
              onPress={onBackPress}
              accessibilityLabel="Go back"
              style={styles.leftSpace}
            />
          ) : useLogo ? (
            <View style={[styles.logoBadge, { borderColor: colors.primary }]}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={[styles.logoCircle, { backgroundColor: colors.brandSurfaceAlt, borderColor: colors.primary }]}>
              <Text style={styles.logoEmoji}>{displayAvatar}</Text>
            </View>
          )}
          <View style={styles.titleBlock}>
            {!showBack && (
              <Text style={[styles.appLabel, { color: colors.onBrandMuted }]}>LITTLE GENIUS</Text>
            )}
            <Text style={[styles.title, { color: colors.onBrand }]} numberOfLines={1}>
              {title}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          {rightAction}
          <Badge label={String(displayStars)} icon="⭐" tone="brand" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {},
  headerContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  leftSpace: { marginRight: Spacing.md },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  logoEmoji: { fontSize: 22 },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  logoImage: { width: '100%', height: '100%' },
  titleBlock: { flex: 1, justifyContent: 'center' },
  appLabel: {
    fontFamily: Typography.font.extraBold,
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 1,
  },
  title: { ...textStyles.h3, fontSize: 18 },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});

export default Header;
