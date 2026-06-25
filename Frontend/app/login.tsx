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
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, setAuthToken } from "./services/api";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import * as WebBrowser from "expo-web-browser";
import logo from "../assets/images/logo.png";
import Constants from "expo-constants";

import { makeRedirectUri } from "expo-auth-session";

// Needed for AuthSession - only once, outside component
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  // ------------------------------
  // Role-based redirect
  // ------------------------------
  const redirectByRole = (role?: string) => {
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
        router.replace("/home"); // student
    }
  };

  // ------------------------------
  // Check Biometric Support
  // ------------------------------
  useEffect(() => {
    const checkBiometric = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricSupported(compatible && enrolled);
    };
    checkBiometric();
  }, []);

  // ------------------------------
  // Restore saved email only (no auto-login)
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
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      if (rememberMe) {
        await AsyncStorage.setItem("savedEmail", email);
      } else {
        await AsyncStorage.removeItem("savedEmail");
      }

      redirectByRole(data.user.role);
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status;
        const message =
          err.response.data?.message || err.response.statusText;

        if (
          status === 401 ||
          message.toLowerCase().includes("invalid") ||
          message.toLowerCase().includes("credentials")
        ) {
          setErrorMessage("Incorrect email or password.");
        } else {
          setErrorMessage(message || `Error ${status}`);
        }
      } else if (err.request) {
        setErrorMessage("Network error. Please try again.");
      } else {
        setErrorMessage(err.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Biometric Login
  // ------------------------------
  const handleBiometricLogin = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userStr = await AsyncStorage.getItem("user");

      if (!token || !userStr) {
        setErrorMessage("No saved login found. Please sign in manually first.");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login with Fingerprint",
        fallbackLabel: "Use password",
      });

      if (result.success) {
        setAuthToken(token);
        const user = JSON.parse(userStr);
        redirectByRole(user.role);
      } else {
        setErrorMessage("Authentication failed.");
      }
    } catch {
      setErrorMessage("Biometric login error.");
    }
  };

  // ------------------------------
  // Google OAuth
  // ------------------------------



const backendUrl = "https://eduapp-backend-1.onrender.com";

const handleGoogleLogin = async () => {
  const result = await WebBrowser.openAuthSessionAsync(
    `${backendUrl}/api/auth/google`,
    "eduapp://redirect"
  );

  if (result.type === "success") {
    const url = result.url;
    const token = url.split("token=")[1];

    if (token) {
      await AsyncStorage.setItem("token", token);
      router.replace("/home");
    }
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
      <View style={styles.container}>
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
          />
        </View>

        {/* Password */}
        <View style={styles.inputWrapper}>
          <Feather name="lock" size={18} color="rgba(255,255,255,0.8)" />
          <TextInput
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
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

        {/* Biometric */}
        {biometricSupported && (
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
      </View>
    </KeyboardAvoidingView>
  );
}

// ------------------------------
// Styles
// ------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#55f799e5" },
  logo: { width: 150, height: 150, marginBottom: 16, alignSelf: "center", resizeMode: "contain" },
  title: { fontSize: 22, fontWeight: "bold", color: "white", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)", textAlign: "center", marginBottom: 30 },
  inputWrapper: { flexDirection: "row", alignItems: "center", borderRadius: 10, marginBottom: 12, paddingHorizontal: 12, backgroundColor: "rgba(49, 36, 36, 0.15)" },
  input: { flex: 1, padding: 12, color: "white", fontSize: 14 },
  loginButton: { borderRadius: 10, overflow: "hidden", marginTop: 8, marginBottom: 20 },
  buttonDisabled: { opacity: 0.7 },
  buttonGradient: { padding: 14, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "600", fontSize: 14 },
  divider: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  dividerText: { color: "rgba(255,255,255,0.7)", paddingHorizontal: 12, fontSize: 12, fontWeight: "500" },
  googleButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 10, padding: 14, marginBottom: 20 },
  googleIcon: { width: 18, height: 18, marginRight: 10 },
  googleButtonText: { color: "#333", fontSize: 14, fontWeight: "600" },
  registerContainer: { alignItems: "center" },
  registerText: { color: "rgba(255,255,255,0.9)", fontSize: 14 },
  registerLink: { color: "#ff9346", fontWeight: "600" },
  errorText: { color: "#ff4444", fontSize: 12, marginBottom: 8 },
});