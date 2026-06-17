import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../Theme';

import { useAuth } from '../../Context';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout
        },
      ],
      { cancelable: true }
    );
  };

  const MENU = [
    { icon: '🔔', label: 'Notifications', onPress: () => { } },
    { icon: '🔒', label: 'Privacy & Security', onPress: () => { } },
    { icon: '📋', label: 'My Saved Articles', onPress: () => { } },
    { icon: '💬', label: 'Help & Support', onPress: () => { } },
    { icon: '🚪', label: 'Sign Out', danger: true, onPress: handleSignOut },
  ];

  return (
    <View style={styles.container}>
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>
          {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
        </Text>
        <Text style={styles.email}>
          {user?.email || 'guest@example.com'}
        </Text>
      </View>

      {/* Menu Section */}
      <View style={styles.menu}>
        {MENU.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            activeOpacity={0.75}
            onPress={item.onPress}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.menuLabel, item.danger && styles.danger]}>
              {item.label}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Spacing.xxxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    color: Colors.white,
    fontSize: Typography.size.xxxl,
    fontFamily: Typography.font.bold,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.font.bold,
    color: Colors.text,
  },
  email: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.font.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  menu: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuIcon: { fontSize: 20, marginRight: Spacing.md },
  menuLabel: {
    flex: 1,
    fontSize: Typography.size.md,
    fontFamily: Typography.font.medium,
    color: Colors.text,
  },
  danger: { color: Colors.error },
  chevron: {
    fontSize: Typography.size.xl,
    color: Colors.textMuted,
  },
});

export default ProfileScreen;

