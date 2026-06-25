// app/screens/StudentSubmissionDetail.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StudentSubmission, analyzeSubmission } from '../services/api';

export default function StudentSubmissionDetail() {
  const router = useRouter();
  const { submission, studentName, assessmentTitle } = useLocalSearchParams<{
    submission: string;
    studentName: string;
    assessmentTitle: string;
  }>();

  if (!submission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Submission data not found</Text>
      </View>
    );
  }

  const submissionData: StudentSubmission = JSON.parse(submission);
  const analysis = analyzeSubmission(submissionData);

  const renderAnswerDetail = (answer: any, index: number) => {
    // Since your backend doesn't provide detailed answer analysis in submissions,
    // we'll show basic information
    return (
      <View key={index} style={styles.answerCard}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>Q{index + 1}</Text>
          <View style={[
            styles.answerStatus,
            { backgroundColor: index < submissionData.score ? '#4CAF50' : '#F44336' }
          ]}>
            <Text style={styles.answerStatusText}>
              {index < submissionData.score ? 'Correct' : 'Incorrect'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.questionText}>
          {answer.question_text || `Question ${index + 1}`}
        </Text>
        
        <View style={styles.answerDetails}>
          <View style={styles.answerRow}>
            <Text style={styles.answerLabel}>Selected Answer:</Text>
            <Text style={styles.answerText}>
              {answer.selected_option_text || 'Answer recorded'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#0B0B44" />
        </TouchableOpacity>
        <View style={styles.headerMain}>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.assessmentTitle}>{assessmentTitle}</Text>
        </View>
        <View style={styles.scoreSection}>
          <View style={[
            styles.scoreBadge,
            { backgroundColor: analysis.percentage >= 60 ? '#4CAF50' : '#F44336' }
          ]}>
            <Text style={styles.scoreText}>{analysis.percentage}%</Text>
          </View>
          <Text style={styles.marksText}>
            {submissionData.score}/{analysis.totalQuestions}
          </Text>
        </View>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#4CAF50' }]}>
              {analysis.correctCount}
            </Text>
            <Text style={styles.summaryLabel}>Correct</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#F44336' }]}>
              {analysis.incorrectCount}
            </Text>
            <Text style={styles.summaryLabel}>Incorrect</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#666' }]}>
              {analysis.totalQuestions}
            </Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* Answers List */}
      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Question Answers</Text>
        
        {submissionData.answers?.map((answer, index) => 
          renderAnswerDetail(answer, index)
        ) || (
          <View style={styles.noAnswers}>
            <Text style={styles.noAnswersText}>
              Detailed answer information not available
            </Text>
            <Text style={styles.scoreSummary}>
              Score: {submissionData.score} out of {analysis.totalQuestions}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20 
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: { 
    padding: 8, 
    marginRight: 12 
  },
  headerMain: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B0B44',
  },
  assessmentTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scoreSection: {
    alignItems: 'center',
  },
  scoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  marksText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },

  summaryCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#eee',
  },

  scrollView: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B0B44',
    marginBottom: 16,
  },

  answerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0B0B44',
  },
  answerStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  answerStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  answerDetails: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  answerLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  answerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },

  noAnswers: {
    alignItems: 'center',
    padding: 40,
  },
  noAnswersText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  scoreSummary: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});