import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface SearchBarProps {
  value?: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export default function SearchBar({
  value = '',        // default empty string
  onChangeText,
  onClear,
  placeholder = "Search questions..."
}: SearchBarProps) {
  const searchValue = value || '';

  return (
    <View style={styles.container}>
      <TextInput
        value={searchValue}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={styles.input}
        placeholderTextColor="#999"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {searchValue.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0B0B44',
  },
  clearButton: {
    padding: 5,
  },
  clearText: {
    fontSize: 18,
    color: '#999',
  },
});
