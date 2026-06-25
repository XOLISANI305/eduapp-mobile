// UniversalFileViewer.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';

type UniversalFileViewerProps = {
  route: {
    params: {
      filePath: string;
      fileName: string;
      fileType?: string;
    };
  };
  navigation: any;
};

export default function UniversalFileViewer({ route, navigation }: UniversalFileViewerProps) {
  const { filePath, fileName, fileType } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
    setLoading(false);
    Alert.alert(
      'Cannot Display File',
      'This file type cannot be displayed in the app. Try opening it with an external app.',
      [
        { text: 'OK' },
        { text: 'Go Back', onPress: () => navigation.goBack() }
      ]
    );
  };

  // Generate HTML wrapper for better display
  const getHTMLContent = () => {
    if (fileType === 'image') {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: #000;
              }
              img {
                max-width: 100%;
                height: auto;
                object-fit: contain;
              }
            </style>
          </head>
          <body>
            <img src="${filePath}" alt="${fileName}" />
          </body>
        </html>
      `;
    }

    if (fileType === 'text') {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                margin: 0;
                padding: 16px;
                font-family: -apple-system, system-ui, sans-serif;
                line-height: 1.6;
                background: #fff;
              }
              pre {
                white-space: pre-wrap;
                word-wrap: break-word;
              }
            </style>
          </head>
          <body>
            <iframe src="${filePath}" style="width: 100%; height: 100vh; border: none;"></iframe>
          </body>
        </html>
      `;
    }

    return null;
  };

  const htmlContent = getHTMLContent();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#0B0B44" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {fileName}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* WebView Content */}
      {!error && (
        <WebView
          source={
            htmlContent 
              ? { html: htmlContent }
              : { uri: filePath }
          }
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={handleError}
          originWhitelist={['*']}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          scalesPageToFit={true}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff9346" />
          <Text style={styles.loadingText}>Loading {fileType}...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#ff4444" />
          <Text style={styles.errorText}>Cannot display this file</Text>
          <Text style={styles.errorSubtext}>
            This file type is not supported for in-app viewing
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  title: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#0B0B44',
  },
  placeholder: {
    width: 32,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});