import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { 
  getAvailableSubjects, 
  enrollInSubject, 
  getEnrolledSubjects, 
  Subject, 
  Enrollment, 
  getErrorMessage,
  getCurrentUser
} from '../services/api';


export default function SubjectBrowser() {
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null); // Store user role
  const router = useRouter();

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch logged-in user
      const user = await getCurrentUser();
      setUserRole(user?.role || null);

      // Fetch subjects
      const [available, enrolled] = await Promise.all([
        getAvailableSubjects(),
        getEnrolledSubjects()
      ]);
      setAvailableSubjects(available);
      setEnrolledSubjects(enrolled);

    } catch (error: any) {
      console.error('Error loading subjects:', error);
      Alert.alert('Error', getErrorMessage(error) || 'Failed to load subjects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnroll = async (subjectId: string) => {
    if (userRole !== 'student') {
      Alert.alert('Not Allowed', 'Only students can enroll in subjects');
      return;
    }

    try {
      setEnrolling(subjectId);
      await enrollInSubject(subjectId);
      await loadData();
      Alert.alert('Success', 'Successfully enrolled in subject');
    } catch (error: any) {
      console.error('Enrollment error:', error);
      Alert.alert('Error', getErrorMessage(error) || 'Failed to enroll in subject');
    } finally {
      setEnrolling(null);
    }
  };

  const isEnrolled = (subjectId: string) => {
    return enrolledSubjects.some(enrollment => 
      enrollment.subject_id.toString() === subjectId
    );
  };

  const goBack = () => {
    router.back();
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredSubjects = availableSubjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (subject.code && subject.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    subject.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading subjects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Subjects</Text>
        <View style={styles.placeholder} />
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
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery !== "" && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery("")}
            >
              <Feather name="x" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Section Header */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                {searchQuery ? "Search Results" : "Available Subjects"}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {searchQuery 
                  ? "Subjects matching your search" 
                  : "Choose subjects you want to study"
                }
              </Text>
            </View>
            <Text style={styles.subjectsCount}>
              {filteredSubjects.length} {filteredSubjects.length === 1 ? 'subject' : 'subjects'}
            </Text>
          </View>

          {filteredSubjects.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons 
                name={searchQuery ? "search-off" : "folder-open"} 
                size={64} 
                color="#CBD5E1" 
              />
              <Text style={styles.emptyText}>
                {searchQuery ? "No subjects found" : "No available subjects"}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery 
                  ? "Try adjusting your search terms"
                  : "You are already enrolled in all subjects or there are no subjects available."
                }
              </Text>
            </View>
          ) : (
            <View style={styles.subjectsGrid}>
              {filteredSubjects.map((subject) => {
                const enrolled = isEnrolled(subject.id);
                const canEnroll = userRole === 'student' && !enrolled;
                return (
                  <View key={subject.id} style={styles.subjectCard}>
                    <View style={styles.subjectHeader}>
                      <View style={styles.subjectIcon}>
                        <MaterialIcons name="book" size={24} color="#4E54C8" />
                      </View>
                      <View style={styles.subjectActions}>
                        {enrolled && (
                          <View style={styles.enrolledBadge}>
                            <MaterialIcons name="check-circle" size={16} color="#10B981" />
                          </View>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.subjectContent}>
                      <Text style={styles.subjectName} numberOfLines={2}>
                        {subject.name}
                      </Text>
                      <Text style={styles.subjectGrade}>Grade {subject.grade}</Text>
                      <Text style={styles.subjectDescription} numberOfLines={3}>
                        {subject.description || "Explore topics and resources for this subject"}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.enrollButton,
                        !canEnroll && { backgroundColor: '#E5E7EB' }
                      ]}
                      onPress={() => canEnroll && handleEnroll(subject.id)}
                      disabled={!canEnroll || enrolling === subject.id}
                    >
                      {enrolling === subject.id ? (
                        <ActivityIndicator size="small" color="#4E54C8" />
                      ) : (
                        <>
                          <MaterialIcons 
                            name="add-circle" 
                            size={20} 
                            color={canEnroll ? "#4E54C8" : "#9CA3AF"} 
                          />
                          <Text style={[styles.enrollButtonText, !canEnroll && { color: '#9CA3AF' }]}>
                            {enrolled ? "Enrolled" : "Enroll"}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
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
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  centerContent: { justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 16, fontSize: 16, color: "#64748B" },
  header: {
    backgroundColor: "#4E54C8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginLeft: 15 },
  placeholder: { width: 40 },
  content: { flex: 1 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#1E293B", padding: 0 },
  clearButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#4E54C8", justifyContent: "center", alignItems: "center" },
  section: { padding: 20, paddingTop: 0 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  sectionSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  subjectsCount: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  subjectsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  subjectCard: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  subjectIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  subjectActions: { flexDirection: 'row', alignItems: 'center' },
  enrolledBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' },
  subjectContent: { flex: 1 },
  subjectName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4, lineHeight: 20 },
  subjectGrade: { fontSize: 14, color: '#4E54C8', fontWeight: '600', marginBottom: 8 },
  subjectDescription: { fontSize: 12, color: '#64748B', lineHeight: 16, marginBottom: 16 },
  enrollButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2FF', padding: 12, borderRadius: 8, gap: 8 },
  enrollButtonText: { color: '#4E54C8', fontWeight: '600', fontSize: 14 },
  enrolledContainer: { backgroundColor: '#F0FDF4', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DCFCE7' },
  enrolledTextContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  enrolledText: { color: '#166534', fontWeight: '600', fontSize: 14 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 16, textAlign: 'center' },
  emptySubtext: { fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center', lineHeight: 20 },
});
