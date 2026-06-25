// app/screens/ChildPerformanceScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { parentTrackingApi } from '../services/api';

interface PerformanceData {
  overall: {
    average: number;
    total_assessments: number;
    latest_assessment: string;
  };
  by_subject: Array<{
    subject: string;
    average_score: number;
    assessment_count: number;
    best_score: number;
    worst_score: number;
  }>;
  recent_assessments: Array<{
    title: string;
    subject: string;
    type: string;
    score: number;
    date: string;
  }>;
}

export default function ChildPerformanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { childId, childName } = params;
  
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPerformance();
  }, [childId]);

  const loadPerformance = async () => {
    try {
      setError(null);
      console.log('Loading performance for childId:', childId);
      const data = await parentTrackingApi.getChildPerformance(childId as string);
      console.log('Performance data received:', data);
      setPerformance(data);
    } catch (err: any) {
      console.log('Performance load error:', err);
      console.log('Error response:', err.response?.data);
      console.log('Error status:', err.response?.status);
      setError(err.message || 'Failed to load performance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPerformance();
  };

  const getGradeColor = (score: number): string => {
    if (score >= 80) return "#10B981"; // Green
    if (score >= 60) return "#F59E0B"; // Orange
    return "#EF4444"; // Red
  };

  const getGradeIcon = (score: number) => {
    if (score >= 80) return "emoji-events";
    if (score >= 60) return "check-circle";
    return "warning";
  };

  const getGradeText = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Improvement";
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading performance...</Text>
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
        <Text style={styles.headerTitle}>Performance</Text>
        <TouchableOpacity onPress={loadPerformance} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Child Info Card */}
        <View style={styles.childInfoCard}>
          <View style={styles.childIcon}>
            <MaterialIcons name="school" size={32} color="#4E54C8" />
          </View>
          <View style={styles.childInfo}>
            <Text style={styles.childName}>{childName}</Text>
            <Text style={styles.childSubtitle}>Academic Performance</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <MaterialIcons name="warning" size={24} color="#F59E0B" />
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>Unable to load data</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
            <TouchableOpacity onPress={loadPerformance} style={styles.retryButton}>
              <MaterialIcons name="refresh" size={16} color="#4E54C8" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Overall Performance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overall Performance</Text>
              <View style={styles.overallCard}>
                <View style={styles.overallStat}>
                  <View style={[styles.overallIcon, { backgroundColor: "#EEF2FF" }]}>
                    <MaterialIcons name="speed" size={24} color="#4E54C8" />
                  </View>
                  <Text style={[
                    styles.overallScore, 
                    { color: getGradeColor(performance?.overall.average || 0) }
                  ]}>
                    {performance?.overall.average.toFixed(1)}%
                  </Text>
                  <Text style={styles.overallLabel}>Average Score</Text>
                  <Text style={styles.overallGrade}>
                    {getGradeText(performance?.overall.average || 0)}
                  </Text>
                </View>
                
                <View style={styles.overallStats}>
                  <View style={styles.overallStatItem}>
                    <Text style={styles.overallStatNumber}>
                      {performance?.overall.total_assessments || 0}
                    </Text>
                    <Text style={styles.overallStatLabel}>Total Assessments</Text>
                  </View>
                  <View style={styles.overallStatItem}>
                    <Text style={styles.overallStatDate}>
                      {performance?.overall.latest_assessment ? 
                        new Date(performance.overall.latest_assessment).toLocaleDateString() : 'N/A'
                      }
                    </Text>
                    <Text style={styles.overallStatLabel}>Last Assessment</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Subject Breakdown */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Performance by Subject</Text>
                <Text style={styles.subjectsCount}>
                  {performance?.by_subject?.length || 0} subject{performance?.by_subject?.length !== 1 ? 's' : ''}
                </Text>
              </View>

              {performance?.by_subject && performance.by_subject.length > 0 ? (
                <View style={styles.subjectsList}>
                  {performance.by_subject.map((subject, index) => (
                    <View key={index} style={styles.subjectCard}>
                      <View style={styles.subjectHeader}>
                        <View style={styles.subjectInfo}>
                          <View style={styles.subjectIcon}>
                            <MaterialIcons name="book" size={20} color="#4E54C8" />
                          </View>
                          <Text style={styles.subjectName}>{subject.subject}</Text>
                        </View>
                        <View style={[
                          styles.scoreBadge,
                          { backgroundColor: getGradeColor(subject.average_score) }
                        ]}>
                          <MaterialIcons 
                            name={getGradeIcon(subject.average_score)} 
                            size={16} 
                            color="#fff" 
                          />
                          <Text style={styles.scoreText}>{subject.average_score.toFixed(1)}%</Text>
                        </View>
                      </View>
                      
                      <View style={styles.subjectDetails}>
                        <View style={styles.subjectDetail}>
                          <Text style={styles.detailLabel}>Assessments</Text>
                          <Text style={styles.detailValue}>{subject.assessment_count}</Text>
                        </View>
                        <View style={styles.subjectDetail}>
                          <Text style={styles.detailLabel}>Best Score</Text>
                          <Text style={[styles.detailValue, { color: "#10B981" }]}>
                            {subject.best_score}%
                          </Text>
                        </View>
                        <View style={styles.subjectDetail}>
                          <Text style={styles.detailLabel}>Worst Score</Text>
                          <Text style={[styles.detailValue, { color: "#EF4444" }]}>
                            {subject.worst_score}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <MaterialIcons name="book" size={64} color="#CBD5E1" />
                  <Text style={styles.emptyText}>No subject data available</Text>
                  <Text style={styles.emptySubtext}>
                    Assessment data will appear here as your child completes tests
                  </Text>
                </View>
              )}
            </View>

            {/* Recent Assessments */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Assessments</Text>
                <Text style={styles.assessmentsCount}>
                  {performance?.recent_assessments?.length || 0} assessment{performance?.recent_assessments?.length !== 1 ? 's' : ''}
                </Text>
              </View>

              {performance?.recent_assessments && performance.recent_assessments.length > 0 ? (
                <View style={styles.assessmentsList}>
                  {performance.recent_assessments.map((assessment, index) => (
                    <View key={index} style={styles.assessmentCard}>
                      <View style={styles.assessmentHeader}>
                        <View style={styles.assessmentIcon}>
                          <MaterialIcons name="quiz" size={20} color="#4E54C8" />
                        </View>
                        <View style={styles.assessmentInfo}>
                          <Text style={styles.assessmentTitle}>{assessment.title}</Text>
                          <Text style={styles.assessmentSubject}>{assessment.subject}</Text>
                        </View>
                        <View style={[
                          styles.assessmentScore,
                          { backgroundColor: getGradeColor(assessment.score) + '20' }
                        ]}>
                          <Text style={[
                            styles.assessmentScoreText,
                            { color: getGradeColor(assessment.score) }
                          ]}>
                            {assessment.score}%
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.assessmentFooter}>
                        <Text style={styles.assessmentType}>{assessment.type}</Text>
                        <Text style={styles.assessmentDate}>
                          {new Date(assessment.date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <MaterialIcons name="assignment" size={64} color="#CBD5E1" />
                  <Text style={styles.emptyText}>No recent assessments</Text>
                  <Text style={styles.emptySubtext}>
                    Recent test results will appear here
                  </Text>
                </View>
              )}
            </View>
          </>
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
  childInfoCard: {
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
  childIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  childSubtitle: {
    fontSize: 14,
    color: "#64748B",
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
  subjectsCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  assessmentsCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  overallCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  overallStat: {
    alignItems: "center",
    marginBottom: 16,
  },
  overallIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  overallScore: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  overallLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  overallGrade: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4E54C8",
  },
  overallStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  overallStatItem: {
    alignItems: "center",
    flex: 1,
  },
  overallStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  overallStatDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  overallStatLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  subjectsList: {
    gap: 16,
  },
  subjectCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subjectInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
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
  subjectDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subjectDetail: {
    alignItems: "center",
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  assessmentsList: {
    gap: 12,
  },
  assessmentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  assessmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  assessmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  assessmentSubject: {
    fontSize: 12,
    color: "#64748B",
  },
  assessmentScore: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  assessmentScoreText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  assessmentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assessmentType: {
    fontSize: 12,
    color: "#64748B",
  },
  assessmentDate: {
    fontSize: 12,
    color: "#64748B",
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
});