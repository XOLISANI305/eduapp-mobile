// app/screens/LinkChildScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { parentTrackingApi, User } from '../services/api';

export default function LinkChildScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleSearch = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setSearching(true);
    setHasSearched(false);
    setSearchResults([]);
    
    try {
      console.log('Searching for email:', email);
      const response = await parentTrackingApi.searchStudents(email);
      console.log('Search response:', response);
      
      if (Array.isArray(response)) {
        setSearchResults(response as User[]);
        setHasSearched(true);
        
        if (response.length === 0) {
          Alert.alert(
            'No Results', 
            'No student found with this email address. Please check:\n\n• The email is correct\n• The student account exists\n• The email matches exactly'
          );
        }
      } else {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to search students. ';
      
      if (error.response?.status === 404) {
        errorMessage = 'No student found with this email address.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      Alert.alert('Search Error', errorMessage);
      setHasSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const handleLinkChild = async (childEmail: string, childName: string) => {
    setLoading(true);
    try {
      console.log('Linking child:', childEmail);
      await parentTrackingApi.linkChild(childEmail);
      
      Alert.alert(
        'Success', 
        `${childName} has been successfully linked to your account!`,
        [{ 
          text: 'OK', 
          onPress: () => router.back() 
        }]
      );
    } catch (error: any) {
      console.error('Link error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to link child. ';
      
      if (error.response?.status === 409) {
        errorMessage = 'This child is already linked to your account.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid student email or student not found.';
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      Alert.alert('Link Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setEmail('');
    setSearchResults([]);
    setHasSearched(false);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Link Child</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Link Child Account</Text>
          <Text style={styles.sectionSubtitle}>
            Search for your child using their school email address
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.searchContainer}>
              <MaterialIcons name="email" size={20} color="#64748B" style={styles.searchIcon} />
              <TextInput
                style={styles.input}
                placeholder="child@school.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setHasSearched(false);
                  setSearchResults([]);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!searching}
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity 
                style={[styles.searchButton, searching && styles.searchButtonDisabled]} 
                onPress={handleSearch}
                disabled={searching}
              >
                {searching ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialIcons name="search" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            {searching && (
              <Text style={styles.searchingText}>Searching for students...</Text>
            )}
          </View>
        </View>

        {/* Results Section */}
        {hasSearched && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              <Text style={styles.resultsCount}>
                {searchResults.length} student{searchResults.length !== 1 ? 's' : ''} found
              </Text>
            </View>

            {searchResults.length > 0 ? (
              <View style={styles.resultsList}>
                {searchResults.map((student) => (
                  <View key={student.id} style={styles.studentCard}>
                    <View style={styles.studentHeader}>
                      <View style={styles.studentAvatar}>
                        <Text style={styles.studentAvatarText}>
                          {student.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S'}
                        </Text>
                      </View>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{student.full_name}</Text>
                        <Text style={styles.studentEmail}>{student.email}</Text>
                        {student.grade_level && (
                          <Text style={styles.studentGrade}>
                            Grade {student.grade_level} • {student.class_name || 'No class assigned'}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.linkButton, loading && styles.linkButtonDisabled]}
                      onPress={() => handleLinkChild(student.email, student.full_name)}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <MaterialIcons name="link" size={16} color="#fff" />
                          <Text style={styles.linkButtonText}>Link</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="search-off" size={64} color="#CBD5E1" />
                <Text style={styles.emptyText}>No students found</Text>
                <Text style={styles.emptySubtext}>
                  Please verify the email address is correct
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Help Section */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <MaterialIcons name="help" size={20} color="#4E54C8" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How to link your child</Text>
            <Text style={styles.infoText}>
              • Enter your child&apos;s exact school email address{'\n'}
              • Click the search button{'\n'}
              • Select your child from the results{'\n'}
              • Click Link to connect their account{'\n'}
              • The child will immediately appear in your dashboard
            </Text>
          </View>
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    padding: 0,
  },
  searchButton: {
    backgroundColor: "#4E54C8",
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  searchButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  searchingText: {
    marginTop: 8,
    fontSize: 12,
    color: "#64748B",
    fontStyle: "italic",
  },
  resultsCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  resultsList: {
    gap: 16,
  },
  studentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4E54C8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  studentAvatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  studentGrade: {
    fontSize: 12,
    color: "#94A3B8",
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  linkButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  linkButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
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
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
});