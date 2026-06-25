import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';

export default function WebPDFViewer() {
  const params = useLocalSearchParams();
  const url = params.url as string;
  
  return (
    <>
      <Stack.Screen options={{ title: 'PDF Viewer' }} />
      <View style={styles.container}>
        <Text style={styles.title}>PDF Viewer</Text>
        {url && (
          <iframe 
            src={url}
            style={styles.iframe}
            title="PDF Viewer"
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  iframe: { width: '100%', height: '80%', marginTop: 20 },
});