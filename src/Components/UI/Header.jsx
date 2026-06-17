import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../Context';

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

  const displayStars = stars !== null ? stars : (auth?.stars || 0);
  const displayAvatar = auth?.user?.avatar || avatar;
  const displayTitle = title;

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={styles.headerContent}>
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackPress}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          ) : useLogo ? (
            <View style={styles.logoBadge}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>{displayAvatar}</Text>
            </View>
          )}
          <View style={styles.titleBlock}>
            {!showBack && (
              <Text style={styles.appLabel}>LITTLE GENIUS</Text>
            )}
            <Text style={styles.title} numberOfLines={1}>{displayTitle}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          {rightAction}
          <View style={styles.starsBadge}>
            <Text style={styles.starEmoji}>⭐</Text>
            <Text style={styles.starsCount}>{displayStars}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1E1B4B',
    elevation: 8,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#312E81',
    borderWidth: 1.5,
    borderColor: '#4338CA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 22,
    fontWeight: '900',
    color: '#A5B4FC',
    lineHeight: 26,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#312E81',
    borderWidth: 2,
    borderColor: '#4338CA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoEmoji: {
    fontSize: 22,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#312E81',
    borderWidth: 2,
    borderColor: '#818CF8',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  titleBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  appLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#818CF8',
    letterSpacing: 1.5,
    marginBottom: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#312E81',
    borderWidth: 1.5,
    borderColor: '#4338CA',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  starEmoji: {
    fontSize: 14,
  },
  starsCount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FCD34D',
    minWidth: 20,
    textAlign: 'center',
  },
});

export default Header;
