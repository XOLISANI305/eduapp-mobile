// app/components/BottomNav.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function BottomNav() {
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#0B0B44',
        paddingVertical: 12,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
      }}
    >
      <TouchableOpacity onPress={() => router.push('/')}>
        <Text style={{ color: 'white' }}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('./screend/documents')}>
        <Text style={{ color: 'white' }}>Docs</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/assessments')}>
        <Text style={{ color: 'white' }}>Assess</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/profile')}>
        <Text style={{ color: 'white' }}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}
