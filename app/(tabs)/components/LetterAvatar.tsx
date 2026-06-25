// components/LetterAvatar.tsx
import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface LetterAvatarProps {
  name?: string;
  email?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const LetterAvatar: React.FC<LetterAvatarProps> = ({ 
  name, 
  email, 
  size = 50, 
  style 
}) => {
  const getInitials = (text?: string): string => {
    if (!text) return '?';
    
    return text
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = (text?: string): string => {
    if (!text) return '#666666';
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    
    const index = text.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const displayText = name || email || '?';
  const initials = getInitials(displayText);
  const backgroundColor = getBackgroundColor(displayText);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        style
      ]}
    >
      <Text 
        style={[
          styles.text,
          { fontSize: size * 0.35 }
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LetterAvatar;