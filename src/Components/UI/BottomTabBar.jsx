import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../Data/colorsTheme';

const BottomTabBar = ({ 
  activeTab = 'Home',
  onTabPress = () => {},
  tabs = [
    { name: 'Home', icon: '🏠', label: 'Home' },
    { name: 'Stories', icon: '📚', label: 'Stories' },
    { name: 'Games', icon: '🧠', label: 'Games' },
    { name: 'Settings', icon: '⚙️', label: 'Settings' },
  ]
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          const tabColor = isActive ? Colors.primary : Colors.textLight;

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabButton}
              onPress={() => onTabPress(tab.name)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabIcon, { fontSize: 20, opacity: isActive ? 1 : 0.6 }]}>
                {tab.icon}
              </Text>
              <Text style={[styles.tabLabel, { color: tabColor, fontWeight: isActive ? '900' : '700' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderTopWidth: 2,
    borderTopColor: Colors.borderLight,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});

export default BottomTabBar;
