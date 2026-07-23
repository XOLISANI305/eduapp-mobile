import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, Feather } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getQuestionsBySubject, 
  Question,
  createQuestion,
  addAnswer,
  voteAnswer,
  addComment,
  acceptAnswer,
  markQuestionAsRead,
  getSubjectDetails
} from '../services/api';

interface Answer {
  id: number;
  body: string;
  author: string;
  votes: number;
  is_accepted: boolean;
  comments: Comment[];
  created_at: string;
}

interface Comment {
  id: number;
  body: string;
  author: string;
  created_at: string;
}

interface QuestionWithAnswers extends Question {
  title?: string;
  author?: string;
  body?: string;
  answers?: Answer[];
  topic_id?: number;
  topic_name?: string;
}

interface Topic {
  id: number;
  name: string;
  description?: string;
}

export default function QnAChat() {
  const { subjectId } = useLocalSearchParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Form states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<number | null>(null);
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionBody, setNewQuestionBody] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [newAnswerBody, setNewAnswerBody] = useState<{ [key: string]: string }>({});
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  
  // Vote tracking
  const [userVotes, setUserVotes] = useState<{ [answerId: number]: number }>({});

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (subjectId && userId) {
      loadQuestions();
      loadTopics();
      loadUserVotesForCurrentUser();
    }
  }, [subjectId, userId]);

  useEffect(() => {
    if (userId && Object.keys(userVotes).length > 0) {
      saveUserVotesForCurrentUser();
    }
  }, [userVotes, userId]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        setError("User not found. Please log in again.");
        setLoading(false);
        return;
      }
      const user = JSON.parse(userData);
      const uid = String(user.id || user.user_id || user.userId);
      console.log('✅ Loaded User ID:', uid);
      setUserId(uid);
    } catch (error) {
      console.error("Failed to load user data:", error);
      setError("Failed to load user data.");
      setLoading(false);
    }
  };

  const loadTopics = async () => {
    try {
      console.log('Loading topics for subject:', subjectId);
      const response = await getSubjectDetails(subjectId as string);
      const topicsData = response.topics || [];
      console.log('Topics loaded:', topicsData);
      setTopics(topicsData);
    } catch (error) {
      console.error('Failed to load topics:', error);
      setTopics([]);
    }
  };

  const loadUserVotesForCurrentUser = async () => {
    if (!userId) return;
    try {
      const storageKey = `userVotes_${userId}`;
      const savedVotes = await AsyncStorage.getItem(storageKey);
      console.log(`📖 Loading votes for user ${userId} from key: ${storageKey}`);
      
      if (savedVotes) {
        const votes = JSON.parse(savedVotes);
        console.log('✅ Loaded votes:', votes);
        setUserVotes(votes);
      } else {
        console.log('ℹ️ No saved votes found, starting fresh');
        setUserVotes({});
      }
    } catch (error) {
      console.error('Failed to load votes:', error);
      setUserVotes({});
    }
  };

  const saveUserVotesForCurrentUser = async () => {
    if (!userId) return;
    try {
      const storageKey = `userVotes_${userId}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(userVotes));
      console.log(`💾 Saved votes for user ${userId}:`, userVotes);
    } catch (error) {
      console.error('Failed to save votes:', error);
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching questions for subject:', subjectId);
      const data = await getQuestionsBySubject(parseInt(subjectId as string)) as any[];
      
      if (!data || data.length === 0) {
        console.warn('No questions returned from API');
        setQuestions([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      const questionsData = data as any[];
      
      const mappedQuestions = questionsData.map((q, index) => {
        return {
          ...q,
          title: q.title || q.text || q.question_text || 'Untitled Question',
          author: q.author || q.user_name || 'Anonymous',
          body: q.body || q.question_text || '',
          answers: q.answers || [],
          topic_id: q.topic_id,
          topic_name: q.topic_name,
        };
      });
      
      setQuestions(mappedQuestions as QuestionWithAnswers[]);
      
      if (userId && mappedQuestions.length > 0) {
        try {
          console.log('Marking questions as read for user:', userId);
          await Promise.all(
            mappedQuestions.map(q => 
              markQuestionAsRead(parseInt(q.id.toString()), userId).catch(err => 
                console.error(`Failed to mark question ${q.id} as read:`, err)
              )
            )
          );
        } catch (err) {
          console.error('Error marking questions as read:', err);
        }
      }
    } catch (error: any) {
      console.error('Load questions error:', error);
      setError('Failed to load questions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQuestions();
    await loadTopics();
  };

  const handleAddQuestion = async () => {
    if (!newQuestionTitle.trim()) {
      alert("Please enter a question title.");
      return;
    }
    if (!userId) {
      alert("Please log in to ask questions.");
      return;
    }
    
    try {
      const newQuestion = await createQuestion(
        newQuestionTitle,
        newQuestionBody,
        userId,
        parseInt(subjectId as string),
        selectedTopicId || undefined
      ) as QuestionWithAnswers;
      
      const selectedTopic = topics.find(t => t.id === selectedTopicId);
      
      const questionWithDefaults = {
        ...newQuestion,
        answers: [],
        title: newQuestion.title || newQuestionTitle,
        author: newQuestion.author || 'You',
        body: newQuestion.body || newQuestionBody,
        topic_id: selectedTopicId || undefined,
        topic_name: selectedTopic?.name || undefined,
      };
      
      setQuestions(prev => [questionWithDefaults, ...prev]);
      
      setExpandedQuestions(prev => {
        const newSet = new Set(prev);
        newSet.add(questionWithDefaults.id.toString());
        return newSet;
      });
      
      setNewQuestionTitle("");
      setNewQuestionBody("");
      setSelectedTopicId(null);
      setIsAddingQuestion(false);
    } catch (error: any) {
      console.error('Failed to add question:', error);
      alert(`Failed to add question: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddAnswer = async (questionId: string) => {
    const answerText = newAnswerBody[questionId];
    if (!answerText?.trim()) return;
    if (!userId) {
      alert("Please log in to answer questions.");
      return;
    }
    
    try {
      const newAnswer = await addAnswer(
        parseInt(questionId),
        answerText,
        userId
      ) as Answer;
      
      setQuestions(prev =>
        prev.map(q =>
          q.id.toString() === questionId
            ? { ...q, answers: [newAnswer, ...(q.answers || [])] }
            : q
        )
      );
      
      setNewAnswerBody(prev => ({ ...prev, [questionId]: "" }));
    } catch (error) {
      console.error('Failed to add answer:', error);
      alert('Failed to add answer. Please try again.');
    }
  };

  const handleVote = async (questionId: string, answerId: number, vote: number) => {
    console.log(`🗳️ Vote requested: answerId=${answerId}, vote=${vote}, user=${userId}`);
    try {
      await voteAnswer(answerId, vote);
      
      setQuestions(prev =>
        prev.map(q =>
          q.id.toString() === questionId
            ? {
                ...q,
                answers: q.answers?.map(a =>
                  a.id === answerId ? { ...a, votes: a.votes + vote } : a
                )
              }
            : q
        )
      );
      console.log('✅ Vote successful');
    } catch (error) {
      console.error('Failed to vote:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  const handleVoteChange = (answerId: number, newVote: number) => {
    console.log(`📝 Vote change: answerId=${answerId}, newVote=${newVote}, user=${userId}`);
    setUserVotes(prev => {
      const updated = { ...prev, [answerId]: newVote };
      console.log('Updated userVotes:', updated);
      return updated;
    });
  };

  const handleAcceptAnswer = async (questionId: string, answerId: number) => {
    try {
      await acceptAnswer(answerId);
      
      setQuestions(prev =>
        prev.map(q =>
          q.id.toString() === questionId
            ? {
                ...q,
                answers: q.answers?.map(a => ({
                  ...a,
                  is_accepted: a.id === answerId
                }))
              }
            : q
        )
      );
    } catch (error) {
      console.error('Failed to accept answer:', error);
      alert('Failed to accept answer. Please try again.');
    }
  };

  const handleAddComment = async (answerId: number, body: string) => {
    if (!body.trim()) return;
    if (!userId) {
      alert("Please log in to comment.");
      return;
    }
    
    try {
      const newComment = await addComment(answerId, body, userId) as Comment;
      
      setQuestions(prev =>
        prev.map(question => ({
          ...question,
          answers: question.answers?.map(answer =>
            answer.id === answerId
              ? {
                  ...answer,
                  comments: [...(answer.comments || []), newComment]
                }
              : answer
          )
        }))
      );
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const toggleQuestionExpanded = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const goBack = () => {
    router.back();
  };

  const filteredQuestions = React.useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = !searchQuery.trim() || 
        (q.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTopic = !selectedTopicFilter || 
        q.topic_id === selectedTopicFilter;
      
      return matchesSearch && matchesTopic;
    });
  }, [questions, searchQuery, selectedTopicFilter]);

  const getSelectedTopicName = () => {
    if (!selectedTopicId) return "Select a Topic (Optional)";
    const topic = topics.find(t => t.id === selectedTopicId);
    return topic?.name || "Select a Topic (Optional)";
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading Q&A...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadQuestions}>
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
        <Text style={styles.headerTitle}>Q&A Chat</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

       <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search questions..."
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

          {/* Topic Filter */}
          {topics.length > 0 && (
            <View style={styles.filterSection}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
              >
                <View style={styles.filterContainer}>
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      selectedTopicFilter === null && styles.filterButtonActive
                    ]}
                    onPress={() => setSelectedTopicFilter(null)}
                  >
                    <Text style={[
                      styles.filterText,
                      selectedTopicFilter === null && styles.filterTextActive
                    ]}>
                      All Topics
                    </Text>
                  </TouchableOpacity>

                  {topics.map(topic => (
                    <TouchableOpacity
                      key={topic.id}
                      style={[
                        styles.filterButton,
                        selectedTopicFilter === topic.id && styles.filterButtonActive
                      ]}
                      onPress={() => setSelectedTopicFilter(
                        selectedTopicFilter === topic.id ? null : topic.id
                      )}
                    >
                      <Text style={[
                        styles.filterText,
                        selectedTopicFilter === topic.id && styles.filterTextActive
                      ]}>
                        {topic.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Question Button */}
          {!isAddingQuestion && (
            <TouchableOpacity
              onPress={() => setIsAddingQuestion(true)}
              style={styles.primaryButton}
            >
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Ask a Question</Text>
            </TouchableOpacity>
          )}

          {/* Question Form */}
          {isAddingQuestion && (
            <View style={styles.questionForm}>
              <Text style={styles.formTitle}>Ask a Question</Text>
              
              <TextInput
                placeholder="Write Your Question"
                value={newQuestionTitle}
                onChangeText={setNewQuestionTitle}
                style={styles.input}
                placeholderTextColor="#999"
              />
              
              {topics.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setShowTopicDropdown(true)}
                  style={styles.topicSelector}
                >
                  <Text style={[
                    styles.topicSelectorText,
                    !selectedTopicId && styles.topicSelectorPlaceholder
                  ]}>
                    {getSelectedTopicName()}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color="#4E54C8" />
                </TouchableOpacity>
              )}

              <View style={styles.formActions}>
                <TouchableOpacity
                  onPress={handleAddQuestion}
                  style={styles.submitButton}
                >
                  <MaterialIcons name="send" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Post Question</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddingQuestion(false);
                    setNewQuestionTitle("");
                    setNewQuestionBody("");
                    setSelectedTopicId(null);
                  }}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Questions List */}
          <FlatList
            data={filteredQuestions}
            keyExtractor={item => item.id.toString()}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#4E54C8"]}
                tintColor="#4E54C8"
              />
            }
            renderItem={({ item }) => {
              const isExpanded = expandedQuestions.has(item.id.toString());
              
              return (
                <View style={styles.questionContainer}>
                  <TouchableOpacity 
                    onPress={() => toggleQuestionExpanded(item.id.toString())}
                    style={styles.questionHeader}
                    activeOpacity={0.7}
                  >
                    <View style={styles.questionContent}>
                      <View style={styles.questionIcon}>
                        <MaterialIcons name="help-outline" size={24} color="#4E54C8" />
                      </View>
                      <View style={styles.questionInfo}>
                        <Text style={styles.questionTitle}>{item.title}</Text>
                        <Text style={styles.questionAuthor}>By {item.author}</Text>
                        {item.topic_name && (
                          <View style={styles.topicBadge}>
                            <Text style={styles.topicBadgeText}>{item.topic_name}</Text>
                          </View>
                        )}
                      </View>
                      <MaterialIcons 
                        name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                        size={24} 
                        color="#4E54C8" 
                      />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      {/* Answers list */}
                      {(item.answers || []).length > 0 ? (
                        (item.answers || []).map(ans => {
                          const userVote = userVotes[ans.id] || 0;
                          
                          return (
                            <View key={ans.id} style={styles.answerContainer}>
                              <View style={styles.answerHeader}>
                                <View style={styles.answerIcon}>
                                  <MaterialIcons name="lightbulb" size={20} color="#10B981" />
                                </View>
                                <View style={styles.answerInfo}>
                                  <Text style={styles.answerAuthor}>{ans.author}</Text>
                                  <Text style={styles.answerBody}>{ans.body}</Text>
                                  
                                  {/* Voting Section */}
                                  <View style={styles.votingSection}>
                                    <View style={styles.voteButtons}>
                                      <TouchableOpacity
                                        style={[
                                          styles.voteButton,
                                          userVote === 1 && styles.voteButtonActive
                                        ]}
                                        onPress={() => {
                                          const newVote = userVote === 1 ? 0 : 1;
                                          handleVoteChange(ans.id, newVote);
                                          handleVote(item.id.toString(), ans.id, newVote - userVote);
                                        }}
                                      >
                                        <MaterialIcons 
                                          name="thumb-up" 
                                          size={16} 
                                          color={userVote === 1 ? "#10B981" : "#64748B"} 
                                        />
                                      </TouchableOpacity>
                                      
                                      <Text style={styles.voteCount}>{ans.votes}</Text>
                                      
                                      <TouchableOpacity
                                        style={[
                                          styles.voteButton,
                                          userVote === -1 && styles.voteButtonActive
                                        ]}
                                        onPress={() => {
                                          const newVote = userVote === -1 ? 0 : -1;
                                          handleVoteChange(ans.id, newVote);
                                          handleVote(item.id.toString(), ans.id, newVote - userVote);
                                        }}
                                      >
                                        <MaterialIcons 
                                          name="thumb-down" 
                                          size={16} 
                                          color={userVote === -1 ? "#EF4444" : "#64748B"} 
                                        />
                                      </TouchableOpacity>
                                    </View>

                                    <View style={styles.answerMeta}>
                                      {ans.is_accepted && (
                                        <View style={styles.acceptedBadge}>
                                          <MaterialIcons name="check-circle" size={14} color="#10B981" />
                                          <Text style={styles.acceptedText}>Accepted</Text>
                                        </View>
                                      )}
                                    </View>
                                  </View>
                                </View>
                              </View>
                            </View>
                          );
                        })
                      ) : (
                        <View style={styles.noAnswers}>
                          <MaterialIcons name="forum" size={32} color="#CBD5E1" />
                          <Text style={styles.noAnswersText}>No answers yet</Text>
                          <Text style={styles.noAnswersSubtext}>Be the first to answer!</Text>
                        </View>
                      )}

                      {/* Add Answer */}
                      <View style={styles.answerForm}>
                        <TextInput
                          placeholder="Write your answer..."
                          value={newAnswerBody[item.id.toString()] || ""}
                          onChangeText={text =>
                            setNewAnswerBody(prev => ({ ...prev, [item.id.toString()]: text }))
                          }
                          style={styles.answerInput}
                          multiline
                          numberOfLines={3}
                          placeholderTextColor="#999"
                        />
                        <TouchableOpacity
                          onPress={() => handleAddAnswer(item.id.toString())}
                          style={styles.answerButton}
                        >
                          <MaterialIcons name="send" size={16} color="#fff" />
                          <Text style={styles.answerButtonText}>Post Answer</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialIcons name="forum" size={64} color="#CBD5E1" />
                <Text style={styles.emptyText}>No questions yet</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery || selectedTopicFilter 
                    ? "Try adjusting your search or filters"
                    : "Be the first to ask a question!"
                  }
                </Text>
              </View>
            }
          />
        </View>
      </KeyboardAvoidingView>

      {/* Topic Selection Modal */}
      <Modal
        visible={showTopicDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTopicDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Topic</Text>
              <TouchableOpacity onPress={() => setShowTopicDropdown(false)}>
                <MaterialIcons name="close" size={24} color="#4E54C8" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <TouchableOpacity
                style={[
                  styles.topicOption,
                  !selectedTopicId && styles.topicOptionSelected
                ]}
                onPress={() => {
                  setSelectedTopicId(null);
                  setShowTopicDropdown(false);
                }}
              >
                <Text style={[
                  styles.topicOptionText,
                  !selectedTopicId && styles.topicOptionTextSelected
                ]}>
                  No specific topic
                </Text>
              </TouchableOpacity>

              {topics.length === 0 ? (
                <Text style={styles.noTopicsText}>No topics available</Text>
              ) : (
                topics.map(topic => (
                  <TouchableOpacity
                    key={topic.id}
                    style={[
                      styles.topicOption,
                      selectedTopicId === topic.id && styles.topicOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedTopicId(topic.id);
                      setShowTopicDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.topicOptionText,
                      selectedTopicId === topic.id && styles.topicOptionTextSelected
                    ]}>
                      {topic.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
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
    padding: 20,
  },

  // Search Bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 16,
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
    color: "#1E293B",
    padding: 0,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4E54C8",
    justifyContent: "center",
    alignItems: "center",
  },

  // Filter Section
  filterSection: {
    marginBottom: 16,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: '#4E54C8',
    borderColor: '#4E54C8',
  },
  filterText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '600',
  },

  // Buttons
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#4E54C8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Question Form
  questionForm: {
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
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  topicSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  topicSelectorText: {
    fontSize: 16,
    color: '#1E293B',
  },
  topicSelectorPlaceholder: {
    color: '#94A3B8',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#4E54C8',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 16,
  },

  // Questions List
  questionContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  questionHeader: {
    padding: 16,
  },
  questionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionInfo: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  questionAuthor: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  topicBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  topicBadgeText: {
    fontSize: 12,
    color: '#0EA5E9',
    fontWeight: '500',
  },
  expandedContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  // Answers
  answerContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  answerHeader: {
    flexDirection: 'row',
  },
  answerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  answerInfo: {
    flex: 1,
  },
  answerAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  answerBody: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  
  // Voting Section
  votingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  voteButtonActive: {
    backgroundColor: '#EFF6FF',
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    minWidth: 20,
    textAlign: 'center',
  },
  answerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  acceptedText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  noAnswers: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noAnswersText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '500',
  },
  noAnswersSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },

  // Answer Form
  answerForm: {
    marginTop: 16,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  answerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  modalScroll: {
    padding: 16,
  },
  topicOption: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  topicOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4E54C8',
  },
  topicOptionText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  topicOptionTextSelected: {
    color: '#4E54C8',
    fontWeight: '600',
  },
  noTopicsText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 14,
    fontStyle: 'italic',
    padding: 20,
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