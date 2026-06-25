// app/screens/AssessmentSubmissionsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { 
  StudentSubmission, 
  getAssessmentSubmissions, 
  getAssessmentStats, 
  analyzeSubmission 
} from "../services/api";

export default function AssessmentSubmissionsScreen() {
  const router = useRouter();
  const { assessmentId, title } = useLocalSearchParams<{ assessmentId: string; title?: string }>();
  
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, [assessmentId]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading submissions for assessment:", assessmentId);
      
      const submissionsData = await getAssessmentSubmissions(assessmentId);
      console.log("📊 Submissions data:", submissionsData);
      
      const statsData = await getAssessmentStats(assessmentId);
      console.log("📈 Stats data:", statsData);
      
      setSubmissions(submissionsData);
      setStats(statsData);
    } catch (error: any) {
      console.error("❌ Failed to load submissions:", error);
      Alert.alert("Error", "Failed to load submissions: " + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubmissions();
    setRefreshing(false);
  };

  const handleViewSubmission = (submission: StudentSubmission) => {
    router.push({
      pathname: "/screens/StudentSubmissionDetail",
      params: { 
        submission: JSON.stringify(submission),
        studentName: submission.student_name,
        assessmentTitle: title || "Assessment"
      }
    });
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return "#10B981";
    if (percentage >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const getGradeText = (percentage: number) => {
    if (percentage >= 80) return "Excellent";
    if (percentage >= 60) return "Good";
    if (percentage >= 40) return "Average";
    return "Needs Improvement";
  };

  const getGradeIcon = (percentage: number) => {
    if (percentage >= 80) return "emoji-events";
    if (percentage >= 60) return "check-circle";
    if (percentage >= 40) return "info";
    return "warning";
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading submissions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submissions</Text>
        <TouchableOpacity onPress={loadSubmissions} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Assessment Info */}
        <View style={styles.assessmentInfoCard}>
          <View style={styles.assessmentIcon}>
            <MaterialIcons name="assignment" size={32} color="#4E54C8" />
          </View>
          <View style={styles.assessmentInfo}>
            <Text style={styles.assessmentTitle}>{title || "Assessment Submissions"}</Text>
            <Text style={styles.assessmentSubtitle}>
              {submissions.length} Student{submissions.length !== 1 ? "s" : ""} Submitted
            </Text>
          </View>
        </View>

        {/* Statistics Card */}
        {stats && stats.total_submissions > 0 && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.average_score}%</Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.highest_score}%</Text>
              <Text style={styles.statLabel}>Highest</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.lowest_score}%</Text>
              <Text style={styles.statLabel}>Lowest</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total_submissions}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        )}

        {/* Submissions List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Student Submissions</Text>
            <Text style={styles.submissionsCount}>
              {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {submissions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="assignment" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>No submissions yet</Text>
              <Text style={styles.emptySubtext}>
                Students haven&apos;t submitted this assessment yet
              </Text>
              <TouchableOpacity onPress={loadSubmissions} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.submissionsList}>
              {submissions.map((submission) => {
                const analysis = analyzeSubmission(submission);
                
                return (
                  <TouchableOpacity 
                    key={submission.id}
                    style={styles.submissionCard}
                    onPress={() => handleViewSubmission(submission)}
                  >
                    <View style={styles.submissionHeader}>
                      <View style={styles.studentInfo}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {submission.student_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "S"}
                          </Text>
                        </View>
                        <View style={styles.studentDetails}>
                          <Text style={styles.studentName}>{submission.student_name || "Unknown Student"}</Text>
                          <Text style={styles.studentEmail}>{submission.student_email || ""}</Text>
                        </View>
                      </View>
                      <View style={styles.scoreSection}>
                        <View style={[
                          styles.scoreBadge,
                          { backgroundColor: getGradeColor(analysis.percentage) }
                        ]}>
                          <MaterialIcons 
                            name={getGradeIcon(analysis.percentage)} 
                            size={16} 
                            color="#fff" 
                          />
                          <Text style={styles.scoreText}>{analysis.percentage}%</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.submissionDetails}>
                      <Text style={styles.submissionDate}>
                        Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                      </Text>
                      <Text style={styles.marksText}>
                        {submission.score}/{analysis.totalQuestions} correct • {getGradeText(analysis.percentage)}
                      </Text>
                    </View>

                    <View style={styles.viewSubmission}>
                      <Text style={styles.viewSubmissionText}>View Details</Text>
                      <MaterialIcons name="chevron-right" size={20} color="#4E54C8" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
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
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  assessmentInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  assessmentIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  assessmentSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4E54C8",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 16,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  submissionsCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  submissionsList: {
    gap: 16,
  },
  submissionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  submissionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4E54C8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    color: "#64748B",
  },
  scoreSection: {
    alignItems: "flex-end",
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  scoreText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  submissionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  submissionDate: {
    fontSize: 12,
    color: "#64748B",
  },
  marksText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  viewSubmission: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  viewSubmissionText: {
    fontSize: 14,
    color: "#4E54C8",
    fontWeight: "600",
    marginRight: 4,
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
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#4E54C8",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});