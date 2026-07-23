// app/(tabs)/profile.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons, Feather, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { getCurrentUser, User, handleApiError } from "./services/api";
import { goBack } from "expo-router/build/global-state/routing";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import * as SecureStore from "expo-secure-store";


type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface SupportItem {
  title: string;
  icon: FeatherIconName;
  onPress: () => void;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    studyReminders: true,
    autoPlayVideos: false,
  });

useFocusEffect(
  useCallback(() => {
    loadProfileData();
  }, [])
);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();

      // Load user avatar from AsyncStorage
      const avatarKey = `userAvatar_${userData.id}`;
      const savedAvatar = await AsyncStorage.getItem(avatarKey);
      if (savedAvatar) userData.avatar = savedAvatar;

      setUser(userData);
    } catch (error: any) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

 const handleLogout = async () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("user");
            await AsyncStorage.removeItem("token");

            await SecureStore.deleteItemAsync("authToken");
            await SecureStore.deleteItemAsync("authUser");
            await SecureStore.deleteItemAsync("biometricEnabled");

            router.replace("/login" as any);
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]
  );
};

  const handleSettingToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const navigateToEditProfile = () => {
  router.push("/edit-profile");
};

  // Avatar picker
  const pickImage = async () => {
    if (!user) return;

    Alert.alert("Change Profile Picture", "Choose an option", [
      {
        text: "Camera",
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled) saveAvatar(result.assets[0].uri);
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled) saveAvatar(result.assets[0].uri);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const saveAvatar = async (uri: string) => {
    if (!user) return;
    try {
      const avatarKey = `userAvatar_${user.id}`;
      await AsyncStorage.setItem(avatarKey, uri);
      setUser(prev => prev ? { ...prev, avatar: uri } : prev);
    } catch (error) {
      console.error("Failed to save avatar:", error);
    }
  };

  const supportItems: SupportItem[] = [
    { title: "Help & Support", icon: "help-circle", onPress: () => router.push("../screens/HelpSupport") },
    { title: "About uThando Lwemfundo", icon: "info", onPress: () => router.push("../screens/About") },
    { title: "Privacy Policy", icon: "shield", onPress: () => router.push("../screens/PrivacyPolicy") },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4E54C8" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#4E54C8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editButton} onPress={navigateToEditProfile}>
          <Feather name="edit-3" size={20} color="#4E54C8" />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <FontAwesome5 name="user-graduate" size={32} color="#4E54C8" />
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
            <Feather name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{user?.full_name || "Student"}</Text>
        <Text style={styles.userEmail}>{user?.email || "No email"}</Text>
        <Text style={styles.userRole}>{user?.role || "Student"}</Text>
      </View>

      

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.supportList}>
          {supportItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.supportItem} onPress={item.onPress}>
              <View style={styles.supportLeft}>
                <Feather name={item.icon} size={20} color="#666" />
                <Text style={styles.supportText}>{item.title}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.versionText}>uThando Lwemfundo v1.0.0</Text>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  centerContent: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#64748B" },

  backButton: {
  width: 40,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
},
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: "#fff" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#1E293B" },
  editButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },

  // Profile Card
  profileCard: { backgroundColor: "#fff", margin: 20, padding: 24, borderRadius: 20, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  avatarSection: { position: "relative", marginBottom: 16 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center", overflow: "hidden" },
  avatar: { width: "100%", height: "100%", borderRadius: 50 },
  avatarPlaceholder: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "#EEF2FF" },
  cameraButton: { position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: "#4E54C8", justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#fff" },
  userName: { fontSize: 24, fontWeight: "bold", color: "#1E293B", marginBottom: 4 },
  userEmail: { fontSize: 16, color: "#64748B", marginBottom: 4 },
  userRole: { fontSize: 14, color: "#4E54C8", fontWeight: "600", marginBottom: 24, backgroundColor: "#EEF2FF", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },

  // Sections
  section: { backgroundColor: "#fff", marginHorizontal: 20, marginBottom: 16, padding: 20, borderRadius: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1E293B", marginBottom: 16 },

  // Menu Grid
  menuGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  menuItem: { width: "48%", alignItems: "center", padding: 16, backgroundColor: "#F8FAFC", borderRadius: 12, marginBottom: 12 },
  menuItemShadow: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  menuIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  menuText: { fontSize: 14, fontWeight: "600", color: "#1E293B", textAlign: "center" },


  // Support
  supportList: { gap: 0 },
  supportItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  supportLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  supportText: { fontSize: 16, color: "#1E293B" },

  // Logout
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#FEF2F2", marginHorizontal: 20, marginBottom: 20, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#FECACA" },
  logoutText: { fontSize: 16, fontWeight: "600", color: "#EF4444" },

  // Footer
  footer: { alignItems: "center", paddingVertical: 20 },
  versionText: { fontSize: 12, color: "#94A3B8" },
});
