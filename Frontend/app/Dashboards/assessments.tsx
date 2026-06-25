import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AssessmentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Assessments</Text>
      <Text style={styles.message}>Your assessments and results will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0B0B44',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});