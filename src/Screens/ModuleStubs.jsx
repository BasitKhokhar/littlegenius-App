import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../Data/colorsTheme';
import { Header } from '../Components/UI';

export const SettingsScreen = ({ navigation, route }) => (
  <View style={styles.container}>
    <Header title="Settings" showBack onBackPress={() => navigation.goBack()} stars={route?.params?.stars || 0} />
    <View style={styles.placeholder}>
      <Text style={styles.icon}>⚙️</Text>
      <Text style={styles.text}>Settings Coming Soon! 🚀</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgMain },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 48, marginBottom: 16 },
  text: { fontSize: 14, fontWeight: '700', color: Colors.textDark, textAlign: 'center', paddingHorizontal: 16 },
});
