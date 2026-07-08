import React from 'react';
import { View, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

type FileType = 'pdf' | 'image' | 'video' | 'word' | 'excel';

type Props = {
  uri: string;
  fileType?: FileType;
};

export function getFileType(uri: string): FileType {
  const ext = uri.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext ?? '')) return 'image';
  if (['mp4', 'mov', 'avi', 'mkv'].includes(ext ?? '')) return 'video';
  if (['doc', 'docx'].includes(ext ?? '')) return 'word';
  if (['xls', 'xlsx', 'csv'].includes(ext ?? '')) return 'excel';
  return 'pdf';
}

export default function DocumentViewer({ uri, fileType }: Props) {
  const type = fileType ?? getFileType(uri);

  if (type === 'pdf') {
    return (
      <Pdf
        source={{ uri, cache: true }}
        style={styles.fullScreen}
        enablePaging
        spacing={8}
        renderActivityIndicator={() => (
          <ActivityIndicator size="large" color="#0000ff" />
        )}
      />
    );
  }

  if (type === 'image') {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri }}
          style={styles.fullScreen}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (type === 'video') {
    return (
      <View style={styles.container}>
        <Video
          source={{ uri }}
          style={styles.fullScreen}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
        />
      </View>
    );
  }

  if (type === 'word' || type === 'excel') {
    const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(uri)}`;
    return (
      <WebView
        source={{ uri: googleDocsUrl }}
        style={styles.fullScreen}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loader}
          />
        )}
        javaScriptEnabled
      />
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullScreen: {
    flex: 1,
    width,
    height,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
});