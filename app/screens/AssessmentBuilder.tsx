// AssessmentBuilder.tsx - MCQ Question Management Screen
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
  
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import {
  getAssessment,
  addQuestion,
  addOption,
  updateOption,
  deleteQuestion,
  deleteOption,
  getErrorMessage,
} from "../services/api";

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
  questions: Question[];
}

export default function AssessmentBuilder() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const assessmentId = params.assessmentId as string;
  const assessmentTitle = params.title as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  
  // Question modal state
  const [questionText, setQuestionText] = useState("");
  const [questionMarks, setQuestionMarks] = useState("1");
  
  // Option modal state
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [optionText, setOptionText] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    loadAssessment();
  }, [assessmentId]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const data = await getAssessment(assessmentId);
      setAssessment(data);
    } catch (error) {
      console.error("Load assessment error:", error);
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssessment();
    setRefreshing(false);
  };

  const handleAddQuestion = async () => {
    if (!questionText.trim()) {
      Alert.alert("Error", "Please enter a question");
      return;
    }

    const marks = parseInt(questionMarks) || 1;
    if (marks < 1) {
      Alert.alert("Error", "Marks must be at least 1");
      return;
    }

    try {
      setAdding("question");
      await addQuestion(assessmentId, questionText, "multiple_choice", marks);
      Alert.alert("Success", "Question added successfully!");
      setModalVisible(false);
      setQuestionText("");
      setQuestionMarks("1");
      await loadAssessment();
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setAdding(null);
    }
  };

  const handleAddOption = async () => {
  if (!optionText.trim()) {
    Alert.alert("Error", "Please enter an option");
    return;
  }

  if (!currentQuestionId) {
    Alert.alert("Error", "No question selected");
    return;
  }

  try {
    setAdding("option");

    // If this new option is marked correct, unset any existing
    // correct option(s) on the same question first so there's
    // only ever one correct answer per question.
    if (isCorrect) {
      const question = assessment?.questions.find(
        (q) => q.id === currentQuestionId
      );
      const previouslyCorrect = question?.options?.filter(
        (o) => o.is_correct
      );

      if (previouslyCorrect && previouslyCorrect.length > 0) {
        await Promise.all(
          previouslyCorrect.map((o) =>
            updateOption(o.id, { is_correct: false })
          )
        );
      }
    }

    await addOption(assessmentId, currentQuestionId, optionText.trim(), isCorrect);
    setOptionModalVisible(false);
    setOptionText("");
    setIsCorrect(false);
    await loadAssessment();
  } catch (error) {
    Alert.alert("Error", getErrorMessage(error));
  } finally {
    setAdding(null);
  }
};

  const handleDeleteQuestion = async (questionId: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this question and all its options?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setAdding(questionId);
              await deleteQuestion(questionId);
              Alert.alert("Success", "Question deleted successfully!");
              await loadAssessment();
            } catch (error) {
              Alert.alert("Error", getErrorMessage(error));
            } finally {
              setAdding(null);
            }
          },
        },
      ]
    );
  };

  const handleDeleteOption = async (optionId: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this option?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setAdding(optionId);
              await deleteOption(optionId);
              Alert.alert("Success", "Option deleted successfully!");
              await loadAssessment();
            } catch (error) {
              Alert.alert("Error", getErrorMessage(error));
            } finally {
              setAdding(null);
            }
          },
        },
      ]
    );
  };

  const openAddOptionModal = (questionId: string) => {
    setCurrentQuestionId(questionId);
    setOptionText("");
    setIsCorrect(false);
    setOptionModalVisible(true);
  };

  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleToggleCorrect = async (questionId: string, optionId: string) => {
  const question = assessment?.questions.find((q) => q.id === questionId);
  if (!question) return;

  try {
    setAdding(optionId);

    // Unset any other correct option on this question
    const others = question.options?.filter(
      (o) => o.is_correct && o.id !== optionId
    );
    if (others && others.length > 0) {
      await Promise.all(
        others.map((o) => updateOption(o.id, { is_correct: false }))
      );
    }

    await updateOption(optionId, { is_correct: true });
    await loadAssessment();
  } catch (error) {
    Alert.alert("Error", getErrorMessage(error));
  } finally {
    setAdding(null);
  }
};

  const getTotalMarks = () => {
    if (!assessment?.questions) return 0;
    return assessment.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading assessment...</Text>
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
        <Text style={styles.headerTitle}>Assessment Builder</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Assessment Info Card */}
        <View style={styles.assessmentInfoCard}>
          <View style={styles.assessmentIcon}>
            <MaterialIcons name="quiz" size={32} color="#4E54C8" />
          </View>
          <View style={styles.assessmentInfo}>
            <Text style={styles.assessmentTitle}>{assessmentTitle}</Text>
            <Text style={styles.assessmentSubtitle}>MCQ Assessment</Text>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{assessment?.questions?.length || 0}</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{getTotalMarks()}</Text>
            <Text style={styles.statLabel}>Total Marks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {assessment?.questions?.reduce((sum, q) => sum + (q.options?.length || 0), 0) || 0}
            </Text>
            <Text style={styles.statLabel}>Options</Text>
          </View>
        </View>

        {/* Add Question Button */}
        <TouchableOpacity 
          onPress={() => setModalVisible(true)} 
          style={styles.addQuestionButton}
        >
          <MaterialIcons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addQuestionButtonText}>Add New Question</Text>
        </TouchableOpacity>

        {/* Questions List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Questions</Text>
            <Text style={styles.questionsCount}>
              {assessment?.questions?.length || 0} questions
            </Text>
          </View>

          {assessment?.questions && assessment.questions.length > 0 ? (
            <View style={styles.questionsList}>
              {assessment.questions.map((question, index) => {
                const correctOption = question.options?.find(o => o.is_correct);
                const hasCorrectAnswer = !!correctOption;
                
                return (
                  <View key={question.id} style={styles.questionCard}>
                    <TouchableOpacity
                      onPress={() => toggleQuestionExpansion(question.id)}
                      style={styles.questionHeader}
                    >
                      <View style={styles.questionHeaderLeft}>
                        <View style={styles.questionNumber}>
                          <Text style={styles.questionNumberText}>{index + 1}</Text>
                        </View>
                        <View style={styles.questionHeaderText}>
                          <Text style={styles.questionText} numberOfLines={2}>
                            {question.question_text}
                          </Text>
                          <View style={styles.questionMeta}>
                            <Text style={styles.questionMetaText}>
                              {question.marks} {question.marks === 1 ? "mark" : "marks"}
                            </Text>
                            <View style={[
                              styles.answerStatusBadge,
                              hasCorrectAnswer ? styles.answerStatusComplete : styles.answerStatusIncomplete
                            ]}>
                              <Text style={styles.answerStatusText}>
                                {hasCorrectAnswer ? "✓ Answer Set" : "⚠ No Answer"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      <MaterialIcons 
                        name={expandedQuestions[question.id] ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                        size={24} 
                        color="#64748B" 
                      />
                    </TouchableOpacity>

                    {expandedQuestions[question.id] && (
                      <View style={styles.questionContent}>
                        {/* Full Question Text */}
                        <View style={styles.fullQuestionTextContainer}>
                          <Text style={styles.fullQuestionText}>{question.question_text}</Text>
                        </View>

                        {/* Options */}
                        <View style={styles.optionsSection}>
                          <View style={styles.optionsSectionHeader}>
                            <Text style={styles.optionsSectionTitle}>Options</Text>
                            <TouchableOpacity 
                              onPress={() => openAddOptionModal(question.id)}
                              style={styles.addOptionButton}
                            >
                              <MaterialIcons name="add" size={16} color="#4E54C8" />
                              <Text style={styles.addOptionButtonText}>Add Option</Text>
                            </TouchableOpacity>
                          </View>

                          {question.options && question.options.length > 0 ? (
                            question.options.map((option, optIndex) => (
                              <View 
                                key={option.id} 
                                style={[
                                  styles.optionItem,
                                  option.is_correct && styles.correctOption
                                ]}
                              >
                                <TouchableOpacity
                                  style={styles.optionContent}
                                  onPress={() => handleToggleCorrect(question.id, option.id)}
                                  disabled={option.is_correct || adding === option.id}
                                >
                                  <View style={styles.optionLabel}>
                                    <Text style={styles.optionLabelText}>
                                      {String.fromCharCode(65 + optIndex)}
                                    </Text>
                                  </View>
                                  <Text style={styles.optionText}>{option.option_text}</Text>
                                  {option.is_correct && (
                                    <View style={styles.correctBadge}>
                                      <MaterialIcons name="check-circle" size={16} color="#10B981" />
                                      <Text style={styles.correctBadgeText}>Correct</Text>
                                    </View>
                                  )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => handleDeleteOption(option.id)}
                                  style={styles.deleteOptionButton}
                                  disabled={adding === option.id}
                                >
                                  {adding === option.id ? (
                                    <ActivityIndicator size="small" color="#EF4444" />
                                  ) : (
                                    <MaterialIcons name="close" size={18} color="#EF4444" />
                                  )}
                                </TouchableOpacity>
                              </View>
                            ))
                          ) : (
                            <View style={styles.emptyOptions}>
                              <MaterialIcons name="format-list-bulleted" size={32} color="#CBD5E1" />
                              <Text style={styles.emptyOptionsText}>No options added yet</Text>
                            </View>
                          )}
                        </View>

                        {/* Question Actions */}
                        <View style={styles.questionActions}>
                          <TouchableOpacity
                            onPress={() => handleDeleteQuestion(question.id)}
                            style={styles.deleteQuestionButton}
                            disabled={adding === question.id}
                          >
                            {adding === question.id ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <>
                                <MaterialIcons name="delete" size={18} color="#fff" />
                                <Text style={styles.deleteQuestionButtonText}>Delete Question</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="quiz" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>No questions yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first MCQ question to get started
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Question Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add MCQ Question</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>Question Text</Text>
              <TextInput
                placeholder="Enter your question here..."
                value={questionText}
                onChangeText={setQuestionText}
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.label}>Marks</Text>
              <TextInput
                placeholder="1"
                value={questionMarks}
                onChangeText={setQuestionMarks}
                style={styles.input}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)} 
                  style={[styles.modalButton, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleAddQuestion}
                  style={[styles.modalButton, styles.submitButton]}
                  disabled={adding === "question"}
                >
                  {adding === "question" ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Add Question</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Option Modal */}
      <Modal visible={optionModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Option</Text>
              <TouchableOpacity onPress={() => setOptionModalVisible(false)} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>Option Text</Text>
              <TextInput
                placeholder="Enter option text..."
                value={optionText}
                onChangeText={setOptionText}
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
                placeholderTextColor="#94A3B8"
              />

              <TouchableOpacity 
                onPress={() => setIsCorrect(!isCorrect)}
                style={styles.correctAnswerToggle}
              >
                <View style={[styles.checkbox, isCorrect && styles.checkboxChecked]}>
                  {isCorrect && <MaterialIcons name="check" size={18} color="white" />}
                </View>
                <Text style={styles.correctAnswerLabel}>This is the correct answer</Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  onPress={() => setOptionModalVisible(false)} 
                  style={[styles.modalButton, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleAddOption}
                  style={[styles.modalButton, styles.submitButton]}
                  disabled={adding === "option"}
                >
                  {adding === "option" ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Add Option</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  },
  placeholder: {
    width: 40,
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
    fontSize: 24,
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
  addQuestionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4E54C8",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addQuestionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
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
  questionsCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  questionsList: {
    gap: 16,
  },
  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  questionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4E54C8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  questionNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  questionHeaderText: {
    flex: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
    lineHeight: 20,
  },
  questionMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    flexWrap: "wrap",
  },
  questionMetaText: {
    fontSize: 12,
    color: "#64748B",
    marginRight: 12,
  },
  answerStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  answerStatusComplete: {
    backgroundColor: "#DCFCE7",
  },
  answerStatusIncomplete: {
    backgroundColor: "#FEF3C7",
  },
  answerStatusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1E293B",
  },
  questionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  fullQuestionTextContainer: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  fullQuestionText: {
    fontSize: 15,
    color: "#1E293B",
    lineHeight: 22,
  },
  optionsSection: {
    marginBottom: 16,
  },
  optionsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  optionsSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
  },
  addOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addOptionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4E54C8",
    marginLeft: 4,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#E2E8F0",
  },
  correctOption: {
    backgroundColor: "#F0F9FF",
    borderLeftColor: "#10B981",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionLabel: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4E54C8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionLabelText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  optionText: {
    fontSize: 14,
    color: "#1E293B",
    flex: 1,
  },
  correctBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  correctBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 4,
  },
  deleteOptionButton: {
    padding: 4,
  },
  emptyOptions: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyOptionsText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
  },
  questionActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  deleteQuestionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  deleteQuestionButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
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
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1E293B",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
    color: "#1E293B",
    backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  correctAnswerToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  correctAnswerLabel: {
    fontSize: 16,
    color: "#1E293B",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    backgroundColor: "#4E54C8",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#F1F5F9",
  },
  cancelButtonText: {
    color: "#64748B",
    fontWeight: "600",
  },
});