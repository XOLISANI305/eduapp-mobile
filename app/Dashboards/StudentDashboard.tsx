import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  Image, 
  TextInput, 
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ScrollView
} from "react-native";
import { useRouter } from 'expo-router';
import { MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getEnrolledSubjects, User, Subject, Enrollment, getErrorMessage } from "../services/api";

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadData = async () => {
    try {
      setError(null);
      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        setError("User not found. Please log in again.");
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      const parsedUser: User = JSON.parse(userData);
      setUser(parsedUser);

      const enrolled = await getEnrolledSubjects();
      setEnrollments(enrolled);
      
    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
      const errorMessage = getErrorMessage(err);
      setError(`Failed to load enrolled subjects: ${errorMessage}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const enrolledSubjects = enrollments.map(e => e.subject).filter(Boolean) as Subject[];
  
  const filteredSubjects = enrolledSubjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (subject.code && subject.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const navigateToSubject = (subjectId: string) => {
    router.push({
      pathname: '/Dashboards/SubjectDetail',
      params: { id: subjectId }
    });
  };

  const navigateToSubjectBrowser = () => {
    router.push('/Dashboards/SubjectBrowser');
  };

  const goBackToHome = () => {
    // Navigate back to the main home screen
    router.back();
    
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderSubjectCard = ({ item }: { item: Subject }) => (
    <TouchableOpacity 
      style={styles.subjectCard} 
      onPress={() => navigateToSubject(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.subjectHeader}>
        <View style={styles.subjectIcon}>
          <MaterialIcons name="book" size={24} color="#4E54C8" />
        </View>
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.subjectGrade}>Grade {item.grade || 'Not specified'}</Text>
        </View>
        <View style={styles.subjectActions}>
          <TouchableOpacity style={styles.chatButton}>
            <MaterialIcons name="chat" size={18} color="#4E54C8" />
          </TouchableOpacity>
          <View style={styles.enrolledBadge}>
            <MaterialIcons name="check-circle" size={16} color="#10B981" />
          </View>
        </View>
      </View>
      
      <Text style={styles.subjectDescription} numberOfLines={3}>
        {item.description || "Explore topics, resources, and assessments for this subject"}
      </Text>
      
      {item.code && (
        <View style={styles.codeContainer}>
          <Text style={styles.subjectCode}>
            {item.code}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadData}
        >
          <MaterialIcons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialIcons name="person-off" size={64} color="#CBD5E1" />
        <Text style={styles.errorText}>User not found. Please log in again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={goBackToHome} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Student Dashboard</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <MaterialIcons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4E54C8"]}
            tintColor="#4E54C8"
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user.full_name} 👋</Text>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.full_name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View style={styles.statusIndicator} />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#EEF2FF' }]}>
              <MaterialIcons name="book" size={24} color="#4E54C8" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statNumber}>{enrolledSubjects.length}</Text>
              <Text style={styles.statLabel}>Enrolled Subjects</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#F0F9FF' }]}>
              <MaterialIcons name="assignment" size={24} color="#0EA5E9" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Pending Work</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={navigateToSubjectBrowser}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#EEF2FF' }]}>
                <MaterialIcons name="explore" size={24} color="#4E54C8" />
              </View>
              <Text style={styles.actionText}>Browse Subjects</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#F0F9FF' }]}>
                <MaterialIcons name="quiz" size={24} color="#0EA5E9" />
              </View>
              <Text style={styles.actionText}>Assessments</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}>
                <MaterialIcons name="leaderboard" size={24} color="#22C55E" />
              </View>
              <Text style={styles.actionText}>Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#FFFBEB' }]}>
                <MaterialIcons name="schedule" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your enrolled subjects..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery !== "" && (
            <TouchableOpacity 
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery("")}
            >
              <Feather name="x" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Enrolled Subjects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>My Enrolled Subjects</Text>
              <Text style={styles.sectionSubtitle}>
                Subjects you&apos;re currently enrolled in
              </Text>
            </View>
            <Text style={styles.subjectsCount}>
              {filteredSubjects.length} {filteredSubjects.length === 1 ? 'subject' : 'subjects'}
            </Text>
          </View>

          {filteredSubjects.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons 
                name={searchQuery ? "search-off" : "book"} 
                size={64} 
                color="#CBD5E1" 
              />
              <Text style={styles.emptyText}>
                {searchQuery ? "No subjects found" : "No enrolled subjects"}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery 
                  ? "Try adjusting your search terms"
                  : "Browse subjects to get started with your learning"
                }
              </Text>
              <TouchableOpacity 
                style={styles.browseButton}
                onPress={navigateToSubjectBrowser}
              >
                <MaterialIcons name="explore" size={20} color="#fff" />
                <Text style={styles.browseButtonText}>Browse All Subjects</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.subjectsGrid}>
              {filteredSubjects.map((subject) => (
                <TouchableOpacity 
                  key={subject.id}
                  style={styles.subjectCard} 
                  onPress={() => navigateToSubject(subject.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.subjectHeader}>
                    <View style={styles.subjectIcon}>
                      <MaterialIcons name="book" size={24} color="#4E54C8" />
                    </View>
                    <View style={styles.subjectInfo}>
                      <Text style={styles.subjectName} numberOfLines={2}>
                        {subject.name}
                      </Text>
                      <Text style={styles.subjectGrade}>Grade {subject.grade || 'Not specified'}</Text>
                    </View>
                    <View style={styles.subjectActions}>
                      <TouchableOpacity style={styles.chatButton}>
                        <MaterialIcons name="chat" size={18} color="#4E54C8" />
                      </TouchableOpacity>
                      <View style={styles.enrolledBadge}>
                        <MaterialIcons name="check-circle" size={16} color="#10B981" />
                      </View>
                    </View>
                  </View>
                  
                  <Text style={styles.subjectDescription} numberOfLines={3}>
                    {subject.description || "Explore topics, resources, and assessments for this subject"}
                  </Text>
                  
                  {subject.code && (
                    <View style={styles.codeContainer}>
                      <Text style={styles.subjectCode}>
                        {subject.code}
                      </Text>
                    </View>
                  )}
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
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

  // Welcome Section
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#1E293B",
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: "#4E54C8",
    fontWeight: '600',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4E54C8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  // Section Styles
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  subjectsCount: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },

  // Quick Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    padding: 0,
  },
  clearSearchButton: {
    padding: 4,
  },

  // Subjects Grid
  subjectsGrid: {
    gap: 16,
  },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
    lineHeight: 20,
  },
  subjectGrade: {
    fontSize: 14,
    color: '#4E54C8',
    fontWeight: '600',
  },
  subjectActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enrolledBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  codeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subjectCode: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4E54C8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Error States
  errorText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4E54C8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});