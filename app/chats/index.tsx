// app/chats/index.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import {
  getEnrolledSubjects,
  Subject,
} from "../services/api";

interface EnrolledSubject extends Subject {
  description?: string;
}

export default function StudyGroupsScreen() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<EnrolledSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEnrolledSubjects = useCallback(async () => {
    try {
      setError(null);
      const enrollments = await getEnrolledSubjects();
      const enrolled = enrollments
        .map((e: any) => e.subject)
        .filter(Boolean) as EnrolledSubject[];
      setSubjects(enrolled);
    } catch (err) {
      console.error("Failed to load enrolled subjects:", err);
      setError("Failed to load your subjects.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEnrolledSubjects();
  }, [loadEnrolledSubjects]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEnrolledSubjects();
  };

  const goToSubjectChat = (subject: EnrolledSubject) => {
    router.push({
      pathname: "/Dashboards/QnAChat",
      params: { subjectId: subject.id.toString() },
    } as any);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading your subjects...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialIcons name="error-outline" size={56} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadEnrolledSubjects}>
          <MaterialIcons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Study Groups</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.subheading}>
        Pick a subject to join its Q&A discussion
      </Text>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#4E54C8"]}
            tintColor="#4E54C8"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => goToSubjectChat(item)}
          >
            <View style={styles.iconCircle}>
              <MaterialIcons name="forum" size={26} color="#4E54C8" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.subjectName}>{item.name}</Text>
              <Text style={styles.subjectDescription} numberOfLines={2}>
                {item.description || "No description available for this subject."}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#94A3B8" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="menu-book" size={56} color="#CBD5E1" />
            <Text style={styles.emptyText}>No enrolled subjects yet</Text>
            <Text style={styles.emptySubtext}>
              Enroll in a subject to join its study group Q&A.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
  },
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  subheading: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  subjectDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4E54C8",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});