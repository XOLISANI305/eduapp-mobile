import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    { label: 'Home', route: '/home' },
    { label: 'Documents', route: '/documents' },
    { label: 'Profile', route: '/profile' },
  ];

  return (
    <View style={styles.nav}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={[styles.tab, pathname === item.route && styles.active]}
          onPress={() => router.push(item.route as any)}
        >
          <Text style={[styles.text, pathname === item.route && styles.textActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#4E54C8',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  active: { backgroundColor: 'rgba(255,255,255,0.1)' },
  text: { color: '#fff', fontWeight: 'bold' },
  textActive: { color: '#fff' },
});
