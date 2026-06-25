import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

export default function PDFViewer() {
  const params = useLocalSearchParams();
  const url = params.url as string;
  const title = params.title as string || 'PDF Document';

  console.log('PDF Viewer - URL:', url);
  console.log('PDF Viewer - Title:', title);

  const openInBrowser = async () => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      alert('Cannot open this PDF');
    }
  };

  if (!url) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>No PDF URL</Text>
          <Text>URL parameter is missing</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        // Web: Show PDF in iframe
        <>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <iframe 
            src={url} 
            style={styles.iframe}
            title="PDF Viewer"
          />
        </>
      ) : (
        // Native: Show open button
        <View style={styles.nativeContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.url}>{url}</Text>
          
          <TouchableOpacity style={styles.primaryButton} onPress={openInBrowser}>
            <Text style={styles.primaryButtonText}>Open PDF</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B0B44',
    textAlign: 'center',
  },
  iframe: {
    width: '100%',
    height: '100%',

  },
  nativeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  url: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#0B0B44',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
    minWidth: 200,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0B0B44',
    minWidth: 200,
  },
  secondaryButtonText: {
    color: '#0B0B44',
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#0B0B44',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});