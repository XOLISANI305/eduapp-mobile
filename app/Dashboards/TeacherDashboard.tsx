// (tabs)/Dashboards/TeacherDashboard.tsx - Updated for Expo Router
import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  RefreshControl,
  FlatList
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import { 
  User, 
  getTeacherStats, 
  getTeacherAssessments,
  Assessment,
  getAssessmentSubmissions
} from "../services/api";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

export default function TeacherDashboard() {
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;
      
      const parsedUser: User = JSON.parse(userData);
      setUser(parsedUser);

      const [statsData, assessmentsData] = await Promise.all([
        getTeacherStats(),
        getTeacherAssessments()
      ]);

      setStats(statsData);
      setAssessments(assessmentsData);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  const handleCreateAssessment = () => {
    router.push('/screens/CreateAssessmentScreen');
  };

  const handleViewAssessment = (assessment: Assessment) => {
    if (!assessment.approved) {
      Alert.alert(
        'Pending Approval',
        'This assessment is pending admin approval. You cannot view submissions until it is approved.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    router.push({
      pathname: '/screens/AssessmentSubmissionsScreen',
      params: { 
        assessmentId: assessment.id.toString(),
        title: assessment.title 
      }
    });
  };

  const handleViewSubmissions = (assessment: Assessment) => {
    if (!assessment.approved) {
      Alert.alert(
        'Pending Approval',
        'This assessment is pending admin approval. Students cannot see it and submissions are not available.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    router.push({
      pathname: '/screens/AssessmentSubmissionsScreen',
      params: { 
        assessmentId: assessment.id.toString(),
        title: assessment.title 
      }
    });
  };

  const getApprovalStatus = (assessment: Assessment) => {
    if (assessment.approved) return "Approved";
    if (assessment.status === 'pending') return "Pending Approval";
    return "Rejected";
  };

  const getStatusColor = (assessment: Assessment) => {
    if (assessment.approved) return "#10B981";
    if (assessment.status === 'pending') return "#F59E0B";
    return "#EF4444";
  };

  const getStatusIcon = (assessment: Assessment) => {
    if (assessment.approved) return "check-circle";
    if (assessment.status === 'pending') return "schedule";
    return "cancel";
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialIcons name="error" size={48} color="#64748B" />
        <Text style={styles.loadingText}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teacher Dashboard</Text>
        <TouchableOpacity onPress={loadDashboardData} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIcon}>
            <MaterialIcons name="school" size={32} color="#4E54C8" />
          </View>
          <View style={styles.welcomeInfo}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user.full_name}</Text>
            <Text style={styles.roleText}>Teacher</Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#EEF2FF" }]}>
              <MaterialIcons name="assignment" size={24} color="#4E54C8" />
            </View>
            <Text style={styles.statNumber}>{stats?.totalAssessments || 0}</Text>
            <Text style={styles.statLabel}>Total Assessments</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}>
              <MaterialIcons name="schedule" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statNumber}>{stats?.pendingApproval || 0}</Text>
            <Text style={styles.statLabel}>Pending Approval</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#DCFCE7" }]}>
              <MaterialIcons name="grading" size={24} color="#10B981" />
            </View>
            <Text style={styles.statNumber}>{stats?.pendingGrading || 0}</Text>
            <Text style={styles.statLabel}>To Grade</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#F0F9FF" }]}>
              <MaterialIcons name="people" size={24} color="#0EA5E9" />
            </View>
            <Text style={styles.statNumber}>{stats?.totalStudents || 0}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCreateAssessment}
          >
            <View style={styles.actionIcon}>
              <MaterialIcons name="add-circle" size={28} color="#4E54C8" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Create Assessment</Text>
              <Text style={styles.actionSubtitle}>Create a new assessment for your students</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Recent Assessments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Assessments</Text>
            <Text style={styles.assessmentsCount}>
              {assessments.length} assessment{assessments.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {assessments.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="assignment" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>No assessments yet</Text>
              <Text style={styles.emptySubtext}>
                Create your first assessment to get started
              </Text>
            </View>
          ) : (
            <View style={styles.assessmentsList}>
              {assessments.slice(0, 5).map((assessment) => (
                <TouchableOpacity 
                  key={assessment.id}
                  style={styles.assessmentCard}
                  onPress={() => handleViewAssessment(assessment)}
                >
                  <View style={styles.assessmentHeader}>
                    <View style={styles.assessmentIcon}>
                      <MaterialIcons name="quiz" size={24} color="#4E54C8" />
                    </View>
                    <View style={styles.assessmentInfo}>
                      <Text style={styles.assessmentTitle} numberOfLines={2}>
                        {assessment.title}
                      </Text>
                      <Text style={styles.assessmentSubject}>
                        {assessment.subject_name || `Subject ID: ${assessment.subject_id}`}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(assessment) + '20' }
                    ]}>
                      <MaterialIcons 
                        name={getStatusIcon(assessment)} 
                        size={16} 
                        color={getStatusColor(assessment)} 
                      />
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(assessment) }
                      ]}>
                        {getApprovalStatus(assessment)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.assessmentFooter}>
                    <Text style={styles.assessmentDate}>
                      Created: {new Date(assessment.created_at).toLocaleDateString()}
                    </Text>
                    
                    {assessment.approved && (
                      <TouchableOpacity 
                        style={styles.viewSubmissionsButton}
                        onPress={() => handleViewSubmissions(assessment)}
                      >
                        <Text style={styles.viewSubmissionsText}>
                          View Submissions ({assessment.submission_count || 0})
                        </Text>
                        <MaterialIcons name="chevron-right" size={16} color="#4E54C8" />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
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
  welcomeCard: {
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
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: "#4E54C8",
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
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
  assessmentsCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  assessmentsList: {
    gap: 16,
  },
  assessmentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  assessmentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  assessmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
    lineHeight: 20,
  },
  assessmentSubject: {
    fontSize: 14,
    color: "#64748B",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
  },
  assessmentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  assessmentDate: {
    fontSize: 12,
    color: "#64748B",
  },
  viewSubmissionsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewSubmissionsText: {
    fontSize: 12,
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
});