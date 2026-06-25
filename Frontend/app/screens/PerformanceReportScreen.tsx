// app/screens/PerformanceReportScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type Subject = {
  id: number;
  name: string;
  currentGrade: number;
  previousGrade: number;
  assessments: Assessment[];
  trend: 'up' | 'down' | 'stable';
};

type Assessment = {
  id: number;
  title: string;
  score: number;
  maxScore: number;
  date: string;
  subject: string;
};

export default function PerformanceReportScreen() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const [loading, setLoading] = useState(true);
  const [childData, setChildData] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [overallStats, setOverallStats] = useState<any>(null);

  useEffect(() => {
    loadPerformanceData();
  }, [childId]);

  const loadPerformanceData = async () => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API response
      const mockChildData = {
        name: "John Doe",
        grade: "Grade 10",
        school: "Westville High",
        overallAverage: 78.5,
        classRank: 12,
        totalStudents: 45
      };

      const mockSubjects = [
        {
          id: 1,
          name: "Mathematics",
          currentGrade: 85,
          previousGrade: 78,
          trend: 'up' as const,
          assessments: [
            { id: 1, title: "Algebra Test", score: 88, maxScore: 100, date: "2024-01-15", subject: "Mathematics" },
            { id: 2, title: "Geometry Quiz", score: 82, maxScore: 100, date: "2024-01-10", subject: "Mathematics" }
          ]
        },
        {
          id: 2,
          name: "English",
          currentGrade: 72,
          previousGrade: 75,
          trend: 'down' as const,
          assessments: [
            { id: 3, title: "Essay Writing", score: 70, maxScore: 100, date: "2024-01-12", subject: "English" },
            { id: 4, title: "Literature Review", score: 74, maxScore: 100, date: "2024-01-08", subject: "English" }
          ]
        },
        {
          id: 3,
          name: "Science",
          currentGrade: 79,
          previousGrade: 79,
          trend: 'stable' as const,
          assessments: [
            { id: 5, title: "Physics Lab", score: 81, maxScore: 100, date: "2024-01-14", subject: "Science" },
            { id: 6, title: "Chemistry Test", score: 77, maxScore: 100, date: "2024-01-09", subject: "Science" }
          ]
        }
      ];

      const mockOverallStats = {
        totalAssessments: 15,
        averageScore: 78.5,
        highestScore: 95,
        lowestScore: 62,
        improvementTrend: '+3.2%'
      };

      setChildData(mockChildData);
      setSubjects(mockSubjects);
      setOverallStats(mockOverallStats);
    } catch (error) {
      console.error('Failed to load performance data:', error);
      Alert.alert('Error', 'Failed to load performance report');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove-outline';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#23A455';
      case 'down': return '#FF3B30';
      default: return '#666';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return '#23A455';
    if (grade >= 70) return '#FF9346';
    if (grade >= 60) return '#FFD60A';
    return '#FF3B30';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0B0B44" />
        <Text style={styles.loadingText}>Loading performance report...</Text>
      </View>
    );
  }

  if (!childData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load performance data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.childName}>{childData.name}</Text>
        <Text style={styles.childDetails}>{childData.grade} • {childData.school}</Text>
      </View>

      {/* Overall Performance */}
      <View style={styles.overallCard}>
        <Text style={styles.cardTitle}>Overall Performance</Text>
        <View style={styles.overallStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{childData.overallAverage}%</Text>
            <Text style={styles.statLabel}>Average Grade</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>#{childData.classRank}</Text>
            <Text style={styles.statLabel}>Class Rank</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{overallStats.improvementTrend}</Text>
            <Text style={styles.statLabel}>Improvement</Text>
          </View>
        </View>
      </View>

      {/* Subject Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subject Performance</Text>
        {subjects.map((subject) => (
          <View key={subject.id} style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <View style={styles.gradeContainer}>
                <Text style={[styles.currentGrade, { color: getGradeColor(subject.currentGrade) }]}>
                  {subject.currentGrade}%
                </Text>
                <View style={styles.trendContainer}>
                  <Ionicons 
                    name={getTrendIcon(subject.trend)} 
                    size={16} 
                    color={getTrendColor(subject.trend)} 
                  />
                  <Text style={[styles.trendText, { color: getTrendColor(subject.trend) }]}>
                    {subject.previousGrade}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Recent Assessments */}
            <View style={styles.assessmentsContainer}>
              <Text style={styles.assessmentsTitle}>Recent Assessments</Text>
              {subject.assessments.map((assessment) => (
                <View key={assessment.id} style={styles.assessmentItem}>
                  <View style={styles.assessmentInfo}>
                    <Text style={styles.assessmentTitle}>{assessment.title}</Text>
                    <Text style={styles.assessmentDate}>
                      {new Date(assessment.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.assessmentScore, { color: getGradeColor((assessment.score / assessment.maxScore) * 100) }]}>
                    {assessment.score}/{assessment.maxScore}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Performance Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Assessments</Text>
            <Text style={styles.summaryValue}>{overallStats.totalAssessments}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Highest Score</Text>
            <Text style={[styles.summaryValue, { color: '#23A455' }]}>{overallStats.highestScore}%</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Lowest Score</Text>
            <Text style={[styles.summaryValue, { color: '#FF3B30' }]}>{overallStats.lowestScore}%</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Class Position</Text>
            <Text style={styles.summaryValue}>{childData.classRank} of {childData.totalStudents}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
  },
  
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  childName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0B0B44',
  },
  childDetails: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  
  overallCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B0B44',
    marginBottom: 15,
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0B0B44',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B0B44',
    marginBottom: 15,
  },
  
  subjectCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B0B44',
  },
  gradeContainer: {
    alignItems: 'flex-end',
  },
  currentGrade: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  trendText: {
    fontSize: 12,
    marginLeft: 2,
  },
  
  assessmentsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  assessmentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B0B44',
    marginBottom: 10,
  },
  assessmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentTitle: {
    fontSize: 14,
    color: '#333',
  },
  assessmentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  assessmentScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B0B44',
  },
});