import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { api, getErrorMessage } from "./services/api";
import logo from "../assets/images/logo.png";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(""); // empty by default
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const roles = [
    { label: "Student", value: "student" },
    { label: "Teacher", value: "teacher" },
    { label: "Parent", value: "parent" },
    { label: "Admin", value: "admin" },
  ];

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !role) {
      Alert.alert("Error", "Please fill all fields and select a role");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const payload = { full_name: name, email, password, role };
      await api.post("/auth/signup", payload);
      Alert.alert("Success", "Account created! Success! Please go to login.");
      router.replace("/login" as any);
    } catch (err) {
      Alert.alert("Registration Failed", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 20,
          backgroundColor: "#7dffb3e5",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={logo}
          style={{ width: 200, height: 200, marginBottom: 20, alignSelf: "center" }}
        />

        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "white",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Register
        </Text>

        <TextInput
          placeholder="First and Last Name"
          placeholderTextColor="#ffffffcc"
          value={name}
          onChangeText={setName}
          style={{
            borderWidth: 1,
            borderColor: "#ffffffcc",
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
            color: "white",
            backgroundColor: "#00000040",
          }}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#ffffffcc"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            borderWidth: 1,
            borderColor: "#ffffffcc",
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
            color: "white",
            backgroundColor: "#00000040",
          }}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#ffffffcc"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{
            borderWidth: 1,
            borderColor: "#ffffffcc",
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
            color: "white",
            backgroundColor: "#00000040",
          }}
        />

        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#ffffffcc"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={{
            borderWidth: 1,
            borderColor:
              confirmPassword.length > 0 && confirmPassword !== password
                ? "#ff4d4d"
                : "#ffffffcc",
            borderRadius: 10,
            padding: 12,
            marginBottom: 8,
            color: "white",
            backgroundColor: "#00000040",
          }}
        />

        {confirmPassword.length > 0 && confirmPassword !== password && (
          <Text style={{ color: "#ff4d4d", marginBottom: 12, fontSize: 13 }}>
            Passwords do not match
          </Text>
        )}

        {confirmPassword.length > 0 && confirmPassword === password && (
          <View style={{ marginBottom: 12 }} />
        )}

        {/* Modal-style Role Picker */}
        <Text style={{ color: "white", fontWeight: "600", marginBottom: 8 }}>
          Choose Your Role
        </Text>
        <TouchableOpacity
          onPress={() => setPickerVisible(true)}
          style={{
            borderWidth: 1,
            borderColor: "#ff9346",
            borderRadius: 10,
            padding: 12,
            backgroundColor: "#00000055",
            marginBottom: 20,
          }}
        >
          <Text style={{ color: role ? "white" : "#bbb" }}>
            {roles.find((r) => r.value === role)?.label || "-- Select your role --"}
          </Text>
        </TouchableOpacity>

        <Modal visible={pickerVisible} transparent animationType="slide">
          <View
            style={{
              flex: 1,
              backgroundColor: "#000000aa",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <View style={{ backgroundColor: "white", borderRadius: 10, padding: 20 }}>
              <FlatList
                data={roles}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setRole(item.value);
                      setPickerVisible(false);
                    }}
                    style={{ padding: 12 }}
                  >
                    <Text style={{ fontSize: 18 }}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                onPress={() => setPickerVisible(false)}
                style={{
                  marginTop: 10,
                  padding: 12,
                  alignItems: "center",
                  backgroundColor: "#ff9346",
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          onPress={handleRegister}
          style={{
            backgroundColor: "#ff9346",
            padding: 16,
            borderRadius: 10,
            alignItems: "center",
          }}
          disabled={loading}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            {loading ? "Registering..." : "Register"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/login" as any)}
          style={{ marginTop: 20, alignItems: "center" }}
        >
          <Text style={{ color: "#ffffff" }}>
            Already have an account? <Text style={{ color: "#ff9346" }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}