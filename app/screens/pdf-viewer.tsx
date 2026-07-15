import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import DocumentViewer, { getFileType } from '../screens/DocumentViewer';

export default function PDFViewer() {
  const params = useLocalSearchParams();
  const url = params.url as string;
  const title = (params.title as string) || "Document";
  const type = params.type as string | undefined;

  if (!url) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>No Document URL</Text>
          <Text style={styles.errorText}>URL parameter is missing</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const resolvedType =
    type === "pdf" || type === "image" || type === "video" || type === "word" || type === "excel"
      ? type
      : getFileType(url);

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <iframe
          src={url}
          style={styles.iframe}
          title={title}
        />
      ) : (
        <DocumentViewer
          uri={url}
          fileType={resolvedType}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  errorText: {
    color: '#333',
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