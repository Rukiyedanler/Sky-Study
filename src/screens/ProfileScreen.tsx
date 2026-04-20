import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';

export default function ProfileScreen() {
  const { theme } = useThemeContext();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Profil (Çok Yakında)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' }
});
