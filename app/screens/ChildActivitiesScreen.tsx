// app/screens/ChildActivitiesScreen.tsx
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
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Activity {
  type: string;
  title: string;
  assessment_type?: string;
  score?: number;
  max_score?: number;
  date: string;
  created_at: string;
}

export default function ChildActivitiesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { childId, childName } = params;
  
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'assessments' | 'attendance'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [childId]);

  const loadActivities = async () => {
    try {
      setError(null);
      const parentId = await AsyncStorage.getItem('user').then(user => 
        user ? JSON.parse(user).id : null
      );
      
      if (!parentId) throw new Error('User not found');
      
      const allActivities = await parentTrackingApi.getChildActivities(childId as string);
      setActivities(allActivities);
    } catch (err: any) {
      setError(err.message || 'Failed to load activities');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'assessments') return activity.type === 'assessment';
    if (filter === 'attendance') return activity.type === 'attendance';
    return true;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assessment':
        return 'quiz';
      case 'attendance':
        return 'event';
      case 'homework':
        return 'assignment';
      default:
        return 'notifications';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'assessment':
        return "#4E54C8";
      case 'attendance':
        return "#10B981";
      case 'homework':
        return "#F59E0B";
      default:
        return "#64748B";
    }
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined) return "#64748B";
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const formatActivityDescription = (activity: Activity) => {
    if (activity.type === 'assessment' && activity.score !== undefined) {
      return `Scored ${activity.score}% on ${activity.title}`;
    }
    if (activity.type === 'attendance') {
      return `Attendance recorded for ${activity.title}`;
    }
    return activity.title;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading activities...</Text>
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
        <Text style={styles.headerTitle}>Activities</Text>
        <TouchableOpacity onPress={loadActivities} style={styles.refreshButton}>
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
            <MaterialIcons name="notifications" size={32} color="#4E54C8" />
          </View>
          <View style={styles.childInfo}>
            <Text style={styles.childName}>{childName}</Text>
            <Text style={styles.childSubtitle}>Recent Activities</Text>
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter Activities</Text>
          <View style={styles.filterContainer}>
            {(['all', 'assessments', 'attendance'] as const).map((filterType) => (
              <TouchableOpacity
                key={filterType}
                style={[
                  styles.filterButton,
                  filter === filterType && styles.filterButtonActive
                ]}
                onPress={() => setFilter(filterType)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filter === filterType && styles.filterButtonTextActive
                ]}>
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <MaterialIcons name="warning" size={24} color="#F59E0B" />
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>Unable to load data</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
            <TouchableOpacity onPress={loadActivities} style={styles.retryButton}>
              <MaterialIcons name="refresh" size={16} color="#4E54C8" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              <Text style={styles.activitiesCount}>
                {filteredActivities.length} activity{filteredActivities.length !== 1 ? 'ies' : ''}
              </Text>
            </View>
            
            {filteredActivities.length > 0 ? (
              <View style={styles.activitiesList}>
                {filteredActivities.map((activity, index) => (
                  <View key={index} style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <View style={[
                        styles.activityIcon,
                        { backgroundColor: getActivityColor(activity.type) + '20' }
                      ]}>
                        <MaterialIcons 
                          name={getActivityIcon(activity.type)} 
                          size={20} 
                          color={getActivityColor(activity.type)} 
                        />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityType}>
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </Text>
                        <Text style={styles.activityDate}>
                          {new Date(activity.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </View>
                      {activity.score !== undefined && (
                        <View style={[
                          styles.scoreContainer,
                          { backgroundColor: getScoreColor(activity.score) + '20' }
                        ]}>
                          <Text style={[
                            styles.activityScore,
                            { color: getScoreColor(activity.score) }
                          ]}>
                            {activity.score}%
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={styles.activityDescription}>
                      {formatActivityDescription(activity)}
                    </Text>
                    
                    {activity.assessment_type && (
                      <View style={styles.assessmentTypeContainer}>
                        <Text style={styles.assessmentType}>
                          {activity.assessment_type}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="notifications-none" size={64} color="#CBD5E1" />
                <Text style={styles.emptyText}>No activities found</Text>
                <Text style={styles.emptySubtext}>
                  {filter === 'all' 
                    ? 'No activities recorded for this period' 
                    : `No ${filter} activities found`
                  }
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
  activitiesCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#4E54C8",
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  filterButtonTextActive: {
    color: "#fff",
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
  activitiesList: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: "#64748B",
  },
  scoreContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activityScore: {
    fontSize: 12,
    fontWeight: "bold",
  },
  activityDescription: {
    fontSize: 14,
    color: "#1E293B",
    lineHeight: 20,
    marginBottom: 4,
  },
  assessmentTypeContainer: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  assessmentType: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
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