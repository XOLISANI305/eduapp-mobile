import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Question {
  id: number;
  title: string;
  author: string;
  body?: string;
  subject_id?: number;
  created_at?: string;
}

interface QuestionCardProps {
  question?: Question;
  onPress: () => void;
}

export default function QuestionCard({ question, onPress }: QuestionCardProps) {
  if (!question) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>No question data available</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{question.title}</Text>
      <Text style={styles.author}>By: {question.author}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#CAD3D7',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: { fontSize: 17, fontWeight: 'bold', color: '#0B0B44' },
  author: { marginTop: 5, color: '#0B0B44', fontSize: 13 },
  emptyText: { color: '#666', fontStyle: 'italic' },
});