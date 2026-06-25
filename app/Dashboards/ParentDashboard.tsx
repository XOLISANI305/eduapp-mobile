// app/(tabs)/Dashboards/ParentDashboard.tsx
import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity,
  RefreshControl,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import { 
  fetchMyChildren,
  fetchMyStats,
  fetchMyActivities,
  User,
  Child,
  ParentStats,
  Activity,
  formatAverage,
  formatAttendance,
  parentTrackingApi
} from "../services/api";
import { MaterialIcons } from "@expo/vector-icons";
import LetterAvatar from "../(tabs)/components/LetterAvatar";

export default function ParentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ParentStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        setError("User data not found. Please login again.");
        setLoading(false);
        return;
      }
      
      const parsedUser: User = JSON.parse(userData);
      setUser(parsedUser);

      const [childrenData, statsData, activitiesData] = await Promise.all([
        fetchMyChildren(),
        fetchMyStats(),
        fetchMyActivities()
      ]);

      setChildren(childrenData);
      setStats(statsData);
      setActivities(activitiesData);

    } catch (err: any) {
      console.error("Dashboard loading error:", err);
      setError(err.message || "Failed to load dashboard data.");
      setStats({ total_children: 0, average_grade: 0, average_attendance: 0 });
      setActivities([]);
      setChildren([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleRemoveChild = async (childId: string, childName: string) => {
    try {
      Alert.alert(
        "Remove Child",
        `Are you sure you want to remove ${childName} from your account?`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Remove", 
            style: "destructive",
            onPress: async () => {
              await parentTrackingApi.unlinkChild(childId);
              Alert.alert("Success", `${childName} has been removed from your account`);
              loadDashboardData();
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to remove child");
    }
  };

  const handleViewPerformance = (childId: string, childName: string) => {
    router.push({
      pathname: '/screens/ChildPerformanceScreen',
      params: { childId, childName }
    });
  };

  const handleViewAttendance = (childId: string, childName: string) => {
    router.push({
      pathname: '/screens/ChildAttendanceScreen',
      params: { childId, childName }
    });
  };

  const handleViewActivities = (childId: string, childName: string) => {
    router.push({
      pathname: '/screens/ChildActivitiesScreen',
      params: { childId, childName }
    });
  };

  const getGradeLetter = (average: number): string => {
    if (average >= 90) return 'A';
    if (average >= 80) return 'B';
    if (average >= 70) return 'C';
    if (average >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (average: number) => {
    if (average >= 80) return "#10B981";
    if (average >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "#10B981";
    if (attendance >= 75) return "#F59E0B";
    return "#EF4444";
  };

  const handleRetry = () => {
    setLoading(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
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
        <Text style={styles.headerTitle}>Parent Dashboard</Text>
        <TouchableOpacity onPress={loadDashboardData} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Error Banner */}
        {error && (
          <View style={styles.errorCard}>
            <MaterialIcons name="warning" size={20} color="#F59E0B" />
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>Unable to load data</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
            <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
              <MaterialIcons name="refresh" size={16} color="#4E54C8" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIcon}>
            <MaterialIcons name="family-restroom" size={32} color="#4E54C8" />
          </View>
          <View style={styles.welcomeInfo}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.full_name || 'Parent'}</Text>
            <Text style={styles.roleText}>Parent</Text>
          </View>
          <TouchableOpacity 
            style={styles.addChildButton}
            onPress={() => router.push('/screens/LinkChildScreen')}
          >
            <MaterialIcons name="person-add" size={16} color="#fff" />
            <Text style={styles.addChildButtonText}>Add Child</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#EEF2FF" }]}>
              <MaterialIcons name="people" size={24} color="#4E54C8" />
            </View>
            <Text style={styles.statNumber}>{stats?.total_children || 0}</Text>
            <Text style={styles.statLabel}>Children</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#F0F9FF" }]}>
              <MaterialIcons name="school" size={24} color="#0EA5E9" />
            </View>
            <Text style={styles.statNumber}>
              {stats && stats.average_grade > 0 ? getGradeLetter(stats.average_grade) : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Avg Grade</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#F0FDF4" }]}>
              <MaterialIcons name="event" size={24} color="#10B981" />
            </View>
            <Text style={styles.statNumber}>
              {stats && stats.average_attendance > 0 ? Math.round(stats.average_attendance) : 0}%
            </Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
        </View>

        {/* Children Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Children</Text>
            <Text style={styles.childrenCount}>
              {children.length} child{children.length !== 1 ? 'ren' : ''}
            </Text>
          </View>

          {children.length > 0 ? (
            <View style={styles.childrenList}>
              {children.map((child) => (
                <View key={child.id} style={styles.childCard}>
                  <View style={styles.childHeader}>
                    <View style={styles.childInfo}>
                      <View style={styles.childAvatar}>
                        <Text style={styles.childAvatarText}>
                          {child.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'C'}
                        </Text>
                      </View>
                      <View style={styles.childDetails}>
                        <Text style={styles.childName}>{child.full_name}</Text>
                        <Text style={styles.childGrade}>
                          Grade {child.grade_level} • {child.class_name}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => handleRemoveChild(child.id, child.full_name)}
                    >
                      <MaterialIcons name="close" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.childStats}>
                    <View style={styles.childStatItem}>
                      <Text style={styles.childStatLabel}>Average</Text>
                      <Text style={[
                        styles.childStatValue,
                        { color: getGradeColor(child.overall_average) }
                      ]}>
                        {formatAverage(child.overall_average)}%
                      </Text>
                    </View>
                    <View style={styles.childStatItem}>
                      <Text style={styles.childStatLabel}>Attendance</Text>
                      <Text style={[
                        styles.childStatValue,
                        { color: getAttendanceColor(child.attendance_rate) }
                      ]}>
                        {formatAttendance(child.attendance_rate)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.childActions}>
                    <TouchableOpacity 
                      style={styles.childActionButton}
                      onPress={() => handleViewPerformance(child.id, child.full_name)}
                    >
                      <MaterialIcons name="bar-chart" size={16} color="#4E54C8" />
                      <Text style={styles.childActionText}>Performance</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.childActionButton}
                      onPress={() => handleViewAttendance(child.id, child.full_name)}
                    >
                      <MaterialIcons name="event" size={16} color="#4E54C8" />
                      <Text style={styles.childActionText}>Attendance</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.childActionButton}
                      onPress={() => handleViewActivities(child.id, child.full_name)}
                    >
                      <MaterialIcons name="list" size={16} color="#4E54C8" />
                      <Text style={styles.childActionText}>Activities</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="people-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>No children linked yet</Text>
              <Text style={styles.emptySubtext}>
                Add your children to start tracking their progress
              </Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/screens/LinkChildScreen')}
              >
                <Text style={styles.addButtonText}>Link Your First Child</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/*Activities Section */}
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
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    margin: 20,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  errorContent: {
    flex: 1,
    marginLeft: 12,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 2,
  },
  errorText: {
    fontSize: 12,
    color: "#92400E",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4E54C8",
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
  addChildButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4E54C8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addChildButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
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
  childrenCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  childrenList: {
    gap: 16,
  },
  childCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  childHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4E54C8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  childAvatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  childGrade: {
    fontSize: 14,
    color: "#64748B",
  },
  removeButton: {
    padding: 4,
  },
  childStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  childStatItem: {
    alignItems: "center",
  },
  childStatLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  childStatValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  childActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  childActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  childActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4E54C8",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    backgroundColor: "#fff",
    borderRadius: 16,
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
  addButton: {
    marginTop: 16,
    backgroundColor: "#4E54C8",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});