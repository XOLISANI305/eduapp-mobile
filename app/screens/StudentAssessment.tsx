// StudentAssessment.tsx - Updated with Modern Design
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';

import {
  getAssessment,
  submitAssessment,
  getSubmissionResult,
  getErrorMessage,
} from '../services/api';

interface Option {
  id: string;
  option_text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  marks: number;
  options: Option[];
}

interface Assessment {
  id: string;
  title: string;
  subject_name: string;
  questions: Question[];
  total_marks: number;
}

interface Answer {
  question_id: number;
  selected_option_id: number;
}

export default function StudentAssessment() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const assessmentId = params.assessmentId as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    loadAssessment();
    checkPreviousSubmission();
  }, [assessmentId]);

  const loadAssessment = async () => {
    try {
      setIsLoading(true);
      const data = await getAssessment(assessmentId);
      setAssessment(data);
    } catch (error) {
      console.error('Load assessment error:', error);
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const checkPreviousSubmission = async () => {
    try {
      const previousResult = await getSubmissionResult(assessmentId);
      if (previousResult) {
        setHasSubmitted(true);
        setResult(previousResult);
        Alert.alert(
          'Already Submitted',
          'You have already submitted this assessment. Would you like to view your results?',
          [
            { text: 'Go Back', onPress: () => router.back() },
            { text: 'View Results', onPress: () => setShowResult(true) }
          ]
        );
      }
    } catch (error: any) {
      console.log('ℹ️ No previous submission found (expected)');
      if (error.response?.status !== 404) {
        console.error('❌ Error checking submission:', error);
      }
      setHasSubmitted(false);
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (hasSubmitted) {
      Alert.alert('Info', 'You have already submitted this assessment');
      return;
    }
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getTotalQuestions = () => {
    return assessment?.questions?.length || 0;
  };

  const handleSubmit = () => {
    console.log('🎯 Web-compatible handleSubmit');
    
    if (hasSubmitted) {
      window.alert('You have already submitted this assessment');
      return;
    }

    const answered = getAnsweredCount();
    const total = getTotalQuestions();

    if (answered < total) {
      const shouldSubmit = window.confirm(
        `You have answered ${answered} out of ${total} questions. Are you sure you want to submit?`
      );
      if (shouldSubmit) {
        console.log('✅ User confirmed submission (incomplete)');
        confirmSubmit();
      } else {
        console.log('❌ User cancelled submission (incomplete)');
      }
    } else {
      const shouldSubmit = window.confirm(
        'Are you sure you want to submit your answers? You cannot change them after submission.'
      );
      if (shouldSubmit) {
        console.log('✅ User confirmed submission (complete)');
        confirmSubmit();
      } else {
        console.log('❌ User cancelled submission (complete)');
      }
    }
  };

  const confirmSubmit = async () => {
    try {
      console.log('📤 Starting submission...');
      console.log('🆔 Assessment ID:', assessmentId);
      console.log('📝 Answers:', answers);
      
      setIsSubmitting(true);

      const submissionAnswers = Object.entries(answers).map(([question_id, selected_option_id]) => ({
        question_id: parseInt(question_id),
        selected_option_id: parseInt(selected_option_id)
      }));

      const submissionData = {
        answers: submissionAnswers
      };

      console.log('📤 Final submission data:', submissionData);
      console.log('🌐 Calling submitAssessment API...');

      const response = await submitAssessment(assessmentId, submissionData);
      
      console.log('✅ Submission successful!', response);
      
      setResult({
        score: response.score,
        totalMarks: response.totalMarks,
        percentage: response.percentage
      });
      setHasSubmitted(true);
      setShowResult(true);

    } catch (error: any) {
      console.error('❌ Submit error:', error);
      console.error('❌ Error response:', error.response?.data);
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeResultModal = () => {
    setShowResult(false);
    router.back();
  };

  const goBack = () => {
    router.back();
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAssessment();
  };

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading assessment...</Text>
      </View>
    );
  }

  if (!assessment) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Assessment not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.retryButton}>
          <MaterialIcons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>MCQ Assessment</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
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
        {/* Assessment Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.assessmentHeader}>
            <View style={styles.assessmentIcon}>
              <MaterialIcons name="quiz" size={32} color="#4E54C8" />
            </View>
            <View style={styles.assessmentInfo}>
              <Text style={styles.assessmentTitle}>{assessment.title}</Text>
              <Text style={styles.assessmentSubject}>{assessment.subject_name}</Text>
              <Text style={styles.assessmentMarks}>{assessment.total_marks} total marks</Text>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.progressNumber}>{getAnsweredCount()}</Text>
                <Text style={styles.progressLabel}>Answered</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStat}>
                <Text style={styles.progressNumber}>{getTotalQuestions()}</Text>
                <Text style={styles.progressLabel}>Total</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStat}>
                <Text style={styles.progressNumber}>
                  {getTotalQuestions() > 0 
                    ? Math.round((getAnsweredCount() / getTotalQuestions()) * 100) 
                    : 0}%
                </Text>
                <Text style={styles.progressLabel}>Complete</Text>
              </View>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${getTotalQuestions() > 0 
                      ? (getAnsweredCount() / getTotalQuestions()) * 100 
                      : 0}%` 
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Questions List */}
        <View style={styles.questionsSection}>
          <Text style={styles.sectionTitle}>Questions</Text>
          
          {assessment.questions.map((question, index) => {
            const isAnswered = !!answers[question.id];
            
            return (
              <View key={question.id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <View style={[
                    styles.questionNumber,
                    isAnswered && styles.questionNumberAnswered
                  ]}>
                    <Text style={[
                      styles.questionNumberText,
                      isAnswered && styles.questionNumberTextAnswered
                    ]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.questionInfo}>
                    <Text style={styles.questionText}>{question.question_text}</Text>
                    <View style={styles.questionMeta}>
                      <View style={styles.marksBadge}>
                        <MaterialIcons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.marksText}>{question.marks} mark{question.marks !== 1 ? 's' : ''}</Text>
                      </View>
                      {isAnswered && (
                        <View style={styles.answeredBadge}>
                          <MaterialIcons name="check-circle" size={12} color="#10B981" />
                          <Text style={styles.answeredText}>Answered</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.optionsContainer}>
                  {question.options.map((option, optIndex) => {
                    const isSelected = answers[question.id] === option.id;
                    const letter = String.fromCharCode(65 + optIndex);
                    
                    return (
                      <TouchableOpacity
                        key={option.id}
                        onPress={() => handleSelectOption(question.id, option.id)}
                        style={[
                          styles.optionItem,
                          isSelected && styles.optionItemSelected,
                          hasSubmitted && styles.optionItemDisabled
                        ]}
                        disabled={hasSubmitted}
                      >
                        <View style={styles.optionContent}>
                          <View style={[
                            styles.optionLetter,
                            isSelected && styles.optionLetterSelected
                          ]}>
                            <Text style={[
                              styles.optionLetterText,
                              isSelected && styles.optionLetterTextSelected
                            ]}>
                              {letter}
                            </Text>
                          </View>
                          <Text style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected
                          ]}>
                            {option.option_text}
                          </Text>
                        </View>
                        
                        {isSelected && (
                          <MaterialIcons name="check-circle" size={20} color="#4E54C8" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Submit Button */}
      {!hasSubmitted && (
        <View style={styles.submitContainer}>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              (isSubmitting || hasSubmitted) && styles.submitButtonDisabled
            ]}
            disabled={isSubmitting || hasSubmitted}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Assessment</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Result Modal */}
      <Modal visible={showResult} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={[
                styles.resultIcon,
                { backgroundColor: result?.percentage >= 50 ? '#DCFCE7' : '#FEF3C7' }
              ]}>
                <MaterialIcons 
                  name={result?.percentage >= 50 ? "check-circle" : "info"} 
                  size={48} 
                  color={result?.percentage >= 50 ? "#10B981" : "#F59E0B"} 
                />
              </View>
              <Text style={styles.resultTitle}>
                {result?.percentage >= 50 ? "Congratulations!" : "Assessment Complete"}
              </Text>
              <Text style={styles.resultSubtitle}>
                {result?.percentage >= 50 ? "You passed the assessment!" : "Keep practicing to improve your score"}
              </Text>
            </View>

            <View style={styles.resultBody}>
              {/* Score Circle */}
              <View style={styles.scoreCircle}>
                <Text style={styles.scorePercentage}>{result?.percentage}%</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>

              {/* Score Breakdown */}
              <View style={styles.scoreBreakdown}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreItemLabel}>Correct Answers</Text>
                  <Text style={styles.scoreItemValue}>{result?.score}</Text>
                </View>
                <View style={styles.scoreDivider} />
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreItemLabel}>Total Marks</Text>
                  <Text style={styles.scoreItemValue}>{result?.totalMarks}</Text>
                </View>
                <View style={styles.scoreDivider} />
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreItemLabel}>Questions</Text>
                  <Text style={styles.scoreItemValue}>{getTotalQuestions()}</Text>
                </View>
              </View>

              {/* Performance Message */}
              <View style={[
                styles.performanceMessage,
                result?.percentage >= 50 ? styles.successMessage : styles.warningMessage
              ]}>
                <MaterialIcons 
                  name={result?.percentage >= 50 ? "emoji-events" : "school"} 
                  size={20} 
                  color={result?.percentage >= 50 ? "#10B981" : "#F59E0B"} 
                />
                <Text style={styles.performanceText}>
                  {result?.percentage >= 50 
                    ? "Excellent work! You've demonstrated strong understanding."
                    : "Review the material and try again to improve your score."
                  }
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={closeResultModal} style={styles.resultButton}>
              <Text style={styles.resultButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginLeft: 15,
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

  // Overview Card
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  assessmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  assessmentIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  assessmentSubject: {
    fontSize: 16,
    color: '#4E54C8',
    fontWeight: '600',
    marginBottom: 4,
  },
  assessmentMarks: {
    fontSize: 14,
    color: '#64748B',
  },

  // Progress Section
  progressSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4E54C8',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  progressDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4E54C8',
    borderRadius: 4,
  },

  // Questions Section
  questionsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },

  // Question Card
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  questionNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumberAnswered: {
    backgroundColor: '#4E54C8',
  },
  questionNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748B',
  },
  questionNumberTextAnswered: {
    color: '#fff',
  },
  questionInfo: {
    flex: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 8,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  marksBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  marksText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  answeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  answeredText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },

  // Options
  optionsContainer: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionItemSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4E54C8',
  },
  optionItemDisabled: {
    opacity: 0.6,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLetterSelected: {
    backgroundColor: '#4E54C8',
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
  },
  optionLetterTextSelected: {
    color: '#fff',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#475569',
    lineHeight: 20,
  },
  optionTextSelected: {
    color: '#1E293B',
    fontWeight: '500',
  },

  bottomSpacer: {
    height: 100,
  },

  // Submit Button
  submitContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4E54C8',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Result Modal
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  resultCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  resultBody: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 4,
    borderColor: '#E2E8F0',
  },
  scorePercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4E54C8',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  scoreBreakdown: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreItemLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  scoreItemValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  scoreDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  performanceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    gap: 8,
  },
  successMessage: {
    backgroundColor: '#F0FDF4',
  },
  warningMessage: {
    backgroundColor: '#FFFBEB',
  },
  performanceText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  resultButton: {
    backgroundColor: '#4E54C8',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  resultButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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