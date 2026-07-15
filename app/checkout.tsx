import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSubscription } from "./context/SubscriptionContext";

export default function CheckoutScreen() {
  const { paymentUrl } = useLocalSearchParams<{ paymentUrl: string }>();
  const router = useRouter();
  const { refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [handled, setHandled] = useState(false);

  const handleNavigationChange = (navState: WebViewNavigation) => {
    const { url } = navState;

    if (handled) return;

    if (url.includes("/payments/payfast/success")) {
      setHandled(true);
      refreshSubscription();
      Alert.alert(
        "Payment Successful",
        "Your subscription is now active!",
        [{ text: "OK", onPress: () => router.replace("/home") }]
      );
      return;
    }

    if (url.includes("/payments/payfast/cancel")) {
      setHandled(true);
      router.back();
      return;
    }
  };

  if (!paymentUrl) {
    return (
      <View style={styles.center}>
        <Text>No payment URL provided.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={28} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Checkout</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Connecting to PayFast...</Text>
        </View>
      )}

      <WebView
        source={{ uri: paymentUrl }}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeButton: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: "600", color: "#1a1a1a" },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  loadingText: { marginTop: 12, color: "#666" },
});