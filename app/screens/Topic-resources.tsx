import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { getResourcesByTopic } from "../services/api";

interface Resource {
  id: number;
  topic_id: number;
  type: "pdf" | "word" | "document" | "video" | "image" | string;
  title: string;
  file_path: string | null;
  url: string | null;
  locked: boolean;
}

const ICONS: Record<string, string> = {
  pdf: "picture-as-pdf",
  word: "description",
  document: "description",
  video: "play-circle-outline",
  image: "image",
};

const COLORS: Record<string, string> = {
  pdf: "#EF4444",
  word: "#4E54C8",
  document: "#4E54C8",
  video: "#F59E0B",
  image: "#10B981",
};

export default function TopicResourcesScreen() {
  const { topicId, topicName } = useLocalSearchParams<{
    topicId: string;
    topicName?: string;
  }>();
  const router = useRouter();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, [topicId]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await getResourcesByTopic(topicId);
      setResources(data);
    } catch (error) {
      Alert.alert("Error", "Could not load resources for this topic.");
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (resource: Resource) => {
    if (resource.locked) {
      Alert.alert(
        "Premium Feature",
        "Upgrade your EduApp subscription to unlock this content.",
        [
          { text: "Not now", style: "cancel" },
          {
            text: "View Plans",
            onPress: () => router.push("./subscription"),
          },
        ]
      );
      return;
    }

    const fileUrl = resource.file_path || resource.url;

    if (!fileUrl) {
      Alert.alert("Unavailable", "This resource has no file to display.");
      return;
    }

    router.push({
      pathname: "/screens/pdf-viewer",
      params: {
        url: fileUrl,
        title: resource.title,
        type: resource.type,
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4E54C8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{topicName || "Resources"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {resources.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="folder-open" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No resources yet for this topic.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {resources.map((resource) => {
              const iconName = ICONS[resource.type] || "insert-drive-file";
              const color = COLORS[resource.type] || "#64748B";

              return (
                <TouchableOpacity
                  key={resource.id}
                  style={styles.card}
                  onPress={() => handlePress(resource)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
                    <MaterialIcons name={iconName as any} size={24} color={color} />
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>
                      {resource.title}
                    </Text>
                    <Text style={styles.type}>{resource.type.toUpperCase()}</Text>
                  </View>

                  {resource.locked ? (
                    <Ionicons name="lock-closed" size={20} color="#F59E0B" />
                  ) : (
                    <MaterialIcons name="chevron-right" size={22} color="#64748B" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#4E54C8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", flex: 1, textAlign: "center" },
  content: { flex: 1 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  emptyText: { marginTop: 12, color: "#94A3B8", fontSize: 14 },
  list: { padding: 20, gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600", color: "#1E293B", marginBottom: 2 },
  type: { fontSize: 11, color: "#94A3B8", fontWeight: "600" },
});