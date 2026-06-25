import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSubjectDetails, Subject, Topic, Resource, Assessment } from '../services/api';
import { FontAwesome } from '@expo/vector-icons';

// Assume we have a QnAChat screen you navigate to
// For unread count, this can come from your API
interface TopicWithResources extends Omit<Topic, 'resources'> {
  resources: Resource[];
  unreadQnA?: number;
}

export default function SubjectDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<TopicWithResources[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadSubjectDetails();
  }, [id]);

  const loadSubjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSubjectDetails(id as string);
      setSubject(response.subject);
      // Add unreadQnA to each topic (example, real data should come from API)
      const topicsWithUnread = response.topics.map((t: Topic) => ({
        ...t,
        resources: t.resources || [],
        unreadQnA: Math.floor(Math.random() * 3) // Example: random unread count
      }));
      setTopics(topicsWithUnread);
      setAssessments(response.assessments);
    } catch (error: any) {
      console.error('Error loading subject details:', error);
      setError('Failed to load subject details. Please try again.');
      setSubject({ 
        id: id as string, 
        name: 'Subject',
        grade: 'Not specified',
      } as Subject);
      setTopics([]);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResourcePress = async (resource: Resource) => {
    if (resource.url) {
      try { await Linking.openURL(resource.url); } 
      catch { Alert.alert('Error', 'Could not open the resource'); }
    } else if (resource.file_path) {
      Alert.alert('Info', 'File download functionality would be implemented here');
    }
  };

  const navigateToAssessment = (assessmentId: string) => {
    Alert.alert('Assessment', 'Assessment functionality is coming soon!', [{ text: 'OK' }]);
  };
const handleOpenQnA = (topic: TopicWithResources) => {
  if (!subject?.id) return; // Guard clause
  router.push(`/(tabs)/Dashboards/QnAChat?topicId=${topic.id}&subjectId=${subject.id}`);
};


  const handleBack = () => router.back();
  const handleRetry = () => loadSubjectDetails();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0B0B44" />
        <Text style={styles.loadingText}>Loading subject details...</Text>
      </View>
    );
  }

  if (!subject) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Subject not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{subject.name || 'Unknown Subject'}</Text>
      </View>

      {/* Subject Info */}
      <View style={styles.subjectHeader}>
        <Text style={styles.code}>
          {subject.code || `SUB-${subject.id?.toString().slice(0, 4).toUpperCase() || 'UNKN'}`}
        </Text>
        <Text style={styles.description}>
          {subject.description || 'No description available'}
        </Text>
        <View style={styles.metaContainer}>
          <Text style={styles.meta}>Grade: {subject.grade || 'Not specified'}</Text>
          {subject.department && <Text style={styles.meta}>Department: {subject.department}</Text>}
        </View>
      </View>

      {/* Topics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Topics ({topics.length})</Text>
          <TouchableOpacity onPress={handleRetry}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        
        {topics.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No topics available for this subject</Text>
          </View>
        ) : (
          topics.map((topic) => (
            <View key={topic.id} style={styles.topicCard}>
              <Text style={styles.topicTitle}>{topic.name}</Text>
              {topic.description && <Text style={styles.topicDescription}>{topic.description}</Text>}

              {/* Chat Icon */}
              <TouchableOpacity style={styles.qnaIcon} onPress={() => handleOpenQnA(topic)}>
                <FontAwesome name="comments" size={20} color="#0B0B44" />
                {topic.unreadQnA && topic.unreadQnA > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{topic.unreadQnA}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Resources */}
              {topic.resources.length > 0 ? (
                <View style={styles.resourcesSection}>
                  {topic.resources.map((res) => (
                    <TouchableOpacity key={res.id} style={styles.resourceItem} onPress={() => handleResourcePress(res)}>
                      <View style={styles.resourceContent}>
                        <Text style={styles.resourceText}>{res.title}</Text>
                        <Text style={styles.resourceType}>{res.type}</Text>
                      </View>
                      <Text style={styles.resourceAction}>→</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : <Text style={styles.noResourcesText}>No resources available</Text>}
            </View>
          ))
        )}
      </View>

      {/* Assessments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assessments ({assessments.length})</Text>
        </View>
        {assessments.map((assessment) => (
          <TouchableOpacity 
            key={assessment.id} 
            style={styles.assessmentCard}
            onPress={() => navigateToAssessment(assessment.id.toString())}
          >
            <View style={styles.assessmentContent}>
              <Text style={styles.assessmentTitle}>{assessment.title}</Text>
            </View>
            <Text style={styles.assessmentAction}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={handleRetry}>
            <Text style={styles.errorBannerRetry}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, color: '#666' },
  errorText: { color: '#ef4444', fontSize: 16, marginBottom: 20, textAlign: 'center', fontWeight: '600' },
  retryButton: { backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginBottom: 12 },
  retryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  backButton: { backgroundColor: '#6b7280', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerBackButton: { marginRight: 15 },
  headerBackButtonText: { color: '#0B0B44', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0B0B44' },
  subjectHeader: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
  code: { fontSize: 16, color: '#666', marginBottom: 8, fontWeight: '600' },
  description: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 12 },
  metaContainer: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  meta: { fontSize: 12, color: '#888', marginBottom: 4 },
  section: { backgroundColor: 'white', padding: 20, marginHorizontal: 20, marginBottom: 20, borderRadius: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0B0B44' },
  refreshText: { color: '#007AFF', fontSize: 14, fontWeight: '600' },
  emptyContainer: { padding: 20, alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#666', fontSize: 16, marginBottom: 8 },
  topicCard: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 12, position: 'relative' },
  topicTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  topicDescription: { fontSize: 14, color: '#666', marginBottom: 12, lineHeight: 20 },
  resourcesSection: { marginTop: 8 },
  resourceItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 6, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  resourceContent: { flex: 1 },
  resourceText: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 4 },
  resourceType: { fontSize: 12, color: '#666' },
  resourceAction: { fontSize: 16, color: '#007AFF', fontWeight: 'bold' },
  noResourcesText: { fontSize: 12, color: '#999', fontStyle: 'italic', marginTop: 8 },
  assessmentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#34C759' },
  assessmentContent: { flex: 1 },
  assessmentTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  assessmentAction: { fontSize: 16, color: '#34C759', fontWeight: 'bold' },
  errorBanner: { backgroundColor: '#FF3B30', padding: 15, margin: 20, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorBannerText: { color: 'white', flex: 1 },
  errorBannerRetry: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
  qnaIcon: { position: 'absolute', top: 16, right: 16 },
  unreadBadge: { backgroundColor: 'red', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2, position: 'absolute', top: -5, right: -5 },
  unreadText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
});