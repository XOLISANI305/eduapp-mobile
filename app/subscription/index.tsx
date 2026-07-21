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

// Softer, more contemporary accent palette
const COLORS = ["#64748B", "#7C6FFF", "#F5A524", "#12B76A", "#F04438"];

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

    } catch (error: any) {
      console.error("Upgrade error:", error);
      console.error("Error response:", error?.response?.data);
      console.error("Error status:", error?.response?.status);

      Alert.alert(
        "Error",
        error?.response?.data?.message || error?.message || "Could not start checkout. Please try again."
      );
    } finally {
      setSubscribingId(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#7C6FFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <Ionicons name="diamond" size={34} color="#7C6FFF" />
          </View>
          <Text style={styles.title}>uThando Lwemfundo Premium</Text>
          <Text style={styles.subtitle}>
            Unlock your full learning experience
          </Text>
        </View>

        <View style={styles.cardsWrap}>
          {plans.map((plan, index) => {
            const color = COLORS[index % COLORS.length];
            const isCurrentPlan = subscription?.plan_id === plan.id;
            const isFree = Number(plan.price) === 0;
            const isSubscribing = subscribingId === plan.id;

            return (
              <View
                key={plan.id}
                style={[
                  styles.card,
                  plan.ai_tutor_enabled && styles.cardHighlighted,
                ]}
              >
                {plan.ai_tutor_enabled && (
                  <View style={styles.badge}>
                    <Ionicons name="sparkles" size={12} color="#fff" />
                    <Text style={styles.badgeText}>BEST VALUE</Text>
                  </View>
                )}

                <View style={styles.cardHeaderRow}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={[styles.colorDot, { backgroundColor: color }]} />
                </View>

                <View style={styles.priceRow}>
                  <Text style={[styles.price, { color: isFree ? "#111827" : color }]}>
                    {isFree ? "R0" : `R${plan.price}`}
                  </Text>
                  {!isFree && <Text style={styles.pricePeriod}>/ month</Text>}
                </View>

                <View style={styles.divider} />

                <View style={styles.featuresWrap}>
                  {buildFeatures(plan).map((feature, i) => (
                    <View key={i} style={styles.featureRow}>
                      <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={13} color="#12B76A" />
                      </View>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isCurrentPlan || isFree || isSubscribing}
                  onPress={() => handleUpgrade(plan)}
                  style={[
                    styles.button,
                    {
                      backgroundColor:
                        isCurrentPlan || isFree ? "#F1F2F6" : color,
                    },
                  ]}
                >
                  {isSubscribing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      style={[
                        styles.buttonText,
                        (isCurrentPlan || isFree) && styles.buttonTextMuted,
                      ]}
                    >
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
        </View>

        <View style={styles.footerRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#9CA3AF" />
          <Text style={styles.footer}>Secure payments powered by PayFast</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FC" },
  center: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 30 },

  header: {
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 28,
  },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#EFEDFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  subtitle: {
    color: "#6B7280",
    marginTop: 6,
    fontSize: 14,
  },

  cardsWrap: {
    paddingHorizontal: 18,
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: "#EEF0F5",
    shadowColor: "#1E1B4B",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardHighlighted: {
    borderColor: "#7C6FFF",
    borderWidth: 1.5,
    shadowOpacity: 0.1,
  },

  badge: {
    position: "absolute",
    top: -12,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#7C6FFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 11, letterSpacing: 0.4 },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planName: { fontSize: 19, fontWeight: "700", color: "#111827" },
  colorDot: { width: 10, height: 10, borderRadius: 5 },

  priceRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 12 },
  price: { fontSize: 32, fontWeight: "800" },
  pricePeriod: { fontSize: 14, color: "#9CA3AF", marginLeft: 4, marginBottom: 5 },

  divider: {
    height: 1,
    backgroundColor: "#F1F2F6",
    marginVertical: 16,
  },

  featuresWrap: { gap: 11 },
  featureRow: { flexDirection: "row", alignItems: "center" },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  featureText: { fontSize: 14.5, color: "#374151", fontWeight: "500" },

  button: {
    marginTop: 22,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15.5 },
  buttonTextMuted: { color: "#9CA3AF" },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 28,
  },
  footer: { color: "#9CA3AF", fontSize: 12.5 },
});