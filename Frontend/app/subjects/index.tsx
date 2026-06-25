import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { 
  getSubjects, 
  getEnrolledSubjects, 
  enrollInSubject, 
  unenrollFromSubject,
  Subject, 
  handleApiError 
} from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SubjectsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const searchQuery = params.search as string || "";

  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState(searchQuery);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null); // <-- user role

  useEffect(() => {
    const fetchRole = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setRole(user.role);
      }
    };
    fetchRole();
    loadSubjects();
  }, []);

  useEffect(() => {
    if (searchQuery) setSearchText(searchQuery);
  }, [searchQuery]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const subjectsData = await getSubjects();
      setAllSubjects(subjectsData);

      const enrollments = await getEnrolledSubjects();
      const enrolled = enrollments.map(e => e.subject).filter(Boolean) as Subject[];
      setEnrolledSubjects(enrolled);
    } catch (error) {
      console.error("Error loading subjects:", error);
      Alert.alert("Error", handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubjects();
    setRefreshing(false);
  };

  const handleEnroll = async (subjectId: string) => {
    if (role !== "student") {
      Alert.alert("Access Denied", "Only students can enroll in subjects.");
      return;
    }
    try {
      setEnrolling(subjectId);
      await enrollInSubject(subjectId);
      await loadSubjects();
      Alert.alert("Success", "Successfully enrolled in subject!");
    } catch (error) {
      console.error("Error enrolling:", error);
      Alert.alert("Error", handleApiError(error));
    } finally {
      setEnrolling(null);
    }
  };

  const handleUnenroll = async (subjectId: string) => {
    if (role !== "student") {
      Alert.alert("Access Denied", "Only students can unenroll from subjects.");
      return;
    }
    try {
      setEnrolling(subjectId);
      await unenrollFromSubject(subjectId);
      await loadSubjects();
      Alert.alert("Success", "Successfully unenrolled from subject");
    } catch (error) {
      console.error("Error unenrolling:", error);
      Alert.alert("Error", handleApiError(error));
    } finally {
      setEnrolling(null);
    }
  };

  const handleSubjectPress = (subject: Subject) => {
  router.push(`/Dashboards/SubjectDetail?id=${subject.id}`);
};

  const handleChatPress = (subject: Subject) => {
    if (isEnrolled(subject.id)) {
      router.push(`../Dashboards/QnAChat?subjectId=${subject.id}`);
    } else {
      Alert.alert(
        "Enrollment Required",
        `You need to enroll in ${subject.name} to access the Q&A chat.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Enroll Now", onPress: () => handleEnroll(subject.id) }
        ]
      );
    }
  };

  const handleSearch = () => {
    if (searchText.trim()) router.setParams({ search: searchText.trim() });
    else router.setParams({ search: "" });
  };

  const isEnrolled = (subjectId: string) => enrolledSubjects.some(s => s.id === subjectId);

  const filteredSubjects = allSubjects.filter((subject) => {
  const name = subject?.name || "";
  const description = subject?.description || "";
  const grade = subject?.grade || "";
  const search = searchText || "";

  return (
    name.toLowerCase().includes(search.toLowerCase()) ||
    description.toLowerCase().includes(search.toLowerCase()) ||
    grade.toLowerCase().includes(search.toLowerCase())
  );
});

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading subjects...</Text>
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
        <Text style={styles.headerTitle}>Subjects</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search subjects..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.filterButton} onPress={handleSearch}>
          <Feather name="search" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Enrolled Subjects */}
        {!searchText && enrolledSubjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Enrolled Subjects</Text>
            <Text style={styles.sectionSubtitle}>
              Subjects you&apos;re currently enrolled in
            </Text>
            
            <View style={styles.subjectsGrid}>
              {enrolledSubjects.map(subject => (
                <View key={subject.id} style={styles.subjectCard}>
                  <View style={styles.subjectHeader}>
                    <View style={styles.subjectIcon}>
                      <MaterialIcons name="book" size={24} color="#4E54C8" />
                    </View>
                    <View style={styles.subjectActions}>
                      <TouchableOpacity
                        style={styles.chatButton}
                        onPress={() => handleChatPress(subject)}
                      >
                        <MaterialIcons name="chat" size={18} color="#4E54C8" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.enrollButton}
                        onPress={() => handleUnenroll(subject.id)}
                        disabled={enrolling === subject.id || role !== "student"}
                      >
                        {enrolling === subject.id ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <MaterialIcons name="check-circle" size={20} color="#10B981" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleSubjectPress(subject)}>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                    <Text style={styles.subjectGrade}>Grade {subject.grade}</Text>
                    <Text style={styles.subjectDescription} numberOfLines={3}>
                      {subject.description || "Explore topics and resources"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* All Subjects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchText ? "Search Results" : "Available Subjects"}
            </Text>
            <Text style={styles.subjectsCount}>{filteredSubjects.length} subjects</Text>
          </View>

          {filteredSubjects.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>No subjects found</Text>
              <Text style={styles.emptySubtext}>
                {searchText ? "Try adjusting your search terms" : "No subjects available at the moment"}
              </Text>
            </View>
          ) : (
            <View style={styles.subjectsGrid}>
              {filteredSubjects.map(subject => {
                const enrolled = isEnrolled(subject.id);
                return (
                  <View key={subject.id} style={styles.subjectCard}>
                    <View style={styles.subjectHeader}>
                      <View style={styles.subjectIcon}>
                        <MaterialIcons name="book" size={24} color="#4E54C8" />
                      </View>
                      <View style={styles.subjectActions}>
                        {enrolled && (
                          <TouchableOpacity
                            style={styles.chatButton}
                            onPress={() => handleChatPress(subject)}
                          >
                            <MaterialIcons name="chat" size={18} color="#4E54C8" />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={[styles.enrollButton, enrolled && styles.enrollButtonActive]}
                          onPress={() => enrolled ? handleUnenroll(subject.id) : handleEnroll(subject.id)}
                          disabled={enrolling === subject.id || role !== "student"} // <-- only students
                        >
                          {enrolling === subject.id ? (
                            <ActivityIndicator size="small" color={enrolled ? "#EF4444" : "#4E54C8"} />
                          ) : enrolled ? (
                            <MaterialIcons name="check-circle" size={20} color="#10B981" />
                          ) : (
                            <MaterialIcons name="add-circle" size={20} color="#4E54C8" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => handleSubjectPress(subject)}>
                      <Text style={styles.subjectName} numberOfLines={2}>{subject.name}</Text>
                      <Text style={styles.subjectGrade}>Grade {subject.grade}</Text>
                      <Text style={styles.subjectDescription} numberOfLines={3}>
                        {subject.description || "Explore topics and resources"}
                      </Text>
                    </TouchableOpacity>
                    {enrolled && (
                      <View style={styles.enrolledBadge}>
                        <Text style={styles.enrolledBadgeText}>Enrolled</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
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
    marginLeft: 15,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
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
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#4E54C8",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
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
  sectionSubtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 22,
  },
  subjectsCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  subjectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  subjectCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  subjectActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chatButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  enrollButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  enrollButtonActive: {
    backgroundColor: "#DCFCE7",
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
    lineHeight: 20,
  },
  subjectGrade: {
    fontSize: 14,
    color: "#4E54C8",
    fontWeight: "600",
    marginBottom: 8,
  },
  subjectDescription: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
  enrolledBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  enrolledBadgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
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
});