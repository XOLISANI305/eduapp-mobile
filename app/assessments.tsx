import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import API functions and types
import { 
  getEnrolledSubjects, 
  Enrollment, 
  getAvailableSubjects,
  Subject,
  getSubjectDetails
} from './services/api';

interface SubjectWithAssessments extends Subject {
  assessments: any[];
}

export default function AssessmentsScreen() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [enrolledSubjects, setEnrolledSubjects] = useState<Enrollment[]>([]);
  const [subjectsWithAssessments, setSubjectsWithAssessments] = useState<SubjectWithAssessments[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Fetch user role
  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setRole(user.role);
      }
    };
    fetchUser();
  }, []);

  const loadData = async () => {
    if (role !== "student") return; 
    try {
      setLoading(true);
      const [subjects, availableSubs] = await Promise.all([
        getEnrolledSubjects(),
        getAvailableSubjects()
      ]);
      setEnrolledSubjects(subjects);
      setAvailableSubjects(availableSubs);

      const subjectsWithAssessmentsData = await Promise.all(
        subjects.map(async (enrollment) => {
          try {
            const subjectDetails = await getSubjectDetails(enrollment.subject_id);
            return {
              ...subjectDetails.subject,
              assessments: subjectDetails.assessments || []
            };
          } catch (error) {
            return {
              id: enrollment.subject_id,
              name: enrollment.subject?.name || `Subject ${enrollment.subject_id}`,
              grade: enrollment.subject?.grade || 'Unknown',
              assessments: []
            };
          }
        })
      );

      setSubjectsWithAssessments(subjectsWithAssessmentsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load assessments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (role === "student") {
      loadData();
    }
  }, [role]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!role) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
      </View>
    );
  }

  if (role !== "student") {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialIcons name="lock" size={80} color="#F59E0B" />
        <Text style={styles.restrictedText}>
          Access Restricted{'\n'}
          Only students can view assessments. Please enroll as a student to continue.
        </Text>
        <TouchableOpacity 
          style={styles.enrollButton} 
          onPress={() => router.push('/Dashboards/SubjectBrowser')}
        >
          <MaterialIcons name="library-books" size={20} color="#fff" />
          <Text style={styles.enrollButtonText}>Browse Subjects</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Subjects & Assessments</Text>
          <Text style={styles.headerSubtitle}>
            {subjectsWithAssessments.length} enrolled subject{subjectsWithAssessments.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <MaterialIcons 
            name="refresh" 
            size={22} 
            color={refreshing ? "#94A3B8" : "#fff"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Message for Students */}
        <View style={styles.infoMessage}>
          <MaterialIcons name="info" size={20} color="#4E54C8" />
          <Text style={styles.infoText}>
            To finish or access your assessments, please visit your Student Dashboard.
          </Text>
        </View>

        {/* Subject Cards */}
        {subjectsWithAssessments.map((subject) => (
          <View key={subject.id} style={styles.subjectCard}>
            <Text style={styles.subjectName}>{subject.name}</Text>
            <Text style={styles.subjectGrade}>Grade {subject.grade}</Text>

            {subject.assessments.length === 0 ? (
              <Text style={styles.noAssessments}>No assessments yet</Text>
            ) : (
              subject.assessments.map((assess, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.assessmentButton}
                  onPress={() => Alert.alert('Start Assessment', `Assessment: ${assess.title}`)}
                >
                  <Text style={styles.assessmentButtonText}>{assess.title}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollView: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  restrictedText: { fontSize: 18, textAlign: 'center', marginTop: 20, color: '#64748B', lineHeight: 24 },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4E54C8',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 24,
  },
  enrollButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: '#4E54C8', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  refreshButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  infoMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    color: '#1E40AF',
    fontSize: 14,
    flex: 1,
  },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  subjectName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  subjectGrade: { fontSize: 14, color: '#4E54C8', fontWeight: '600', marginBottom: 8 },
  noAssessments: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  assessmentButton: {
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  assessmentButtonText: { color: '#4E54C8', fontWeight: '600' },
});
