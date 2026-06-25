// app/screens/ChildAttendanceScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { parentTrackingApi } from '../services/api';

interface AttendanceData {
  summary: {
    total_days: number;
    average_rate: number;
    min_rate: number;
    max_rate: number;
    low_attendance_days: number;
  };
  trends: Array<{
    month: string;
    average_rate: number;
    records_count: number;
  }>;
}

export default function ChildAttendanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { childId, childName } = params;
  
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<AttendanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, [childId, timeRange]);

  const loadAttendance = async () => {
    try {
      setError(null);
      const startDate = getStartDate(timeRange);
      const endDate = new Date().toISOString().split('T')[0];
      
      const data = await parentTrackingApi.getChildAttendance(
        childId as string, 
        startDate, 
        endDate
      );
      
      setAttendance(data as unknown as AttendanceData);
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAttendance();
  };

  const getStartDate = (range: string) => {
    const date = new Date();
    switch (range) {
      case 'weekly':
        date.setDate(date.getDate() - 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() - 3);
        break;
      default:
        date.setMonth(date.getMonth() - 1);
    }
    return date.toISOString().split('T')[0];
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "#10B981";
    if (rate >= 80) return "#F59E0B";
    return "#EF4444";
  };

  const getAttendanceStatus = (rate: number) => {
    if (rate >= 90) return "Excellent";
    if (rate >= 80) return "Good";
    if (rate >= 70) return "Fair";
    return "Needs Improvement";
  };

  const getAttendanceIcon = (rate: number) => {
    if (rate >= 90) return "emoji-events";
    if (rate >= 80) return "check-circle";
    if (rate >= 70) return "info";
    return "warning";
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading attendance...</Text>
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
        <Text style={styles.headerTitle}>Attendance</Text>
        <TouchableOpacity onPress={loadAttendance} style={styles.refreshButton}>
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
            <MaterialIcons name="event" size={32} color="#4E54C8" />
          </View>
          <View style={styles.childInfo}>
            <Text style={styles.childName}>{childName}</Text>
            <Text style={styles.childSubtitle}>Attendance Tracking</Text>
          </View>
        </View>

        {/* Time Range Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Range</Text>
          <View style={styles.timeRangeContainer}>
            {(['weekly', 'monthly', 'quarterly'] as const).map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  timeRange === range && styles.timeRangeButtonActive
                ]}
                onPress={() => setTimeRange(range)}
              >
                <Text style={[
                  styles.timeRangeButtonText,
                  timeRange === range && styles.timeRangeButtonTextActive
                ]}>
                  {range.charAt(0).toUpperCase() + range.slice(1)}
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
            <TouchableOpacity onPress={loadAttendance} style={styles.retryButton}>
              <MaterialIcons name="refresh" size={16} color="#4E54C8" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Attendance Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Attendance Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryMain}>
                  <View style={[styles.attendanceIcon, { backgroundColor: "#EEF2FF" }]}>
                    <MaterialIcons 
                      name={getAttendanceIcon(attendance?.summary.average_rate || 0)} 
                      size={32} 
                      color={getAttendanceColor(attendance?.summary.average_rate || 0)} 
                    />
                  </View>
                  <Text style={[
                    styles.attendanceRate,
                    { color: getAttendanceColor(attendance?.summary.average_rate || 0) }
                  ]}>
                    {attendance?.summary.average_rate.toFixed(1)}%
                  </Text>
                  <Text style={styles.attendanceStatus}>
                    {getAttendanceStatus(attendance?.summary.average_rate || 0)}
                  </Text>
                </View>
                
                <View style={styles.summaryStats}>
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryNumber}>{attendance?.summary.total_days || 0}</Text>
                    <Text style={styles.summaryLabel}>Total Days</Text>
                  </View>
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryNumber}>{attendance?.summary.low_attendance_days || 0}</Text>
                    <Text style={styles.summaryLabel}>Low Days</Text>
                  </View>
                  <View style={styles.summaryStat}>
                    <Text style={[styles.summaryNumber, { color: "#EF4444" }]}>
                      {attendance?.summary.min_rate || 0}%
                    </Text>
                    <Text style={styles.summaryLabel}>Min Rate</Text>
                  </View>
                  <View style={styles.summaryStat}>
                    <Text style={[styles.summaryNumber, { color: "#10B981" }]}>
                      {attendance?.summary.max_rate || 0}%
                    </Text>
                    <Text style={styles.summaryLabel}>Max Rate</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Attendance Trends Chart */}
            {attendance?.trends && attendance.trends.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Monthly Trends</Text>
                  <Text style={styles.trendsCount}>
                    {attendance.trends.length} month{attendance.trends.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.chartCard}>
                  <LineChart
                    data={{
                      labels: attendance.trends.map(t => {
                        const month = t.month.split('-')[1];
                        return `M${month}`;
                      }),
                      datasets: [{
                        data: attendance.trends.map(t => t.average_rate)
                      }]
                    }}
                    width={Dimensions.get('window').width - 80}
                    height={220}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 1,
                      color: (opacity = 1) => `rgba(78, 84, 200, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
                      style: { borderRadius: 16 },
                      propsForDots: {
                        r: '4',
                        strokeWidth: '2',
                        stroke: '#4E54C8'
                      },
                      propsForLabels: {
                        fontSize: 10,
                      }
                    }}
                    bezier
                    style={styles.chart}
                  />
                </View>
              </View>
            )}

            {/* Detailed Trends */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Detailed Trends</Text>
                <Text style={styles.recordsCount}>
                  {attendance?.trends?.length || 0} period{attendance?.trends?.length !== 1 ? 's' : ''}
                </Text>
              </View>

              {attendance?.trends && attendance.trends.length > 0 ? (
                <View style={styles.trendsList}>
                  {attendance.trends.map((trend, index) => (
                    <View key={index} style={styles.trendCard}>
                      <View style={styles.trendHeader}>
                        <View style={styles.trendInfo}>
                          <View style={styles.trendIcon}>
                            <MaterialIcons name="calendar-today" size={20} color="#4E54C8" />
                          </View>
                          <View>
                            <Text style={styles.trendMonth}>
                              {new Date(trend.month + '-01').toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long' 
                              })}
                            </Text>
                            <Text style={styles.trendRecords}>
                              {trend.records_count} attendance records
                            </Text>
                          </View>
                        </View>
                        <View style={[
                          styles.trendScore,
                          { backgroundColor: getAttendanceColor(trend.average_rate) + '20' }
                        ]}>
                          <Text style={[
                            styles.trendRate,
                            { color: getAttendanceColor(trend.average_rate) }
                          ]}>
                            {trend.average_rate.toFixed(1)}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <MaterialIcons name="show-chart" size={64} color="#CBD5E1" />
                  <Text style={styles.emptyText}>No attendance data available</Text>
                  <Text style={styles.emptySubtext}>
                    Attendance records will appear here as they are recorded
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
  timeRangeContainer: {
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
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  timeRangeButtonActive: {
    backgroundColor: "#4E54C8",
  },
  timeRangeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  timeRangeButtonTextActive: {
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
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryMain: {
    alignItems: "center",
    marginBottom: 20,
  },
  attendanceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  attendanceRate: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  attendanceStatus: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4E54C8",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  summaryStat: {
    alignItems: "center",
    flex: 1,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  trendsCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  recordsCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chart: {
    borderRadius: 16,
  },
  trendsList: {
    gap: 12,
  },
  trendCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trendInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  trendIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  trendMonth: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  trendRecords: {
    fontSize: 12,
    color: "#64748B",
  },
  trendScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  trendRate: {
    fontSize: 14,
    fontWeight: "bold",
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