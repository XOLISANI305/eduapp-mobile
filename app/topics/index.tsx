import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { getSubjects, getEnrolledSubjects, Subject, handleApiError } from "../services/api";

export default function TopicsScreen() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const enrollments = await getEnrolledSubjects();
      const enrolledSubjects = enrollments
        .map(e => e.subject)
        .filter(Boolean) as Subject[];
      setSubjects(enrolledSubjects);
    } catch (error) {
      console.error("Error loading subjects:", error);
      Alert.alert("Error", handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubjects();
    setRefreshing(false);
  };

 const handleSubjectPress = (subject: Subject) => {
  router.push({
  pathname: '/Dashboards/SubjectDetail',
  params: { id: subject.id, tab: 'videos' } 
});
};

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading video lessons...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Video Lessons</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Subjects</Text>
          <Text style={styles.sectionSubtitle}>
            Access video lessons for your enrolled subjects
          </Text>
        </View>

        {subjects.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="play-circle-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No enrolled subjects</Text>
            <Text style={styles.emptySubtext}>
              Enroll in subjects to access video lessons
            </Text>
            <TouchableOpacity 
              style={styles.enrollButton}
              onPress={() => router.push("../subjects")}
            >
              <Text style={styles.enrollButtonText}>Browse Subjects</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.subjectsList}>
            {subjects.map((subject) => (
              <TouchableOpacity
                key={subject.id}
                style={styles.subjectCard}
                onPress={() => handleSubjectPress(subject)}
              >
                <View style={styles.subjectIcon}>
                  <MaterialIcons name="play-circle-outline" size={32} color="#4E54C8" />
                </View>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                  <Text style={styles.subjectGrade}>Grade {subject.grade}</Text>
                  <Text style={styles.subjectDescription} numberOfLines={2}>
                    {subject.description || "Access video lessons and resources"}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
    marginLeft: 15,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 22,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  enrollButton: {
    backgroundColor: "#4E54C8",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  enrollButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  subjectsList: {
    padding: 20,
  },
  subjectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  subjectGrade: {
    fontSize: 14,
    color: "#4E54C8",
    fontWeight: "600",
    marginBottom: 4,
  },
  subjectDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 18,
  },
});