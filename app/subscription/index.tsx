import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getPlans, Plan } from "../services/subscription";
import { createPayFastPayment } from "../services/payment";
import { useSubscription } from "../context/SubscriptionContext";

const COLORS = ["#6B7280", "#6C63FF", "#F59E0B", "#10B981", "#EF4444"];

function buildFeatures(plan: Plan): string[] {
  const features: string[] = [];

  features.push(
    plan.subject_limit === null
      ? "Unlimited Subjects"
      : `${plan.subject_limit} Subjects`
  );

  features.push(
    plan.quiz_limit === null
      ? "Unlimited Quizzes"
      : `${plan.quiz_limit} Quizzes`
  );

  features.push(
    plan.video_limit === null
      ? "Unlimited Videos"
      : `${plan.video_limit} Videos`
  );

  if (plan.downloads_enabled) {
    features.push("Download Word/PDF");
  }

  if (plan.ai_tutor_enabled) {
    features.push("AI Tutor Access");
  }

  return features;
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const { subscription, refreshSubscription } = useSubscription();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState<number | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getPlans();
      setPlans(data);
    } catch (error) {
      Alert.alert("Error", "Could not load subscription plans.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: Plan) => {
    try {
      setSubscribingId(plan.id);

      const result = await createPayFastPayment(plan.id);

      router.push({
        pathname: "./checkout",
        params: { paymentUrl: result.payment_url },
      });

    } catch (error) {
      Alert.alert(
        "Error",
        "Could not start checkout. Please try again."
      );
    } finally {
      setSubscribingId(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="diamond" size={50} color="white" />
          <Text style={styles.title}>EduApp Premium</Text>
          <Text style={styles.subtitle}>
            Unlock your full learning experience
          </Text>
        </View>

        {plans.map((plan, index) => {
          const color = COLORS[index % COLORS.length];
          const isCurrentPlan = subscription?.plan_id === plan.id;
          const isFree = Number(plan.price) === 0;
          const isSubscribing = subscribingId === plan.id;

          return (
            <View key={plan.id} style={styles.card}>
              {plan.ai_tutor_enabled && (
                <View style={[styles.badge, { backgroundColor: color }]}>
                  <Text style={styles.badgeText}>BEST VALUE</Text>
                </View>
              )}

              <Text style={styles.planName}>{plan.name}</Text>

              <Text style={[styles.price, { color }]}>
                {isFree ? "R0" : `R${plan.price} / month`}
              </Text>

              <View style={{ marginTop: 15 }}>
                {buildFeatures(plan).map((feature, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#22C55E"
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                disabled={isCurrentPlan || isFree || isSubscribing}
                onPress={() => handleUpgrade(plan)}
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      isCurrentPlan || isFree ? "#D1D5DB" : color,
                  },
                ]}
              >
                {isSubscribing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isCurrentPlan
                      ? "Current Plan"
                      : isFree
                      ? "Free Plan"
                      : "Upgrade"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        <Text style={styles.footer}>
          Secure payments powered by PayFast.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FA" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#4F46E5",
    paddingVertical: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: { color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#E5E7EB", marginTop: 8, fontSize: 16 },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 18,
    marginTop: 22,
    borderRadius: 18,
    padding: 20,
    elevation: 4,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: { color: "white", fontWeight: "700", fontSize: 12 },
  planName: { fontSize: 24, fontWeight: "700" },
  price: { fontSize: 30, fontWeight: "800", marginTop: 10 },
  featureRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  featureText: { marginLeft: 10, fontSize: 15, color: "#374151" },
  button: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },
  footer: { textAlign: "center", marginVertical: 25, color: "#6B7280", fontSize: 13 },
});