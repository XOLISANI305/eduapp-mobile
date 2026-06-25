// app/screens/CreateAssessmentScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Subject, Group, createAssessment, getTeacherSubjects, getTeacherGroups } from '../services/api';

export default function CreateAssessmentScreen() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [description, setDescription] = useState('');
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      filterGroupsBySubject();
    }
  }, [selectedSubject, groups]);

  const loadInitialData = async () => {
    try {
      setDataLoading(true);
      console.log('🔄 Starting to load initial data...');
      
      const [subjectsData, groupsData] = await Promise.all([
        getTeacherSubjects(),
        getTeacherGroups()
      ]);
      
      console.log('📚 Subjects loaded:', subjectsData);
      console.log('👥 Groups loaded:', groupsData);
      
      setSubjects(subjectsData);
      setGroups(groupsData);
      
    } catch (error: any) {
      console.error('❌ Failed to load initial data:', error);
      Alert.alert('Error', 'Failed to load subjects and groups: ' + error.message);
    } finally {
      setDataLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const filterGroupsBySubject = () => {
    if (selectedSubject && groups.length > 0) {
      const filtered = groups.filter(group => 
        group.subject_id === selectedSubject.id
      );
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups(groups);
    }
  };

  const handleCreateAssessment = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an assessment title');
      return;
    }

    if (!selectedSubject) {
      Alert.alert('Error', 'Please select a subject');
      return;
    }

    if (!selectedGroup) {
      Alert.alert('Error', 'Please select a group');
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Creating assessment with:', {
        title: title.trim(),
        subject_id: selectedSubject.id,
        group_id: selectedGroup.id,
      });

      const newAssessment = await createAssessment(
        title.trim(),
        selectedSubject.id.toString(),
        selectedGroup.id.toString()
      );

      console.log('✅ Assessment created successfully:', newAssessment);
      
      setLoading(false);

      // Navigate directly to AssessmentBuilder
      router.push({
        pathname: '/screens/AssessmentBuilder',
        params: { 
          assessmentId: newAssessment.id.toString(),
          title: newAssessment.title 
        }
      });

    } catch (error: any) {
      setLoading(false);
      console.error('❌ Create assessment error:', error);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Unknown error occurred';
      
      Alert.alert('Error', 'Failed to create assessment: ' + errorMessage);
    }
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedGroup(null);
    setShowSubjectDropdown(false);
  };

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
    setShowGroupDropdown(false);
  };

  if (dataLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Simple back button only - no headers */}
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={styles.section}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Assessment Title *</Text>
            <TextInput
              placeholder="Enter assessment title..."
              value={title}
              onChangeText={setTitle}
              style={styles.textInput}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Subject Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Subject *</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowSubjectDropdown(true)}
            >
              <View style={styles.dropdownContent}>
                {selectedSubject ? (
                  <View style={styles.selectedItem}>
                    <View style={styles.subjectIcon}>
                      <MaterialIcons name="book" size={20} color="#4E54C8" />
                    </View>
                    <View>
                      <Text style={styles.dropdownText}>{selectedSubject.name}</Text>
                      <Text style={styles.dropdownSubtext}>Grade {selectedSubject.grade}</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.dropdownPlaceholder}>Select a subject</Text>
                )}
              </View>
              <MaterialIcons 
                name={showSubjectDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#64748B" 
              />
            </TouchableOpacity>
          </View>

          {/* Group Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Group *</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, !selectedSubject && styles.disabledDropdown]}
              onPress={() => selectedSubject && setShowGroupDropdown(true)}
              disabled={!selectedSubject}
            >
              <View style={styles.dropdownContent}>
                {selectedGroup ? (
                  <View style={styles.selectedItem}>
                    <View style={styles.groupIcon}>
                      <MaterialIcons name="group" size={20} color="#4E54C8" />
                    </View>
                    <Text style={styles.dropdownText}>{selectedGroup.name}</Text>
                  </View>
                ) : (
                  <Text style={!selectedSubject ? styles.dropdownDisabled : styles.dropdownPlaceholder}>
                    {!selectedSubject ? 'Select a subject first' : 'Select a group'}
                  </Text>
                )}
              </View>
              <MaterialIcons 
                name={showGroupDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color={!selectedSubject ? "#CBD5E1" : "#64748B"} 
              />
            </TouchableOpacity>
            
            {selectedSubject && filteredGroups.length === 0 && (
              <View style={styles.warningContainer}>
                <MaterialIcons name="warning" size={16} color="#F59E0B" />
                <Text style={styles.warningText}>
                  No groups available for {selectedSubject.name}. Please create a group first.
                </Text>
              </View>
            )}
          </View>

          {/* Description (Optional) */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              placeholder="Enter assessment description..."
              value={description}
              onChangeText={setDescription}
              style={[styles.textInput, styles.textArea]}
              multiline
              numberOfLines={3}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <MaterialIcons name="info" size={20} color="#4E54C8" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Assessment Creation</Text>
            <Text style={styles.infoText}>
              After creating the assessment, you will be able to add multiple choice questions and options.
              The assessment will be pending admin approval until approved.
            </Text>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            (!title.trim() || !selectedSubject || !selectedGroup || loading) && styles.createButtonDisabled
          ]}
          onPress={handleCreateAssessment}
          disabled={!title.trim() || !selectedSubject || !selectedGroup || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="add-task" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create Assessment</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Subject Dropdown Modal */}
      <Modal
        visible={showSubjectDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSubjectDropdown(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Subject</Text>
              <TouchableOpacity 
                onPress={() => setShowSubjectDropdown(false)} 
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={subjects}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    selectedSubject?.id === item.id && styles.dropdownItemSelected
                  ]}
                  onPress={() => handleSubjectSelect(item)}
                >
                  <View style={styles.dropdownItemContent}>
                    <View style={styles.subjectIcon}>
                      <MaterialIcons name="book" size={20} color="#4E54C8" />
                    </View>
                    <View style={styles.dropdownItemInfo}>
                      <Text style={styles.dropdownItemTitle}>{item.name}</Text>
                      <Text style={styles.dropdownItemSubtitle}>Grade {item.grade}</Text>
                    </View>
                  </View>
                  {selectedSubject?.id === item.id && (
                    <MaterialIcons name="check-circle" size={20} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyDropdown}>
                  <MaterialIcons name="book" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyDropdownText}>No subjects available</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Group Dropdown Modal */}
      <Modal
        visible={showGroupDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGroupDropdown(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Group {selectedSubject && `- ${selectedSubject.name}`}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowGroupDropdown(false)} 
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={filteredGroups}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    selectedGroup?.id === item.id && styles.dropdownItemSelected
                  ]}
                  onPress={() => handleGroupSelect(item)}
                >
                  <View style={styles.dropdownItemContent}>
                    <View style={styles.groupIcon}>
                      <MaterialIcons name="group" size={20} color="#4E54C8" />
                    </View>
                    <Text style={styles.dropdownItemTitle}>{item.name}</Text>
                  </View>
                  {selectedGroup?.id === item.id && (
                    <MaterialIcons name="check-circle" size={20} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyDropdown}>
                  <MaterialIcons name="group" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyDropdownText}>
                    No groups available for {selectedSubject?.name}
                  </Text>
                </View>
              }
            />
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
  backButtonContainer: {
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    paddingTop: 0,
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
  textInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: "#1E293B",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    borderRadius: 12,
  },
  disabledDropdown: {
    backgroundColor: "#F8FAFC",
    borderColor: "#F1F5F9",
  },
  dropdownContent: {
    flex: 1,
  },
  selectedItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  dropdownSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: "#94A3B8",
  },
  dropdownDisabled: {
    fontSize: 16,
    color: "#CBD5E1",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 12,
    color: "#92400E",
    marginLeft: 8,
    flex: 1,
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
  createButton: {
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
  createButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  closeButton: {
    padding: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownItemSelected: {
    backgroundColor: "#F8FAFC",
  },
  dropdownItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dropdownItemInfo: {
    flex: 1,
  },
  dropdownItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  dropdownItemSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  emptyDropdown: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyDropdownText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 12,
    textAlign: "center",
  },
});