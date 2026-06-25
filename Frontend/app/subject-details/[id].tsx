// app/subject-details/[id].tsx
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
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import {
  getSubjectDetails,
  handleApiError,
} from "../services/api";

// Define proper TypeScript types
export type Resource = {
  id: number;
  title: string;
  type: string; // "video", "pdf", "word", "excel", etc.
  url?: string;
  file_path?: string;
};

export type Topic = {
  id: number;
  name: string;
  resources: Resource[];
};

export type Assessment = {
  id: number;
  title: string;
  description?: string;
  total_marks?: number;
  duration_minutes?: number;
  status: "active" | "inactive";
};

export type Subject = {
  id: number;
  name: string;
  grade: number;
};

export default function SubjectDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const subjectId = Array.isArray(id) ? id[0] : id;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"topics" | "assessments" | "qna">("topics");
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (subjectId) {
      loadSubjectDetails();
    }
  }, [subjectId]);

  const loadSubjectDetails = async () => {
    try {
      setLoading(true);
      const data = await getSubjectDetails(subjectId!);
      setSubject(data.subject as any);
      setTopics(data.topics || []);
      setAssessments(data.assessments as any|| []);
    } catch (error) {
      console.error("Error loading subject details:", error);
      Alert.alert("Error", handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubjectDetails();
    setRefreshing(false);
  };

  const toggleTopic = (topicId: number) => {
    setExpandedTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) newSet.delete(topicId);
      else newSet.add(topicId);
      return newSet;
    });
  };

  const handleResourcePress = async (resource: Resource) => {
    try {
      if (resource.type === "video" && resource.url) {
        await Linking.openURL(resource.url);
      } else if (resource.file_path) {
        Alert.alert("Resource", `Opening ${resource.title}...`);
      }
    } catch (error) {
      Alert.alert("Error", "Could not open resource");
    }
  };

  const handleAssessmentPress = (assessment: Assessment) => {
    router.push({
      pathname: "/screens/StudentAssessment",
      params: { assessmentId: assessment.id.toString() },
    });
  };

  const handleAskQuestion = () => {
    router.push(`../qna/ask-question?subjectId=${subjectId}`);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video":
        return "play-circle-outline";
      case "pdf":
        return "picture-as-pdf";
      case "word":
        return "description";
      case "excel":
        return "table-chart";
      default:
        return "insert-drive-file";
    }
  };

  // --- Render Functions ---
  const renderTopicsTab = () => (
    <View style={styles.tabContent}>
      {topics.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="library-books" size={64} color="#CBD5E1" />
          <Text style={styles.emptyText}>No topics available yet</Text>
        </View>
      ) : (
        topics.map((topic) => {
          const isExpanded = expandedTopics.has(topic.id);
          return (
            <View key={topic.id} style={styles.topicCard}>
              <TouchableOpacity
                style={styles.topicHeader}
                onPress={() => toggleTopic(topic.id)}
              >
                <View style={styles.topicInfo}>
                  <MaterialIcons name="topic" size={24} color="#4E54C8" />
                  <Text style={styles.topicName}>{topic.name}</Text>
                </View>
                <View style={styles.topicMeta}>
                  <Text style={styles.resourceCount}>
                    {topic.resources?.length || 0} resources
                  </Text>
                  <MaterialIcons
                    name={isExpanded ? "expand-less" : "expand-more"}
                    size={24}
                    color="#64748B"
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && topic.resources.length > 0 && (
                <View style={styles.resourcesList}>
                  {topic.resources.map((resource) => (
                    <TouchableOpacity
                      key={resource.id}
                      style={styles.resourceItem}
                      onPress={() => handleResourcePress(resource)}
                    >
                      <View style={styles.resourceIcon}>
                        <MaterialIcons
                          name={getResourceIcon(resource.type)}
                          size={20}
                          color="#4E54C8"
                        />
                      </View>
                      <View style={styles.resourceInfo}>
                        <Text style={styles.resourceTitle}>{resource.title}</Text>
                        <Text style={styles.resourceType}>
                          {resource.type.toUpperCase()}
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );

  const renderAssessmentsTab = () => (
    <View style={styles.tabContent}>
      {assessments.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="quiz" size={64} color="#CBD5E1" />
          <Text style={styles.emptyText}>No assessments available yet</Text>
        </View>
      ) : (
        assessments.map((assessment) => (
          <TouchableOpacity
            key={assessment.id}
            style={styles.assessmentCard}
            onPress={() => handleAssessmentPress(assessment)}
          >
            <View style={styles.assessmentHeader}>
              <View style={styles.assessmentIcon}>
                <MaterialIcons name="quiz" size={28} color="#FF6B6B" />
              </View>
              <View style={styles.assessmentInfo}>
                <Text style={styles.assessmentTitle}>{assessment.title}</Text>
                <Text style={styles.assessmentDescription} numberOfLines={2}>
                  {assessment.description || "No description"}
                </Text>
              </View>
            </View>

            <View style={styles.assessmentFooter}>
              <View style={styles.assessmentMeta}>
                {assessment.total_marks && (
                  <View style={styles.metaItem}>
                    <MaterialIcons name="stars" size={16} color="#64748B" />
                    <Text style={styles.metaText}>{assessment.total_marks} marks</Text>
                  </View>
                )}
                {assessment.duration_minutes && (
                  <View style={styles.metaItem}>
                    <MaterialIcons name="timer" size={16} color="#64748B" />
                    <Text style={styles.metaText}>{assessment.duration_minutes} min</Text>
                  </View>
                )}
              </View>
              <View
                style={[
                  styles.statusBadge,
                  assessment.status === "active"
                    ? styles.statusActive
                    : styles.statusInactive,
                ]}
              >
                <Text style={styles.statusText}>{assessment.status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderQnATab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity style={styles.askQuestionButton} onPress={handleAskQuestion}>
        <MaterialIcons name="add-circle" size={24} color="#fff" />
        <Text style={styles.askQuestionText}>Ask a Question</Text>
      </TouchableOpacity>

      <View style={styles.emptyState}>
        <MaterialIcons name="forum" size={64} color="#CBD5E1" />
        <Text style={styles.emptyText}>Q&A Section</Text>
        <Text style={styles.emptySubtext}>
          Ask questions and get help from teachers and peers
        </Text>
      </View>
    </View>
  );

  // --- Loading/Error states ---
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading subject details...</Text>
      </View>
    );
  }

  if (!subject) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Subject not found</Text>
        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Main Render ---
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{subject.name}</Text>
          <Text style={styles.headerSubtitle}>Grade {subject.grade}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "topics" && styles.tabActive]}
          onPress={() => setActiveTab("topics")}
        >
          <MaterialIcons
            name="library-books"
            size={20}
            color={activeTab === "topics" ? "#4E54C8" : "#64748B"}
          />
          <Text style={[styles.tabText, activeTab === "topics" && styles.tabTextActive]}>
            Topics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "assessments" && styles.tabActive]}
          onPress={() => setActiveTab("assessments")}
        >
          <MaterialIcons
            name="quiz"
            size={20}
            color={activeTab === "assessments" ? "#4E54C8" : "#64748B"}
          />
          <Text style={[styles.tabText, activeTab === "assessments" && styles.tabTextActive]}>
            Assessments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "qna" && styles.tabActive]}
          onPress={() => setActiveTab("qna")}
        >
          <MaterialIcons
            name="forum"
            size={20}
            color={activeTab === "qna" ? "#4E54C8" : "#64748B"}
          />
          <Text style={[styles.tabText, activeTab === "qna" && styles.tabTextActive]}>
            Q&A
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === "topics" && renderTopicsTab()}
        {activeTab === "assessments" && renderAssessmentsTab()}
        {activeTab === "qna" && renderQnATab()}
      </ScrollView>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  centerContent: { justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 16, fontSize: 16, color: "#64748B" },
  errorText: { marginTop: 16, fontSize: 18, fontWeight: "bold", color: "#EF4444" },
  backButtonError: { marginTop: 20, backgroundColor: "#4E54C8", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  header: { backgroundColor: "#4E54C8", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerBackButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerContent: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)", marginTop: 4 },
  placeholder: { width: 40 },

  tabBar: { flexDirection: "row", backgroundColor: "#fff", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, gap: 6 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#4E54C8" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#64748B" },
  tabTextActive: { color: "#4E54C8" },

  content: { flex: 1 },
  tabContent: { padding: 20 },

  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#1E293B", marginTop: 16 },
  emptySubtext: { fontSize: 14, color: "#64748B", marginTop: 8, textAlign: "center" },

  topicCard: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  topicHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  topicInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  topicName: { flex: 1, fontSize: 16, fontWeight: "600", color: "#1E293B" },
  topicMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  resourceCount: { fontSize: 12, color: "#64748B" },

  resourcesList: { borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 8 },
  resourceItem: { flexDirection: "row", alignItems: "center", padding: 12, marginHorizontal: 12, marginBottom: 8, backgroundColor: "#F8FAFC", borderRadius: 8 },
  resourceIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#EEF2FF", justifyContent: "center", alignItems: "center", marginRight: 12 },
  resourceInfo: { flex: 1 },
  resourceTitle: { fontSize: 14, fontWeight: "600", color: "#1E293B", marginBottom: 2 },
  resourceType: { fontSize: 12, color: "#64748B" },

  assessmentCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  assessmentHeader: { flexDirection: "row", marginBottom: 12 },
  assessmentIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#FEE2E2", justifyContent: "center", alignItems: "center", marginRight: 12 },
  assessmentInfo: { flex: 1 },
  assessmentTitle: { fontSize: 16, fontWeight: "bold", color: "#1E293B", marginBottom: 4 },
  assessmentDescription: { fontSize: 14, color: "#64748B", lineHeight: 20 },
  assessmentFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  assessmentMeta: { flexDirection: "row", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#64748B" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusActive: { backgroundColor: "#DCFCE7" },
  statusInactive: { backgroundColor: "#FEE2E2" },
  statusText: { fontSize: 12, fontWeight: "bold", textTransform: "capitalize" },

  askQuestionButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#4E54C8", padding: 16, borderRadius: 12, marginBottom: 20, justifyContent: "center", gap: 12 },
  askQuestionText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
