import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { loginUser, setAuthToken, api } from "./services/api";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import * as WebBrowser from "expo-web-browser";
import logo from "../assets/images/logo.png";

WebBrowser.maybeCompleteAuthSession();

const backendUrl = "https://eduapp-backend-1.onrender.com";

// SecureStore keys (sensitive data)
const SECURE_TOKEN_KEY = "authToken";
const SECURE_USER_KEY = "authUser";
const BIOMETRIC_ENABLED_KEY = "biometricEnabled";

const ROLES = [
  { label: "🎓 Student", value: "student" },
  { label: "📚 Teacher", value: "teacher" },
  { label: "👨‍👩‍👧 Parent", value: "parent" },
  { label: "⚙️ Admin", value: "admin" },
];

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Role picker for Google login
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  // ------------------------------
  // Role-based redirect
  // ------------------------------
const redirectByRole = (role?: string) => {
    try {
      router.dismissAll(); // clear any stacked screens/modals before switching roles
    } catch (e) {
      // dismissAll can throw if there's nothing to dismiss — safe to ignore
    }

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
  };

  // ------------------------------
  // Check Biometric Support + user opt-in preference
  // ------------------------------
  useEffect(() => {
    const checkBiometric = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricSupported(compatible && enrolled);

      const enabledPref = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      setBiometricEnabled(enabledPref === "true");
    };
    checkBiometric();
  }, []);

  // ------------------------------
  // Restore saved email (non-sensitive, AsyncStorage is fine here)
  // ------------------------------
  useEffect(() => {
    const restoreSavedEmail = async () => {
      const savedEmail = await AsyncStorage.getItem("savedEmail");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    };
    restoreSavedEmail();
  }, []);

  // ------------------------------
  // Ask user to opt in to biometric login (only asked once per device,
  // right after a successful manual login)
  // ------------------------------
  const maybeOfferBiometricOptIn = async () => {
    if (!biometricSupported) return;

    const alreadyAsked = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    if (alreadyAsked !== null) return; // user already made a choice previously

    Alert.alert(
      "Enable Fingerprint Login?",
      "You can use your fingerprint or face recognition to sign in faster next time.",
      [
        {
          text: "Not Now",
          style: "cancel",
          onPress: async () => {
            await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "false");
            setBiometricEnabled(false);
          },
        },
        {
          text: "Enable",
          onPress: async () => {
            await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "true");
            setBiometricEnabled(true);
          },
        },
      ]
    );
  };

  // ------------------------------
  // Handle normal login
  // ------------------------------
  const handleLogin = async () => {
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser(email, password);

      setAuthToken(data.token);

      // Sensitive data goes into SecureStore, not AsyncStorage
      await SecureStore.setItemAsync(SECURE_TOKEN_KEY, data.token);
      await SecureStore.setItemAsync(SECURE_USER_KEY, JSON.stringify(data.user));

      if (rememberMe) {
        await AsyncStorage.setItem("savedEmail", email);
      } else {
        await AsyncStorage.removeItem("savedEmail");
      }

      redirectByRole(data.user.role);

      // Offer biometric opt-in after a successful login, if not decided yet
      await maybeOfferBiometricOptIn();
    } catch (err: any) {
      const message = err.message || "Something went wrong.";

      if (
        message.toLowerCase().includes("google") ||
        message.toLowerCase().includes("facebook") ||
        message.toLowerCase().includes("please login using")
      ) {
        setErrorMessage(
          "This account was created with Google. Please tap 'Continue with Google' below."
        );
      } else if (message.toLowerCase().includes("network")) {
        setErrorMessage("Network error. Please try again.");
      } else {
        setErrorMessage(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Biometric Login
  // ------------------------------
const handleBiometricLogin = async () => {
  setErrorMessage("");

  try {
    const token = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
    const userStr = await SecureStore.getItemAsync(SECURE_USER_KEY);

    if (!token || !userStr) {
      setErrorMessage("No saved login found. Please sign in manually first.");
      return;
    }

    const savedUser = JSON.parse(userStr);

    // Guard: the saved biometric session must match the email typed in the form
    if (email.trim().toLowerCase() !== savedUser.email?.trim().toLowerCase()) {
      setErrorMessage("Fingerprint login is only available for the account you last signed in with. Please enter your password.");
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Login with Fingerprint",
      fallbackLabel: "Use password",
    });

    if (!result.success) {
      setErrorMessage("Authentication cancelled or failed. Please try again.");
      return;
    }

    setAuthToken(token);
    try {
      const response = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data;
      await SecureStore.setItemAsync(SECURE_USER_KEY, JSON.stringify(user));
      redirectByRole(user.role);
    } catch (verifyErr) {
      await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
      await SecureStore.deleteItemAsync(SECURE_USER_KEY);
      setAuthToken(undefined);
      setErrorMessage("Your session has expired. Please sign in with your password.");
    }
  } catch {
    setErrorMessage("Biometric login error. Please try again.");
  }
};

  // ------------------------------
  // Google OAuth
  // ------------------------------
  const handleGoogleLogin = async () => {
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${backendUrl}/api/auth/google`,
        "eduapp://redirect"
      );

      if (result.type === "success") {
        const url = result.url;
        const token = url.split("token=")[1];

        if (token) {
          await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
          setAuthToken(token);

          // Fetch user info from backend
          const response = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const user = response.data;
          await SecureStore.setItemAsync(SECURE_USER_KEY, JSON.stringify(user));

          // Only show role picker if role is not set in the DATABASE
          // Once set, user.role will always have a value on next login
          if (!user.role) {
            setShowRolePicker(true);
          } else {
            redirectByRole(user.role);
            await maybeOfferBiometricOptIn();
          }
        }
      }
    } catch (err) {
      setErrorMessage("Google login failed. Please try again.");
    }
  };

  // ------------------------------
  // Handle role selection after Google login
  // ------------------------------
  const handleRoleSelect = async () => {
    if (!selectedRole) return;

    setRoleLoading(true);
    try {
      const token = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);

      await api.post(
        "/auth/set-role",
        { role: selectedRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update stored user with new role
      const userStr = await SecureStore.getItemAsync(SECURE_USER_KEY);
      if (userStr) {
        const user = JSON.parse(userStr);
        user.role = selectedRole;
        await SecureStore.setItemAsync(SECURE_USER_KEY, JSON.stringify(user));
      }

      setShowRolePicker(false);
      redirectByRole(selectedRole);
      await maybeOfferBiometricOptIn();
    } catch (err) {
      setErrorMessage("Failed to set role. Please try again.");
    } finally {
      setRoleLoading(false);
    }
  };

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
     <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={logo} style={styles.logo} />

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your journey</Text>

        {/* Email */}
        <View style={styles.inputWrapper}>
          <MaterialIcons name="email" size={18} color="rgba(255,255,255,0.8)" />
          <TextInput
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>

        {/* Password */}
    <View style={styles.inputWrapper}>
          <Feather name="lock" size={18} color="rgba(255,255,255,0.8)" />
          <TextInput
            ref={passwordRef}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <Feather
            name={showPassword ? "eye-off" : "eye"}
            size={18}
            color="rgba(255,255,255,0.8)"
            onPress={() => setShowPassword(!showPassword)}
          />
        </View>

        {/* Error */}
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {/* Remember Me */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: "#999", true: "#ff7b2c" }}
            thumbColor="white"
          />
          <Text style={{ color: "white", marginLeft: 8, fontSize: 14 }}>
            Remember Me
          </Text>
        </View>

        {/* Biometric — only shown if supported AND the user opted in */}
        {biometricSupported && biometricEnabled && (
          <TouchableOpacity
            onPress={handleBiometricLogin}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
          >
            <MaterialIcons
              name="fingerprint"
              size={22}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: "white", fontSize: 14 }}>
              Sign in with Fingerprint
            </Text>
          </TouchableOpacity>
        )}

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          <LinearGradient
            colors={["#ff9346", "#ff7b2c"]}
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Login */}
        <TouchableOpacity onPress={handleGoogleLogin} style={styles.googleButton}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/300/300221.png" }}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Register */}
        <TouchableOpacity
          onPress={() => router.push("/register")}
          style={styles.registerContainer}
        >
          <Text style={styles.registerText}>
            Don&apos;t have an account?{" "}
            <Text style={styles.registerLink}>Register</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Role Picker Modal */}
      <Modal visible={showRolePicker} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Welcome! 👋</Text>
            <Text style={styles.modalSubtitle}>
              Please select your role to continue
            </Text>

            {ROLES.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.roleOption,
                  selectedRole === item.value && styles.roleOptionSelected,
                ]}
                onPress={() => setSelectedRole(item.value)}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    selectedRole === item.value && styles.roleOptionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
                {selectedRole === item.value && (
                  <MaterialIcons name="check-circle" size={20} color="#ff9346" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedRole && styles.confirmButtonDisabled,
              ]}
              onPress={handleRoleSelect}
              disabled={!selectedRole || roleLoading}
            >
              {roleLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.confirmButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ------------------------------
// Styles
// ------------------------------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(49, 36, 36, 0.15)",
  },
  input: { flex: 1, padding: 12, color: "white", fontSize: 14 },
  loginButton: {
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonGradient: { padding: 14, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "600", fontSize: 14 },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.7)",
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  googleIcon: { width: 18, height: 18, marginRight: 10 },
  googleButtonText: { color: "#333", fontSize: 14, fontWeight: "600" },
  registerContainer: { alignItems: "center" },
  registerText: { color: "rgba(255,255,255,0.9)", fontSize: 14 },
  registerLink: { color: "#ff9346", fontWeight: "600" },
  errorText: { color: "#ff4444", fontSize: 12, marginBottom: 8 },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  roleOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  roleOptionSelected: {
    borderColor: "#ff9346",
    backgroundColor: "#fff5ee",
  },
  roleOptionText: {
    fontSize: 16,
    color: "#334155",
  },
  roleOptionTextSelected: {
    color: "#ff9346",
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#ff9346",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});