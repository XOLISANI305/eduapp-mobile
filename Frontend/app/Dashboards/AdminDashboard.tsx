// AdminDashboard.tsx 
import { Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from 'expo-file-system/legacy';
import { File, Paths } from 'expo-file-system';

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";

import {
  Resource as ApiResource,
  Assessment,
  createAssessment,
  createGroup,
  createResource,
  createSubject,
  createTopic,
  deleteAssessment,
  deleteGroup,
  deleteResource,
  deleteSubject,
  deleteTopic,
  getAssessmentsBySubject,
  getErrorMessage,
  getGroupsBySubject,
  getResourcesByTopic,
  getSubjects,
  getTopicsBySubject,
  Group,
  setAuthToken,
  Subject,
  Topic,
  approveAssessment,
  updateSubject 
} from "../services/api";


type Resource = ApiResource;

type PickedFile = {
  uri: string;
  name: string;
  type: string;
  size?: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [topics, setTopics] = useState<Record<string, Topic[]>>({});
  const [groups, setGroups] = useState<Record<string, Group[]>>({});
  const [assessments, setAssessments] = useState<Record<string, Assessment[]>>({});
  const [resources, setResources] = useState<Record<string, Resource[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  
  const [adminName, setAdminName] = useState("");
  const [adminInitial, setAdminInitial] = useState("");
  const [adminImage, setAdminImage] = useState("");

  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<string>("add-subject");
  const [modalSubjectId, setModalSubjectId] = useState<string | null>(null);
  const [modalItemId, setModalItemId] = useState<string | null>(null);
  const [modalName, setModalName] = useState("");
  const [modalGrade, setModalGrade] = useState("");
  const [modalResType, setModalResType] = useState<Resource["type"]>("pdf");
  const [modalResUrl, setModalResUrl] = useState("");
  const [modalResFile, setModalResFile] = useState<PickedFile | null>(null);
  const [modalTopicId, setModalTopicId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);

  
  const getFileType = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    const fileTypes: Record<string, string> = {
      pdf: 'pdf',
      doc: 'document',
      docx: 'document', 
      xls: 'spreadsheet',
      xlsx: 'spreadsheet',
      ppt: 'presentation',
      pptx: 'presentation',
      mp4: 'video',
      avi: 'video',
      mov: 'video',
      wmv: 'video',
      flv: 'video',
      webm: 'video',
      mkv: 'video',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
      bmp: 'image',
      webp: 'image',
      mp3: 'audio',
      wav: 'audio',
      m4a: 'audio',
      aac: 'audio',
      flac: 'audio',
      txt: 'text',
      rtf: 'text',
    };
    
    return fileTypes[extension || ''] || 'unknown';
  };

  const downloadFile = async (url: string, filename: string): Promise<string | null> => {
    try {
      const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const file = new File(Paths.document, cleanFilename);
      
      console.log(`Downloading file from ${url} to ${file.uri}`);
      await File.downloadFileAsync(url, file);
      
      console.log('File downloaded successfully to:', file.uri);
      return file.uri;
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Error', 'Failed to download file: ' + getErrorMessage(error));
      return null;
    }
  };

  const checkFileExists = async (fileUrl: string): Promise<boolean> => {
    try {
      const response = await fetch(fileUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const handleOpenResource = async (resource: Resource) => {
    try {
      if (!resource.file_path) {
        Alert.alert("Error", "File path not available for this resource");
        return;
      }

      const filename = resource.title || `resource_${resource.id}`;
      const fileType = resource.type || getFileType(filename);
      
      const cleanFilePath = resource.file_path.replace(/\\/g, '/').replace('uploads/', '');
      const fileUrl = `https://eduapp-backend-1.onrender.com/uploads/${cleanFilePath}`;
      
      console.log('🔍 Checking file:', fileUrl);

      const fileExists = await checkFileExists(fileUrl);
      console.log('📁 File exists on server:', fileExists);

      if (!fileExists) {
        Alert.alert(
          "File Not Found",
          `The file "${filename}" doesn't exist on the server.\n\nServer path: ${resource.file_path}\n\nThis usually means:\n1. The file wasn't uploaded properly\n2. The server was restarted and lost files\n3. The file path is incorrect`,
          [
            { text: "OK", style: "cancel" },
            { 
              text: "View Server Files", 
              onPress: () => Linking.openURL("https://eduapp-backend-1.onrender.com/api")
            }
          ]
        );
        return;
      }

      if (fileType === 'pdf') {
        router.push({
          pathname: '/screens/pdf-viewer',
          params: { 
            url: fileUrl, 
            title: resource.title 
          }
        });
      } else {
        openFileWithViewer(fileUrl, filename, fileType);
      }
      
    } catch (error) {
      console.error('Error opening resource:', error);
      Alert.alert("Error", "Failed to open resource");
    }
  };

  const openFileWithViewer = async (filePath: string, filename: string, fileType: string) => {
    try {
      console.log(`Opening file: ${filename} (${fileType}) at ${filePath}`);
      
      switch (fileType) {
        case 'pdf':
          router.push({
            pathname: '/screens/pdf-viewer',
            params: { 
              url: filePath, 
              title: filename 
            }
          });
          break;
          
        case 'document':
        case 'spreadsheet':
        case 'presentation':
          try {
            console.log(`Opening Office file: ${filePath}`);
            await Linking.openURL(filePath);
          } catch (error) {
            Alert.alert(
              "Open File",
              `This ${fileType} file cannot be opened directly. Would you like to download it?`,
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Download", 
                  onPress: () => {
                    window.open(filePath, '_blank');
                  }
                }
              ]
            );
          }
          break;
          
        case 'video':
          Alert.alert("Info", "Video player not implemented yet");
          break;
          
        case 'image':
          try {
            await Linking.openURL(filePath);
          } catch (error) {
            Alert.alert("Error", "Cannot open image file");
          }
          break;
          
        case 'audio':
          try {
            await Linking.openURL(filePath);
          } catch (error) {
            Alert.alert("Error", "Cannot open audio file");
          }
          break;
          
        default:
          try {
            await Linking.openURL(filePath);
          } catch (error) {
            Alert.alert(
              "Open File",
              `Cannot open ${fileType} file directly. Download it?`,
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Download", 
                  onPress: () => {
                    window.open(filePath, '_blank');
                  }
                }
              ]
            );
          }
          break;
      }
    } catch (error) {
      console.error('Error opening file with viewer:', error);
      Alert.alert("Error", "Cannot open file: " + getErrorMessage(error));
    }
  };

  // Enhanced resource icon function
  const getResourceIcon = (type: string, size: number = 20) => {
    const iconColor = getResourceIconColor(type);
    
    switch (type) {
      case 'pdf': 
        return <MaterialIcons name="picture-as-pdf" size={size} color={iconColor} />;
      case 'video': 
        return <MaterialIcons name="videocam" size={size} color={iconColor} />;
      case 'document': 
        return <FontAwesome5 name="file-word" size={size} color={iconColor} />;
      case 'spreadsheet': 
        return <FontAwesome5 name="file-excel" size={size} color={iconColor} />;
      case 'presentation': 
        return <FontAwesome5 name="file-powerpoint" size={size} color={iconColor} />;
      case 'image': 
        return <MaterialIcons name="image" size={size} color={iconColor} />;
      case 'audio': 
        return <MaterialIcons name="audiotrack" size={size} color={iconColor} />;
      case 'text':
        return <MaterialIcons name="description" size={size} color={iconColor} />;
      default: 
        return <Feather name="file" size={size} color="#7f8c8d" />;
    }
  };

  const getResourceIconColor = (type: string) => {
    switch (type) {
      case 'pdf': return "#e74c3c";
      case 'video': return "#9b59b6";
      case 'document': return "#2980b9";
      case 'spreadsheet': return "#27ae60";
      case 'presentation': return "#e67e22";
      case 'image': return "#f39c12";
      case 'audio': return "#1abc9c";
      case 'text': return "#34495e";
      default: return "#7f8c8d";
    }
  };

  // Initialize auth and load data
  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('authToken');
        if (token) {
          setAuthToken(token);
          console.log('Auth token set');
        } else {
          Alert.alert('Error', 'Please log in first');
          return;
        }
        
        await loadAdminProfile();
        await loadData();
      } catch (error) {
        console.error('Init error:', error);
        Alert.alert('Error', 'Failed to initialize');
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, []);

  const loadAdminProfile = async () => {
    try {
      let name = await AsyncStorage.getItem('adminName') || 
                 await AsyncStorage.getItem('userName') || 
                 await AsyncStorage.getItem('name') || 
                 await AsyncStorage.getItem('username');
      
      if (!name) {
        name = "Admin User";
      }
      
      setAdminName(name);
      
      if (name && name.length > 0) {
        setAdminInitial(name.charAt(0).toUpperCase());
      }
      
      const image = await AsyncStorage.getItem('adminImage') || 
                    await AsyncStorage.getItem('userImage');
      
      if (image) {
        setAdminImage(image);
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
      setAdminName("Admin User");
      setAdminInitial("A");
    }
  };

  const loadData = async () => {
    try {
      console.log('Loading subjects...');
      const subjectsData = await getSubjects();
      console.log('Subjects loaded:', subjectsData?.length);
      
      if (!Array.isArray(subjectsData)) {
        console.warn('Subjects data is not an array:', subjectsData);
        setSubjects([]);
        return;
      }

      setSubjects(subjectsData);

      const topicsData: Record<string, Topic[]> = {};
      const groupsData: Record<string, Group[]> = {};
      const assessmentsData: Record<string, Assessment[]> = {};
      const resourcesData: Record<string, Resource[]> = {};

      for (const subject of subjectsData) {
        if (!subject?.id) continue;
        const subjectId = String(subject.id);

        try {
          const subjectTopics = await getTopicsBySubject(subjectId);
          topicsData[subjectId] = Array.isArray(subjectTopics) ? subjectTopics : [];

          const subjectGroups = await getGroupsBySubject(subjectId);
          groupsData[subjectId] = Array.isArray(subjectGroups) ? subjectGroups : [];

          const subjectAssessments = await getAssessmentsBySubject(subjectId);
          assessmentsData[subjectId] = Array.isArray(subjectAssessments) ? subjectAssessments : [];

          for (const topic of topicsData[subjectId]) {
            if (!topic?.id) continue;
            const topicId = String(topic.id);
            try {
              const topicResources = await getResourcesByTopic(topicId);
              resourcesData[topicId] = Array.isArray(topicResources) ? topicResources : [];
            } catch (err) {
              console.error(`Failed to load resources for topic ${topicId}:`, err);
              resourcesData[topicId] = [];
            }
          }
        } catch (err) {
          console.error(`Failed to load data for subject ${subjectId}:`, err);
          topicsData[subjectId] = [];
          groupsData[subjectId] = [];
          assessmentsData[subjectId] = [];
        }
      }

      setTopics(topicsData);
      setGroups(groupsData);
      setAssessments(assessmentsData);
      setResources(resourcesData);
    } catch (error) {
      console.error('Load data error:', error);
      Alert.alert('Error', getErrorMessage(error));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  
  const handleDeleteSubject = async (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "This will delete the subject and all its topics, groups, assessments, and resources. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSubject(id);
              setSubjects(prev => prev.filter(s => String(s.id) !== id));
              setTopics(prev => { const updated = { ...prev }; delete updated[id]; return updated; });
              setGroups(prev => { const updated = { ...prev }; delete updated[id]; return updated; });
              setAssessments(prev => { const updated = { ...prev }; delete updated[id]; return updated; });
              Alert.alert("Success", "Subject deleted successfully!");
            } catch (error) {
              Alert.alert("Error", "Delete Failed: " + getErrorMessage(error));
            }
          }
        }
      ]
    );
  };



  const handleDeleteTopic = async (subjectId: string, topicId: string) => {
    Alert.alert(
      "Confirm Delete",
      "This will delete the topic and all its resources. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTopic(topicId);
              setTopics(prev => ({
                ...prev,
                [subjectId]: prev[subjectId]?.filter(t => String(t.id) !== topicId) || []
              }));
              setResources(prev => { const updated = { ...prev }; delete updated[topicId]; return updated; });
              Alert.alert("Success", "Topic deleted successfully!");
            } catch (error) {
              Alert.alert("Error", "Delete Failed: " + getErrorMessage(error));
            }
          }
        }
      ]
    );
  };

  const handleDeleteGroup = async (subjectId: string, groupId: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGroup(groupId);
              setGroups(prev => ({
                ...prev,
                [subjectId]: prev[subjectId]?.filter(g => String(g.id) !== groupId) || []
              }));
              Alert.alert("Success", "Group deleted successfully!");
            } catch (error) {
              Alert.alert("Error", "Delete Failed: " + getErrorMessage(error));
            }
          }
        }
      ]
    );
  };

  const handleDeleteAssessment = async (subjectId: string, assessmentId: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this assessment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAssessment(assessmentId);
              setAssessments(prev => ({
                ...prev,
                [subjectId]: prev[subjectId]?.filter(a => String(a.id) !== assessmentId) || []
              }));
              Alert.alert("Success", "Assessment deleted successfully!");
            } catch (error) {
              Alert.alert("Error", "Delete Failed: " + getErrorMessage(error));
            }
          }
        }
      ]
    );
  };

  const handleDeleteResource = async (topicId: string, resourceId: string | number) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this resource?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteResource(String(resourceId));
              setResources(prev => ({
                ...prev,
                [topicId]: prev[topicId]?.filter(r => String(r.id) !== String(resourceId)) || []
              }));
              Alert.alert("Success", "Resource deleted successfully!");
            } catch (error) {
              Alert.alert("Error", "Delete Failed: " + getErrorMessage(error));
            }
          }
        }
      ]
    );
  };

  // Create handlers
  const handleAddSubject = async (name: string, grade: string) => {
    try {
      const newSubject = await createSubject(name, grade || "Grade 12");
      setSubjects(prev => [...prev, newSubject]);
      Alert.alert("Success", "Subject added successfully!");
      return true;
    } catch (error) {
      Alert.alert("Error", "Error: " + getErrorMessage(error));
      return false;
    }
  };

  const handleAddTopic = async (subjectId: string, name: string) => {
    try {
      const newTopic = await createTopic(subjectId, name);
      setTopics(prev => ({
        ...prev,
        [subjectId]: [...(prev[subjectId] || []), newTopic]
      }));
      Alert.alert("Success", "Topic added successfully!");
      return true;
    } catch (error) {
      Alert.alert("Error", "Error: " + getErrorMessage(error));
      return false;
    }
  };

  const handleAddGroup = async (subjectId: string, name: string) => {
    try {
      const newGroup = await createGroup(subjectId, name);
      setGroups(prev => ({
        ...prev,
        [subjectId]: [...(prev[subjectId] || []), newGroup]
      }));
      Alert.alert("Success", "Group added successfully!");
      return true;
    } catch (error) {
      Alert.alert("Error", "Error: " + getErrorMessage(error));
      return false;
    }
  };

  const handleApproveAssessment = async (subjectId: string, assessmentId: string) => {
    try {
      const updatedAssessment = await approveAssessment(assessmentId);
      
      setAssessments(prev => ({
        ...prev,
        [subjectId]: prev[subjectId]?.map(a => 
          String(a.id) === assessmentId ? updatedAssessment : a
        ) || []
      }));
      
      Alert.alert(
        "Success", 
        `Assessment ${updatedAssessment.approved ? 'approved' : 'unapproved'} successfully!`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to toggle approval: " + getErrorMessage(error));
    }
  };

  const handleAddResource = async (
    topicId: string, 
    title: string, 
    type: Resource["type"], 
    file?: PickedFile, 
    url?: string
  ): Promise<boolean> => {
    try {
      setUploading(true);
      
      if (!file && !url) {
        Alert.alert("Error", "Please provide either a file or a URL");
        return false;
      }

      const formData = new FormData();
      formData.append('topic_id', topicId);
      formData.append('title', title);
      formData.append('type', type);
      
      if (url) formData.append('url', url);
      
      if (file) {
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      }

      const newResource = await createResource(formData);
      
      if (newResource && newResource.id) {
        setResources(prev => {
          const updatedResources = { ...prev };
          if (!updatedResources[topicId]) {
            updatedResources[topicId] = [];
          }
          updatedResources[topicId] = [...updatedResources[topicId], newResource];
          return updatedResources;
        });
        
        Alert.alert("Success", "Resource uploaded successfully!");
        return true;
      } else {
        throw new Error("Invalid response from server");
      }
      
    } catch (error: any) {
      Alert.alert("Error", getErrorMessage(error));
      return false;
    } finally {
      setUploading(false);
    }
  };


  
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true,
        multiple: false
      });
      
      if (result.canceled) return;
      
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileInfo = await FileSystem.getInfoAsync(file.uri);
        
        if (fileInfo.exists) {
          setModalResFile({
            uri: file.uri,
            name: file.name || 'document',
            type: file.mimeType || 'application/octet-stream',
            size: file.size || 0,
          });
          setModalResUrl('');
          Alert.alert("File Selected", `Selected: ${file.name}`);
        }
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick document: " + getErrorMessage(err));
    }
  };

  const handleAddAssessment = async (subjectId: string, title: string, groupId: string): Promise<boolean> => {
    try {
      if (!subjectId || !title.trim() || !groupId) {
        Alert.alert("Error", "Please provide all required fields");
        return false;
      }

      const newAssessment = await createAssessment(title, subjectId, groupId);
      
      setAssessments(prev => ({
        ...prev,
        [subjectId]: [...(prev[subjectId] || []), newAssessment]
      }));
      
      Alert.alert("Success", "Assessment added successfully!");
      return true;
    } catch (error) {
      Alert.alert("Error", "Failed to create assessment: " + getErrorMessage(error));
      return false;
    }
  };

  const showResourceTypePicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'PDF', 'Video', 'Word Document', 'Excel Spreadsheet', 'PowerPoint', 'Image', 'Audio', 'Text'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) return;
          const types = ['pdf', 'video', 'document', 'spreadsheet', 'presentation', 'image', 'audio', 'text'];
          setModalResType(types[buttonIndex - 1] as Resource["type"]);
        }
      );
    } else {
      setShowPicker(!showPicker);
    }
  };

  const openModal = (type: string, subjectId?: string, itemId?: string, name?: string, grade?: string, topicId?: string) => {
    setModalType(type);
    setModalSubjectId(subjectId || null);
    setModalItemId(itemId || null);
    setModalName(name || "");
    setModalGrade(grade || "");
    setModalTopicId(topicId || null);
    setModalResType("pdf");
    setModalResUrl("");
    setModalResFile(null);
    setShowPicker(false);
    setSelectedGroupId('');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalName("");
    setModalGrade("");
    setModalResFile(null);
    setModalResUrl("");
    setShowPicker(false);
    setSelectedGroupId('');
    setShowGroupDropdown(false);
  };


  const handleEditSubject = async (id: string, name: string, grade: string) => {
  try {
    console.log('Editing subject:', { id, name, grade });
    
   
    if (!id || !name.trim()) {
      Alert.alert("Error", "Subject ID and name are required");
      return false;
    }
    
    const updatedSubject = await updateSubject(id, name.trim(), grade || "Grade 12");
    console.log('Subject updated successfully:', updatedSubject);
    
    setSubjects(prev => prev.map(s => String(s.id) === id ? updatedSubject : s));
    Alert.alert("Success", "Subject updated successfully!");
    return true;
  } catch (error: any) {
    console.error('Failed to update subject:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    let errorMessage = "Failed to update subject: ";
    if (error.response?.data?.message) {
      errorMessage += error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage += error.response.data.error;
    } else {
      errorMessage += getErrorMessage(error);
    }
    
    Alert.alert("Error", errorMessage);
    return false;
  }
};



const handleModalSubmit = async () => {
  let success = false;
  
  console.log('Modal submit - Type:', modalType);
  console.log('Modal data:', { modalItemId, modalName, modalGrade, modalSubjectId });
  
  switch (modalType) {
    case "add-subject":
      success = await handleAddSubject(modalName, modalGrade);
      break;
    case "edit-subject":
      if (!modalItemId) {
        Alert.alert("Error", "Subject ID is missing");
        return;
      }
      if (!modalName.trim()) {
        Alert.alert("Error", "Subject name is required");
        return;
      }
      success = await handleEditSubject(modalItemId, modalName, modalGrade);
      break;
    case "add-topic":
      if (modalSubjectId) success = await handleAddTopic(modalSubjectId, modalName);
      break;
    case "add-group":
      if (modalSubjectId) success = await handleAddGroup(modalSubjectId, modalName);
      break;
    case "add-assessment":
      if (modalSubjectId) {
        if (!selectedGroupId) {
          Alert.alert("Error", "Please select a group for the assessment");
          return;
        }
        success = await handleAddAssessment(modalSubjectId, modalName, selectedGroupId);
      }
      break;
    case "add-resource":
      if (modalTopicId) {
        if (!modalResFile && !modalResUrl) {
          Alert.alert("Error", "Please provide either a file or a URL");
          return;
        }
        
        let fileToUpload: PickedFile | undefined;
        if (modalResFile) {
          try {
            const fileInfo = await FileSystem.getInfoAsync(modalResFile.uri);
            if (!fileInfo.exists) {
              Alert.alert("Error", "Selected file no longer exists or is inaccessible");
              return;
            }
            fileToUpload = modalResFile;
          } catch (error) {
            Alert.alert("Error", "Cannot access the selected file");
            return;
          }
        }
        
        success = await handleAddResource(modalTopicId, modalName, modalResType, fileToUpload, modalResUrl);
      }
      break;
    default:
      Alert.alert("Error", "Unknown modal type");
  }
  
  if (success) {
    closeModal();
    setTimeout(() => loadData(), 500);
  }
};


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#4E54C8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <TouchableOpacity 
  style={styles.adminProfileCard} 
  activeOpacity={0.8} 
  onPress={() => {
    // Action when card is tapped
    // e.g., navigate to admin profile screen
    router.push("/profile");
  }}
>
  <View style={styles.adminImageContainer}>
    {adminImage ? (
      <Image 
        source={{ uri: adminImage }} 
        style={styles.adminImage}
      />
    ) : (
      <View style={[styles.adminImage, styles.adminInitialContainer]}>
        <Text style={styles.adminInitialText}>{adminInitial}</Text>
      </View>
    )}
    <View style={styles.statusIndicator} />
  </View>
  
  <View style={styles.adminInfo}>
    <Text style={styles.adminName}>{adminName}</Text>
    <View style={styles.adminStats}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{subjects?.length || 0}</Text>
        <Text style={styles.statLabel}>Subjects</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {Object.values(topics || {}).reduce(
            (sum, topicList) => sum + (topicList?.length || 0),
            0
          )}
        </Text>
        <Text style={styles.statLabel}>Topics</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {Object.values(resources || {}).reduce(
            (sum, resList) => sum + (resList?.length || 0),
            0
          )}
        </Text>
        <Text style={styles.statLabel}>Resources</Text>
      </View>
    </View>
  </View>
  
  <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
    <MaterialIcons name="refresh" size={24} color="#4E54C8" />
  </TouchableOpacity>
</TouchableOpacity>


        {/* Main Content */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Manage Content</Text>
            <TouchableOpacity onPress={() => openModal("add-subject")} style={styles.primaryButton}>
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Add Subject</Text>
            </TouchableOpacity>
          </View>

          {subjects?.length > 0 ? subjects.map((subject) => (
            <View key={subject.id} style={styles.subjectCard}>
              <TouchableOpacity 
                onPress={() => setExpanded(prev => ({ ...prev, [String(subject.id)]: !prev[String(subject.id)] }))}
                style={styles.cardHeader}
              >
                <View style={styles.subjectHeader}>
                  <View style={styles.subjectIcon}>
                    <MaterialIcons name="book" size={24} color="#4E54C8" />
                  </View>
                  <View style={styles.subjectInfo}>
                    <Text style={styles.subjectTitle}>
                      {subject.name}
                    </Text>
                    <Text style={styles.subjectGrade}>Grade {subject.grade}</Text>
                  </View>
                  <MaterialIcons 
                    name={expanded[String(subject.id)] ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={24} 
                    color="#4E54C8" 
                  />
                </View>
              </TouchableOpacity>

              {expanded[String(subject.id)] && (
                <View style={styles.cardContent}>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => openModal("edit-subject", String(subject.id), String(subject.id), subject.name, subject.grade)}
                      style={styles.editButton}
                    >
                      <MaterialIcons name="edit" size={16} color="#4E54C8" />
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteSubject(String(subject.id))}
                      style={styles.deleteButton}
                    >
                      <MaterialIcons name="delete" size={16} color="#fff" />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Topics */}
                  <View style={styles.subSection}>
                    <View style={styles.subSectionHeader}>
                      <Text style={styles.subSectionTitle}>Topics</Text>
                      <TouchableOpacity 
                        onPress={() => openModal("add-topic", String(subject.id))} 
                        style={styles.addButton}
                      >
                        <MaterialIcons name="add" size={16} color="#4E54C8" />
                        <Text style={styles.addButtonText}>Add Topic</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {topics[String(subject.id)]?.length > 0 ? topics[String(subject.id)].map((topic) => (
                      <View key={topic.id} style={styles.listItem}>
                        <View style={styles.itemContent}>
                          <MaterialIcons name="folder" size={20} color="#4E54C8" />
                          <Text style={styles.itemText}>{topic.name}</Text>
                        </View>
                        <View style={styles.itemActions}>
                          <TouchableOpacity
                            onPress={() => openModal("add-resource", String(subject.id), undefined, undefined, undefined, String(topic.id))}
                            style={styles.resourceButton}
                          >
                            <MaterialIcons name="attach-file" size={16} color="#fff" />
                            <Text style={styles.resourceButtonText}>Add Resource</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteTopic(String(subject.id), String(topic.id))}
                            style={styles.smallDeleteButton}
                          >
                            <MaterialIcons name="delete" size={16} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )) : (
                      <Text style={styles.emptyText}>No topics added yet</Text>
                    )}
                  </View>

                  {/* Groups */}
                  <View style={styles.subSection}>
                    <View style={styles.subSectionHeader}>
                      <Text style={styles.subSectionTitle}>Groups</Text>
                      <TouchableOpacity 
                        onPress={() => openModal("add-group", String(subject.id))} 
                        style={styles.addButton}
                      >
                        <MaterialIcons name="add" size={16} color="#4E54C8" />
                        <Text style={styles.addButtonText}>Add Group</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {groups[String(subject.id)]?.length > 0 ? groups[String(subject.id)].map((group) => (
                      <View key={group.id} style={styles.listItem}>
                        <View style={styles.itemContent}>
                          <MaterialIcons name="group" size={20} color="#4E54C8" />
                          <Text style={styles.itemText}>{group.name}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleDeleteGroup(String(subject.id), String(group.id))}
                          style={styles.smallDeleteButton}
                        >
                          <MaterialIcons name="delete" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    )) : (
                      <Text style={styles.emptyText}>No groups added yet</Text>
                    )}
                  </View>

                  {/* Assessments */}
                  <View style={styles.subSection}>
                    <View style={styles.subSectionHeader}>
                      <Text style={styles.subSectionTitle}>MCQ Assessments</Text>
                      <TouchableOpacity 
                        onPress={() => openModal("add-assessment", String(subject.id))} 
                        style={styles.addButton}
                      >
                        <MaterialIcons name="add" size={16} color="#4E54C8" />
                        <Text style={styles.addButtonText}>Add Assessment</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {assessments[String(subject.id)]?.length > 0 ? (
                      assessments[String(subject.id)].map((assessment) => (
                        <View key={assessment.id} style={styles.assessmentItemCard}>
                          <View style={styles.assessmentMainInfo}>
                            <View style={styles.assessmentTitleRow}>
                              <MaterialIcons name="quiz" size={20} color="#4E54C8" />
                              <Text style={styles.assessmentTitleText}>{assessment.title}</Text>
                            </View>
                            
                            <View style={styles.assessmentBadgeRow}>
                              <View style={[
                                styles.assessmentStatusBadge,
                                assessment.approved ? styles.approvedBadge : styles.pendingBadge
                              ]}>
                                <MaterialIcons 
                                  name={assessment.approved ? "check-circle" : "schedule"} 
                                  size={14} 
                                  color={assessment.approved ? "#155724" : "#856404"} 
                                />
                                <Text style={[
                                  styles.statusBadgeText,
                                  assessment.approved ? styles.approvedText : styles.pendingText
                                ]}>
                                  {assessment.approved ? 'Approved' : 'Pending'}
                                </Text>
                              </View>
                              
                              {groups[String(subject.id)]?.find(g => String(g.id) === String(assessment.group_id)) && (
                                <View style={styles.groupBadge}>
                                  <MaterialIcons name="group" size={14} color="#666" />
                                  <Text style={styles.groupBadgeText}>
                                    {groups[String(subject.id)].find(g => String(g.id) === String(assessment.group_id))?.name}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>

                          <View style={styles.assessmentActionsRow}>
                            <TouchableOpacity
                              onPress={() => {
                                router.push({
                                  pathname: '/screens/AssessmentBuilder',
                                  params: { 
                                    assessmentId: String(assessment.id),
                                    title: assessment.title 
                                  }
                                });
                              }}
                              style={styles.editMcqButton}
                            >
                              <MaterialIcons name="edit" size={16} color="#fff" />
                              <Text style={styles.editMcqButtonText}>Edit MCQs</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => handleApproveAssessment(String(subject.id), String(assessment.id))}
                              style={[
                                styles.approveToggleButton,
                                assessment.approved ? styles.unapproveButton : styles.approveButtonStyle
                              ]}
                            >
                              <MaterialIcons 
                                name={assessment.approved ? "block" : "check-circle"} 
                                size={16} 
                                color="#fff" 
                              />
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => handleDeleteAssessment(String(subject.id), String(assessment.id))}
                              style={styles.smallDeleteButton}
                            >
                              <MaterialIcons name="delete" size={16} color="#fff" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyText}>No assessments added yet</Text>
                    )}
                  </View>

                  {/* Resources */}
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>Resources</Text>
                    
                    {Object.entries(resources).length > 0 ? (
                      Object.entries(resources).map(([topicId, resList]) => {
                        const topic = topics[String(subject.id)]?.find(t => String(t.id) === topicId);
                        if (!topic || !resList.length) return null;
                        
                        return (
                          <View key={topicId} style={styles.topicResources}>
                            <Text style={styles.topicName}>Topic: {topic.name}</Text>
                            {resList.map(resource => (
                              <TouchableOpacity 
                                key={resource.id} 
                                style={styles.resourceItem}
                                onPress={() => handleOpenResource(resource)}
                                activeOpacity={0.7}
                              >
                                <View style={styles.resourceInfo}>
                                  {getResourceIcon(resource.type, 24)}
                                  <View style={styles.resourceTextContainer}>
                                    <Text style={styles.resourceText}>{resource.title}</Text>
                                    <Text style={styles.resourceSubtext}>
                                      Tap to open • {resource.type.toUpperCase()}
                                    </Text>
                                  </View>
                                </View>
                                <View style={styles.resourceActions}>
                                  <TouchableOpacity
                                    onPress={(e) => {
                                      e.stopPropagation();
                                      handleDeleteResource(topicId, resource.id);
                                    }}
                                    style={styles.smallDeleteButton}
                                  >
                                    <MaterialIcons name="delete" size={16} color="#fff" />
                                  </TouchableOpacity>
                                </View>
                              </TouchableOpacity>
                            ))}
                          </View>
                        );
                      })
                    ) : (
                      <Text style={styles.emptyText}>No resources added yet</Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          )) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="folder-open" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No subjects found</Text>
              <Text style={styles.emptySubtext}>Add your first subject to get started</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType.includes("add") ? "Add" : "Edit"} {
                  modalType.includes("subject") ? "Subject" :
                  modalType.includes("topic") ? "Topic" :
                  modalType.includes("group") ? "Group" :
                  modalType.includes("assessment") ? "Assessment" :
                  modalType.includes("resource") ? "Resource" : "Item"
                }
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#4E54C8" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <TextInput
                placeholder="Name"
                value={modalName}
                onChangeText={setModalName}
                style={styles.input}
                placeholderTextColor="#999"
              />
              
              {(modalType.includes("subject")) && (
                <TextInput
                  placeholder="Grade"
                  value={modalGrade}
                  onChangeText={setModalGrade}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              )}
              
              {modalType.includes("assessment") && modalSubjectId && (
                <>
                  <Text style={styles.label}>Select Group:</Text>
                  
                  <TouchableOpacity 
                    style={styles.dropdownTrigger}
                    onPress={() => setShowGroupDropdown(!showGroupDropdown)}
                  >
                    <Text style={[
                      styles.dropdownTriggerText,
                      !selectedGroupId && styles.dropdownPlaceholder
                    ]}>
                      {selectedGroupId 
                        ? groups[modalSubjectId]?.find(g => String(g.id) === selectedGroupId)?.name 
                        : "Select a group"
                      }
                    </Text>
                    <MaterialIcons 
                      name={showGroupDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                      size={24} 
                      color="#666" 
                    />
                  </TouchableOpacity>

                  {showGroupDropdown && groups[modalSubjectId]?.length > 0 && (
                    <View style={styles.dropdownOptions}>
                      <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                        {groups[modalSubjectId].map(group => (
                          <TouchableOpacity
                            key={group.id}
                            style={[
                              styles.dropdownOption,
                              selectedGroupId === String(group.id) && styles.dropdownOptionSelected
                            ]}
                            onPress={() => {
                              setSelectedGroupId(String(group.id));
                              setShowGroupDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownOptionText,
                              selectedGroupId === String(group.id) && styles.dropdownOptionTextSelected
                            ]}>
                              {group.name}
                            </Text>
                            {selectedGroupId === String(group.id) && (
                              <MaterialIcons name="check" size={18} color="#4E54C8" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {groups[modalSubjectId]?.length === 0 && (
                    <Text style={styles.emptyText}>
                      No groups available. Please create a group first.
                    </Text>
                  )}
                </>
              )}
              
              {modalType.includes("resource") && (
                <>
                  <Text style={styles.label}>Resource Type:</Text>
                  
                  <TouchableOpacity 
                    onPress={showResourceTypePicker}
                    style={styles.resourceTypeButton}
                  >
                    <Text style={styles.resourceTypeButtonText}>
                      {modalResType.toUpperCase()}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#4E54C8" />
                  </TouchableOpacity>
                  
                  {Platform.OS === 'android' && showPicker && (
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={modalResType}
                        onValueChange={(itemValue) => {
                          setModalResType(itemValue);
                          setShowPicker(false);
                        }}
                        style={styles.picker}
                      >
                        <Picker.Item label="PDF" value="pdf" />
                        <Picker.Item label="Video" value="video" />
                        <Picker.Item label="Word Document" value="document" />
                        <Picker.Item label="Excel Spreadsheet" value="spreadsheet" />
                        <Picker.Item label="PowerPoint" value="presentation" />
                        <Picker.Item label="Image" value="image" />
                        <Picker.Item label="Audio" value="audio" />
                        <Picker.Item label="Text" value="text" />
                      </Picker>
                    </View>
                  )}

                  <Text style={styles.label}>Upload File:</Text>
                  <TouchableOpacity onPress={pickDocument} style={styles.fileButton}>
                    <MaterialIcons name="cloud-upload" size={20} color="#4E54C8" />
                    <Text style={styles.fileButtonText}>
                      {modalResFile ? "Change File" : "Select File"}
                    </Text>
                  </TouchableOpacity>

                  {modalResFile && (
                    <View style={styles.fileInfoContainer}>
                      <MaterialIcons name="attachment" size={16} color="#4E54C8" />
                      <Text style={styles.fileInfoText} numberOfLines={1}>
                        {modalResFile.name}
                      </Text>
                      <TouchableOpacity 
                        onPress={() => setModalResFile(null)}
                        style={styles.removeFileButton}
                      >
                        <MaterialIcons name="close" size={16} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                  )}

                  <Text style={styles.label}>Or provide URL:</Text>
                  <TextInput
                    placeholder="Resource URL (http:// or https://)"
                    value={modalResUrl}
                    onChangeText={setModalResUrl}
                    style={styles.input}
                    placeholderTextColor="#999"
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  onPress={handleModalSubmit}
                  style={[styles.modalButton, styles.submitButton]}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <MaterialIcons name="check" size={18} color="#fff" />
                      <Text style={styles.submitButtonText}>Submit</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={closeModal} 
                  style={[styles.modalButton, styles.cancelButton]}
                >
                  <MaterialIcons name="close" size={18} color="#64748B" />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
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
  content: {
    flex: 1,
  },

  // Admin Profile Styles
  adminProfileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  adminImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  adminImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#4E54C8',
  },
  adminInitialContainer: {
    backgroundColor: '#4E54C8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  adminInitialText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  adminStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4E54C8',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
  },

  // Section Styles
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#4E54C8",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 14,
  },

  // Subject Card Styles
  subjectCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  subjectGrade: {
    fontSize: 14,
    color: "#4E54C8",
    fontWeight: "600",
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  editButtonText: {
    color: "#4E54C8",
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },

  // Sub-section Styles
  subSection: {
    marginBottom: 24,
  },
  subSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B"
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#4E54C8",
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  // List Item Styles
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: "#F8FAFC",
    marginBottom: 8,
    borderRadius: 8,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemText: {
    flex: 1,
    color: '#334155',
    marginLeft: 8,
    fontSize: 14,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  resourceButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  smallDeleteButton: {
    backgroundColor: "#EF4444",
    padding: 6,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Resource Styles
  topicResources: {
    marginBottom: 16,
  },
  topicName: {
    fontWeight: '600',
    color: '#4E54C8',
    marginBottom: 8,
    fontSize: 14,
  },
  resourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: "#F0F9FF",
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4E54C8',
  },
  resourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resourceTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  resourceText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '500',
  },
  resourceSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  resourceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Assessment Styles
  assessmentItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: "#F0F8FF",
    marginBottom: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4E54C8',
  },
  assessmentMainInfo: {
    flex: 1,
    marginRight: 12,
  },
  assessmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assessmentTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
    flex: 1,
  },
  assessmentBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  assessmentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  approvedBadge: {
    backgroundColor: '#DCFCE7',
  },
  pendingBadge: {
    backgroundColor: '#FEF9C3',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  approvedText: {
    color: '#166534',
  },
  pendingText: {
    color: '#854D0E',
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    gap: 4,
  },
  groupBadgeText: {
    fontSize: 11,
    color: '#475569',
  },
  assessmentActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editMcqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editMcqButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  approveToggleButton: {
    padding: 7,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButtonStyle: {
    backgroundColor: '#3B82F6',
  },
  unapproveButton: {
    backgroundColor: '#F59E0B',
  },

  // Empty States
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  modalCard: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B"
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1E293B'
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  picker: {
    width: '100%'
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  fileButtonText: {
    color: "#4E54C8",
    fontWeight: '600',
    marginLeft: 8,
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 16,
  },
  fileInfoText: {
    marginLeft: 8,
    color: '#475569',
    flex: 1,
  },
  removeFileButton: {
    padding: 4,
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: '#4E54C8',
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    color: "#64748B",
    fontWeight: '600',
    marginLeft: 8,
  },
  resourceTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  resourceTypeButtonText: {
    color: '#4E54C8',
    fontWeight: '600',
  },

  // Dropdown Styles
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  dropdownTriggerText: {
    fontSize: 16,
    color: '#1E293B',
  },
  dropdownPlaceholder: {
    color: '#94A3B8',
  },
  dropdownOptions: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownOptionSelected: {
    backgroundColor: '#EEF2FF',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#334155',
    flex: 1,
  },
  dropdownOptionTextSelected: {
    color: '#4E54C8',
    fontWeight: '600',
  },
});