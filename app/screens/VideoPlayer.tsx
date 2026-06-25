import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';

type VideoPlayerProps = {
  route: {
    params: {
      filePath: string;
      fileName: string;
    };
  };
  navigation: any;
};

export default function VideoPlayer({ route, navigation }: VideoPlayerProps) {
  const { filePath, fileName } = route.params;
  const videoRef = React.useRef(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#0B0B44" />
        </TouchableOpacity>
        <Text style={styles.title}>{fileName}</Text>
      </View>
      <Video
        ref={videoRef}
        source={{ uri: filePath }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        onError={(error) => console.error('Video Error:', error)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: { marginLeft: 16, fontSize: 16, fontWeight: '600' },
  video: { flex: 1 },
});