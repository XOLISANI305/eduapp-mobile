import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Linking,
  RefreshControl,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSubjectDetails, getUnreadCount } from '../services/api';

export default function SubjectDetail() {
  const { id, tab } = useLocalSearchParams();
  const isVideoMode = (Array.isArray(tab) ? tab[0] : tab) === 'videos';
  const router = useRouter();

  const [subject, setSubject] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (id) loadSubjectDetails();
  }, [id]);

  // ─── Icon helpers ────────────────────────────────────────────────────────────

  const getResourceIconColor = (type: string) => {
    switch (type) {
      case 'pdf':          return '#e74c3c';
      case 'video':        return '#9b59b6';
      case 'document':     return '#2980b9';
      case 'spreadsheet':  return '#27ae60';
      case 'presentation': return '#e67e22';
      case 'image':        return '#f39c12';
      case 'audio':        return '#1abc9c';
      case 'text':         return '#34495e';
      default:             return '#7f8c8d';
    }
  };

  const getResourceIcon = (type: string, size: number = 20) => {
    const color = getResourceIconColor(type);
    switch (type) {
      case 'pdf':          return <MaterialIcons name="picture-as-pdf" size={size} color={color} />;
      case 'video':        return <MaterialIcons name="videocam" size={size} color={color} />;
      case 'document':     return <FontAwesome5 name="file-word" size={size} color={color} />;
      case 'spreadsheet':  return <FontAwesome5 name="file-excel" size={size} color={color} />;
      case 'presentation': return <FontAwesome5 name="file-powerpoint" size={size} color={color} />;
      case 'image':        return <MaterialIcons name="image" size={size} color={color} />;
      case 'audio':        return <MaterialIcons name="audiotrack" size={size} color={color} />;
      case 'text':         return <MaterialIcons name="description" size={size} color={color} />;
      default:             return <MaterialIcons name="insert-drive-file" size={size} color="#7f8c8d" />;
    }
  };

  // ─── File type detection ─────────────────────────────────────────────────────

  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      pdf: 'pdf',
      doc: 'document', docx: 'document',
      xls: 'spreadsheet', xlsx: 'spreadsheet',
      ppt: 'presentation', pptx: 'presentation',
      mp4: 'video', avi: 'video', mov: 'video', wmv: 'video',
      flv: 'video', webm: 'video', mkv: 'video',
      jpg: 'image', jpeg: 'image', png: 'image', gif: 'image',
      bmp: 'image', webp: 'image',
      mp3: 'audio', wav: 'audio', m4a: 'audio', aac: 'audio', flac: 'audio',
      txt: 'text', rtf: 'text',
    };
    return map[ext || ''] || 'unknown';
  };

  // ─── File opener ─────────────────────────────────────────────────────────────

  const openFileWithViewer = async (filePath: string, filename: string, fileType: string) => {
    try {
      switch (fileType) {
        case 'pdf':
          router.push({ pathname: '/screens/pdf-viewer', params: { url: filePath, title: filename } });
          break;

        case 'document':
        case 'spreadsheet':
        case 'presentation':
          try {
            await Linking.openURL(filePath);
          } catch {
            Alert.alert('Open File', `This ${fileType} file cannot be opened directly. Download it?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Download', onPress: () => Platform.OS === 'web' ? window.open(filePath, '_blank') : Linking.openURL(filePath) },
            ]);
          }
          break;

        case 'video':
  router.push({
    pathname: '/screens/pdf-viewer',
    params: {
      url: filePath,
      title: filename
    }
  });
  break;

        case 'image':
        case 'audio':
        default:
          try {
            await Linking.openURL(filePath);
          } catch {
            Alert.alert('Error', `Cannot open ${fileType} file`);
          }
          break;
      }
    } catch (err) {
      console.error('Error opening file:', err);
      Alert.alert('Error', 'Cannot open file');
    }
  };

  // ─── Resource press ──────────────────────────────────────────────────────────

  const handleResourcePress = async (resource: any) => {
  try {
    const filename = resource.title || `resource_${resource.id}`;
    const fileType = resource.type || getFileType(filename);

    let fileUrl = resource.url;

    if (!fileUrl && resource.file_path) {
      const isFullUrl = /^https?:\/\//i.test(resource.file_path);

      if (isFullUrl) {
        // file_path is already a complete URL (e.g. Cloudinary) — use as-is
        fileUrl = resource.file_path;
      } else {
  // file_path is a relative path on your own server — build the full URL
  const clean = resource.file_path.replace(/\\/g, '/').replace('uploads/', '');
  fileUrl = `https://eduapp-backend-1.onrender.com/uploads/${clean}`;
}
    }

    if (!fileUrl) {
      Alert.alert('Error', 'No file URL available for this resource');
      return;
    }

    if (fileType === 'pdf') {
      router.push({ pathname: '/screens/pdf-viewer', params: { url: fileUrl, title: resource.title } });
    } else {
      openFileWithViewer(fileUrl, filename, fileType);
    }
  } catch (err) {
    console.error('Error opening resource:', err);
    Alert.alert('Error', 'Failed to open resource');
  }
};
  // ─── Data loading ────────────────────────────────────────────────────────────

  const loadSubjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSubjectDetails(id as string);
      setSubject(response.subject);
      setTopics(response.topics || []);
      setAssessments(response.assessments || []);

      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const userId = user.id || user.user_id || user.userId;
          const count = await getUnreadCount(parseInt(id as string), userId);
          setUnreadCount(count);
        }
      } catch {
        setUnreadCount(0);
      }
    } catch (err: any) {
      console.error('Error loading subject details:', err);
      setError('Failed to load subject details.');
      setSubject(null);
      setTopics([]);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadSubjectDetails();
    setRefreshing(false);
  };

  // ─── Filtering ───────────────────────────────────────────────────────────────

  const getTopicResources = (topic: any) => {
    if (isVideoMode) {
      return (topic.resources || []).filter(
        (r: any) => (r.type || '').toLowerCase() === 'video'
      );
    }
    return topic.resources || [];
  };

  // ─── Navigation helpers ──────────────────────────────────────────────────────

  const navigateToAssessment = (assessmentId: string) => {
    router.push({ pathname: '/screens/StudentAssessment', params: { assessmentId } });
  };

  const handleChatPress = () => {
    if (subject?.id) {
      router.push({ pathname: '/Dashboards/QnAChat', params: { subjectId: subject.id } });
    }
  };

  // ─── Loading / error states ──────────────────────────────────────────────────

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>
          {isVideoMode ? 'Loading video lessons...' : 'Loading subject details...'}
        </Text>
      </View>
    );
  }

  if (!subject) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Subject not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSubjectDetails}>
          <MaterialIcons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isVideoMode ? 'Video Lessons' : 'Subject Details'}
        </Text>

        {/* Chat button only in normal mode */}
        {!isVideoMode ? (
          <TouchableOpacity onPress={handleChatPress} style={styles.chatButton}>
            <View style={styles.chatButtonContainer}>
              <MaterialIcons name="chat" size={24} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            colors={['#4E54C8']}
            tintColor="#4E54C8"
          />
        }
      >
        {/* ── Subject overview card ── */}
        <View style={styles.subjectCard}>
          <View style={styles.subjectHeaderContent}>
            <View style={styles.subjectIcon}>
              <MaterialIcons
                name={isVideoMode ? 'play-circle-outline' : 'book'}
                size={32}
                color="#4E54C8"
              />
            </View>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{subject.name || 'Unknown Subject'}</Text>
              <Text style={styles.subjectGrade}>Grade {subject.grade || 'Not specified'}</Text>
              {subject.code && <Text style={styles.subjectCode}>{subject.code}</Text>}
            </View>
          </View>

          <Text style={styles.subjectDescription}>
            {subject.description || 'No description available'}
          </Text>

          {/* Stats row — simplified for video mode */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{topics.length}</Text>
              <Text style={styles.statLabel}>Topics</Text>
            </View>

            {!isVideoMode && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {assessments.filter(a => a.approved).length}
                  </Text>
                  <Text style={styles.statLabel}>Assessments</Text>
                </View>
              </>
            )}

            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {isVideoMode
                  ? topics.reduce((total, t) =>
                      total + (t.resources || []).filter((r: any) =>
                        (r.type || '').toLowerCase() === 'video'
                      ).length, 0)
                  : topics.reduce((total, t) => total + (t.resources?.length || 0), 0)
                }
              </Text>
              <Text style={styles.statLabel}>{isVideoMode ? 'Videos' : 'Resources'}</Text>
            </View>
          </View>
        </View>

        {/* ── Topics & Resources / Video Lessons section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isVideoMode ? 'Video Lessons' : 'Topics & Resources'}
            </Text>
            <Text style={styles.sectionCount}>{topics.length} topics</Text>
          </View>

          {topics.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons
                name={isVideoMode ? 'videocam-off' : 'folder-open'}
                size={48}
                color="#CBD5E1"
              />
              <Text style={styles.emptyText}>
                {isVideoMode ? 'No video lessons available' : 'No topics available'}
              </Text>
              <Text style={styles.emptySubtext}>Check back later for learning materials</Text>
            </View>
          ) : (
            topics.map((topic) => {
              const resources = getTopicResources(topic);
              return (
                <View key={topic.id} style={styles.topicCard}>
                  <View style={styles.topicHeader}>
                    <View style={styles.topicIcon}>
                      <MaterialIcons
                        name={isVideoMode ? 'play-circle-outline' : 'folder'}
                        size={20}
                        color="#4E54C8"
                      />
                    </View>
                    <Text style={styles.topicTitle}>{topic.name}</Text>
                  </View>

                  {topic.description && (
                    <Text style={styles.topicDescription}>{topic.description}</Text>
                  )}

                  {resources.length > 0 ? (
                    <View style={styles.resourcesContainer}>
                      <Text style={styles.resourcesTitle}>
                        {isVideoMode ? `Videos (${resources.length})` : `Resources (${resources.length})`}
                      </Text>
                      {resources.map((resource: any) => (
                        <TouchableOpacity
                          key={resource.id}
                          style={styles.resourceItem}
                          onPress={() => handleResourcePress(resource)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.resourceInfo}>
                            {getResourceIcon(resource.type, 24)}
                            <View style={styles.resourceTextContainer}>
                              <Text style={styles.resourceText}>
                                {resource.title || 'Untitled Resource'}
                              </Text>
                              <Text style={styles.resourceSubtext}>
                                {resource.type || 'file'} • Tap to open
                              </Text>
                            </View>
                          </View>
                          <MaterialIcons name="chevron-right" size={20} color="#64748B" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.noResources}>
                      <MaterialIcons
                        name={isVideoMode ? 'videocam-off' : 'insert-drive-file'}
                        size={20}
                        color="#CBD5E1"
                      />
                      <Text style={styles.noResourcesText}>
                        {isVideoMode ? 'No videos in this topic' : 'No resources available'}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* ── Assessments section — hidden in video mode ── */}
        {!isVideoMode && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>MCQ Assessments</Text>
              <Text style={styles.sectionCount}>
                {assessments.filter(a => a.approved).length} available
              </Text>
            </View>

            {assessments.filter(a => a.approved).length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="quiz" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>No assessments available</Text>
                <Text style={styles.emptySubtext}>Approved assessments will appear here</Text>
              </View>
            ) : (
              assessments
                .filter((a: any) => a.approved)
                .map((assessment: any) => (
                  <TouchableOpacity
                    key={assessment.id}
                    style={styles.assessmentCard}
                    onPress={() => navigateToAssessment(assessment.id.toString())}
                    activeOpacity={0.7}
                  >
                    <View style={styles.assessmentIcon}>
                      <MaterialIcons name="quiz" size={24} color="#10B981" />
                    </View>
                    <View style={styles.assessmentContent}>
                      <Text style={styles.assessmentTitle}>{assessment.title}</Text>
                      {assessment.description && (
                        <Text style={styles.assessmentDescription} numberOfLines={2}>
                          {assessment.description}
                        </Text>
                      )}
                      <View style={styles.assessmentMeta}>
                        {assessment.total_marks && (
                          <View style={styles.metaItem}>
                            <MaterialIcons name="stars" size={14} color="#F59E0B" />
                            <Text style={styles.metaText}>{assessment.total_marks} marks</Text>
                          </View>
                        )}
                        {assessment.duration_minutes && (
                          <View style={styles.metaItem}>
                            <MaterialIcons name="timer" size={14} color="#3B82F6" />
                            <Text style={styles.metaText}>{assessment.duration_minutes} min</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color="#10B981" />
                  </TouchableOpacity>
                ))
            )}

            {assessments.filter((a: any) => !a.approved).length > 0 && (
              <View style={styles.pendingNotice}>
                <MaterialIcons name="info-outline" size={16} color="#F59E0B" />
                <Text style={styles.pendingText}>
                  {assessments.filter((a: any) => !a.approved).length} assessment
                  {assessments.filter((a: any) => !a.approved).length !== 1 ? 's' : ''} pending approval
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F8FAFC' },
  centerContent:  { justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText:    { marginTop: 16, fontSize: 16, color: '#64748B' },

  header: {
    backgroundColor: '#4E54C8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle:  { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  placeholder:  { width: 40 },

  chatButtonContainer: { position: 'relative' },
  chatButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  badge: {
    position: 'absolute', right: -6, top: -6,
    backgroundColor: '#EF4444', borderRadius: 10,
    minWidth: 20, height: 20,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4, borderWidth: 2, borderColor: '#4E54C8',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  content: { flex: 1 },

  subjectCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, margin: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  subjectHeaderContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  subjectIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  subjectInfo:        { flex: 1 },
  subjectName:        { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  subjectGrade:       { fontSize: 16, color: '#4E54C8', fontWeight: '600', marginBottom: 4 },
  subjectCode:        { fontSize: 14, color: '#64748B' },
  subjectDescription: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 20 },

  statsContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
  statItem:   { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#4E54C8' },
  statLabel:  { fontSize: 12, color: '#64748B', marginTop: 4 },
  statDivider:{ width: 1, height: 30, backgroundColor: '#E2E8F0' },

  section:      { padding: 20, paddingTop: 0 },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  sectionCount: { fontSize: 14, color: '#64748B', fontWeight: '600' },

  topicCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  topicHeader:     { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  topicIcon: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  topicTitle:       { fontSize: 16, fontWeight: 'bold', color: '#1E293B', flex: 1 },
  topicDescription: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 16 },

  resourcesContainer: { marginTop: 8 },
  resourcesTitle:     { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 12 },
  resourceItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, marginBottom: 8,
  },
  resourceInfo:          { flexDirection: 'row', alignItems: 'center', flex: 1 },
  resourceTextContainer: { marginLeft: 12, flex: 1 },
  resourceText:          { fontSize: 14, fontWeight: '500', color: '#1E293B', marginBottom: 2 },
  resourceSubtext:       { fontSize: 12, color: '#64748B' },
  noResources:           { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#F8FAFC', borderRadius: 8 },
  noResourcesText:       { fontSize: 14, color: '#64748B', marginLeft: 8, fontStyle: 'italic' },

  assessmentCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  assessmentIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0FDF4',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  assessmentContent:    { flex: 1 },
  assessmentTitle:      { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  assessmentDescription:{ fontSize: 14, color: '#64748B', lineHeight: 18, marginBottom: 8 },
  assessmentMeta:       { flexDirection: 'row', alignItems: 'center' },
  metaItem:             { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  metaText:             { fontSize: 12, color: '#64748B', marginLeft: 4 },

  pendingNotice: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFBEB', padding: 12, borderRadius: 8, marginTop: 8,
  },
  pendingText: { fontSize: 12, color: '#92400E', marginLeft: 8, flex: 1 },

  emptyState:   { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText:    { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginTop: 16, textAlign: 'center' },
  emptySubtext: { fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center', lineHeight: 20 },

  errorText: { fontSize: 16, color: '#64748B', textAlign: 'center', marginTop: 16, lineHeight: 22 },
  retryButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#4E54C8',
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 20, gap: 8,
  },
  retryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  backButtonText:  { color: '#4E54C8', fontWeight: '600', fontSize: 16 },
});
