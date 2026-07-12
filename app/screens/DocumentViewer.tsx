import React from 'react';
import { View, Image, StyleSheet, Dimensions, ActivityIndicator, Text } from 'react-native';
import Pdf from 'react-native-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';
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

function ensureExtension(uri: string, type: FileType): string {
  const hasExt = /\.(pdf|docx?|xlsx?|csv|jpg|jpeg|png|gif|webp|mp4|mov|avi|mkv)$/i.test(uri);
  if (hasExt) return uri;

  const extMap: Record<FileType, string> = {
    pdf: 'pdf',
    word: 'docx',
    excel: 'xlsx',
    image: 'jpg',
    video: 'mp4',
  };

  return `${uri}.${extMap[type]}`;
}

function PdfFromRemote({ uri, style }: { uri: string; style: any }) {
  const [localPath, setLocalPath] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function download() {
      try {
        console.log('Starting PDF download from:', uri);
        const dest = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/doc_${Date.now()}.pdf`;

        const task = ReactNativeBlobUtil.config({
          path: dest,
        }).fetch('GET', uri);

        // Log progress so we can see if it's actually moving or fully stuck
        task.progress({ interval: 500 }, (received, total) => {
          const pct = total > 0 ? ((received / total) * 100).toFixed(1) : '?';
          console.log(`Download progress: ${received}/${total} bytes (${pct}%)`);
        });

        // Fail loudly instead of spinning forever if nothing happens in 20s
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Download timed out after 20s')), 20000)
        );

        const res: any = await Promise.race([task, timeout]);

        const exists = await ReactNativeBlobUtil.fs.exists(res.path());
        if (!exists) throw new Error('File missing after download');

        const stat = await ReactNativeBlobUtil.fs.stat(res.path());
        console.log('Downloaded file size:', stat.size, 'bytes');
        console.log('Downloaded file path:', res.path());

        if (Number(stat.size) < 1000) {
          console.log('WARNING: File is suspiciously small — likely not a valid PDF');
        }

        if (!cancelled) setLocalPath(res.path());
      } catch (e: any) {
        console.log('PDF download failed:', e);
        if (!cancelled) setError(e.message ?? 'Download failed');
      }
    }

    setLocalPath(null);
    setError(null);
    download();
    return () => {
      cancelled = true;
    };
  }, [uri]);

  if (error) {
    return (
      <View style={docStyles.center}>
        <Text>Failed to load document: {error}</Text>
      </View>
    );
  }

  if (!localPath) {
    return (
      <View style={docStyles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Pdf
      source={{ uri: `file://${localPath}`, cache: false }}
      style={style}
      enablePaging
      spacing={8}
      onLoadComplete={(numberOfPages, filePath) => {
        console.log(`PDF loaded successfully: ${numberOfPages} pages at ${filePath}`);
      }}
      onError={(err) => {
        console.log('PDF render error:', err);
      }}
      onPageChanged={(page, numberOfPages) => {
        console.log(`Page ${page} of ${numberOfPages}`);
      }}
    />
  );
}

export default function DocumentViewer({ uri, fileType }: Props) {
  const type = fileType ?? getFileType(uri);
  const fixedUri = ensureExtension(uri, type);

  if (type === 'pdf') {
  
    return <PdfFromRemote uri={uri} style={styles.fullScreen} />;
  }

  if (type === 'image') {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: fixedUri }}
          style={styles.fullScreen}
          resizeMode="contain"
        />
      </View>
    );
  }

 if (type === 'video') {
  return (
    <View style={styles.videoContainer}>
      <Video
        source={{ uri: fixedUri }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={false}
        isLooping={false}
      />
    </View>
  );
}

  if (type === 'word' || type === 'excel') {
    const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fixedUri)}`;
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

const docStyles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

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
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width,
    height: height * 0.6,
    backgroundColor: '#000',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
});