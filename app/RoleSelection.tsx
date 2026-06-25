import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { setAuthToken } from "./services/api";
import Constants from "expo-constants";
import logo from "../assets/images/logo.png";

const roles = [
  { label: "Student", value: "student" },
  { label: "Teacher", value: "teacher" },
  { label: "Parent", value: "parent" },
  { label: "Admin", value: "admin" },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);

  const backendUrl =
    Constants.expoConfig?.extra?.backendUrl || "http://192.168.0.2:5000";

  const handleConfirmRole = async () => {
    if (!role) {
      setError("Please select a role to continue.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${backendUrl}/api/auth/set-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to set role.");
        return;
      }

      // Save updated token and user
      setAuthToken(data.token);
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      switch (role) {
        case "admin":
          router.replace("/Dashboards/AdminDashboard");
          break;
        case "teacher":
          router.replace("/Dashboards/TeacherDashboard");
          break;
        case "parent":
          router.replace("/Dashboards/ParentDashboard");
          break;
        default:
          router.replace("/home");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />

      <Text style={styles.title}>Almost There!</Text>
      <Text style={styles.subtitle}>Select your role to complete setup</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Role Picker */}
      <Text style={styles.label}>Choose Your Role</Text>
      <TouchableOpacity
        onPress={() => setPickerVisible(true)}
        style={styles.pickerButton}
      >
        <Text style={{ color: role ? "white" : "#bbb" }}>
          {roles.find((r) => r.value === role)?.label || "-- Select your role --"}
        </Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={pickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={roles}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setRole(item.value);
                    setPickerVisible(false);
                  }}
                  style={styles.roleItem}
                >
                  <Text style={styles.roleItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setPickerVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirm Button */}
      <TouchableOpacity
        onPress={handleConfirmRole}
        style={[styles.confirmButton, loading && { opacity: 0.7 }]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.confirmText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#55f799e5",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 16,
    alignSelf: "center",
    resizeMode: "contain",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 40,
  },
  label: {
    color: "white",
    fontWeight: "600",
    marginBottom: 8,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#ff9346",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#00000055",
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  roleItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  roleItemText: {
    fontSize: 18,
  },
  cancelButton: {
    marginTop: 10,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#ff9346",
    borderRadius: 10,
  },
  cancelText: {
    color: "white",
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#ff9346",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  confirmText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  error: {
    color: "#ff4444",
    marginBottom: 16,
    textAlign: "center",
  },
});