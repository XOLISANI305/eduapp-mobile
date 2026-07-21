//PremiumGuard.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSubscription } from "../context/SubscriptionContext";

interface PremiumGuardProps {
  children: React.ReactNode;
  feature:
    | "downloads"
    | "videos"
    | "quizzes"
    | "subjects"
    | "ai";
}

export default function PremiumGuard({
  children,
  feature,
}: PremiumGuardProps) {

  const { subscription, loading } = useSubscription();

  if (loading) {
    return null;
  }

  // No subscription loaded
  if (!subscription) {
    return children;
  }

  let allowed = false;

  switch (feature) {

    case "downloads":
      allowed = subscription.downloads_enabled;
      break;

    case "videos":
      allowed = subscription.video_limit === null;
      break;

    case "quizzes":
      allowed = subscription.quiz_limit === null;
      break;

    case "subjects":
      allowed = subscription.subject_limit === null;
      break;

    case "ai":
      allowed = subscription.name === "Pro";
      break;

    default:
      allowed = false;
  }

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>

      <Ionicons
        name="lock-closed"
        size={60}
        color="#6C63FF"
      />

      <Text style={styles.title}>
        Premium Feature
      </Text>

      <Text style={styles.description}>
        Upgrade your uThando Lwemfundo subscription
        to unlock this feature.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("./subscription")}
      >

        <Text style={styles.buttonText}>
          View Plans
        </Text>

      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    margin: 20,
    elevation: 5,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 15,
  },

  description: {
    textAlign: "center",
    marginTop: 10,
    color: "#666",
    lineHeight: 22,
  },

  button: {
    marginTop: 25,
    backgroundColor: "#6C63FF",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

});