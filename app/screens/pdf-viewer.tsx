import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import DocumentViewer, { getFileType } from '../screens/DocumentViewer';

export default function PDFViewer() {
  const params = useLocalSearchParams();
  const url = params.url as string;
  const title = params.title as string || 'Document';

  if (!url) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>No Document URL</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Document Viewer */}
      {Platform.OS === 'web' ? (
        <iframe
          src={url}
          style={styles.iframe}
          title={title}
        />
      ) : (
        <DocumentViewer
          uri={url}
          fileType={getFileType(url)}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#0B0B44',
    paddingTop: 50,
  },
  backButton: {
    padding: 5,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  placeholder: {
    width: 50,
  },
  iframe: {
    width: '100%',
    height: '100%',
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