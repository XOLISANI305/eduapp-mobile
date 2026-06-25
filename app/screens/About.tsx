// app/screens/About.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export default function AboutScreen() {
  const router = useRouter();

  const features = [
    {
      icon: "video",
      title: "Interactive Video Lessons",
      description: "Learn challenging topics through easy-to-follow videos.",
      color: "#4E54C8",
    },
    {
      icon: "message-circle",
      title: "Subject-Specific Chat Groups",
      description: "Engage with peers and teachers for additional support.",
      color: "#4ECDC4",
    },
    {
      icon: "clipboard",
      title: "Compulsory Assessments",
      description:
        "Identify weaknesses and track progress with automated reports sent directly to teachers.",
      color: "#FFA726",
    },
  ];

  const visionPoints = [
    "Ensure every matric learner has access to quality support",
    "Revolutionize tutoring through technology and community",
    "Build confident, well-prepared students for the future",
  ];

  const missionPoints = [
    "Make learning simple, engaging, and widely available",
    "Deliver engaging online learning with tutoring, videos, and study groups",
    "Help teachers track student progress through automated assessments",
    "Create a collaborative space for students and educators",
    "Make quality education accessible anytime, anywhere",
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="school"
              size={64}
              color="#4E54C8"
            />
          </View>
          <Text style={styles.appName}>uThando Lwemfundo</Text>
          <Text style={styles.tagline}>Learning Revolution</Text>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who We Are</Text>
          <View style={styles.card}>
            <Text style={styles.aboutText}>
              uThando Lwemfundo is more than just an online school—it is a
              learning revolution. We combine expert educators and peer
              collaboration to provide a dynamic learning experience tailored to
              each student&apos;s needs.
            </Text>
            <Text style={styles.aboutText}>
              Our platform ensures that no learner is left behind, offering
              personalized learning tools that adapt to different learning
              speeds and styles.
            </Text>
          </View>
        </View>

        {/* Vision Section */}
        <View style={styles.section}>
          <View style={styles.visionHeader}>
            <Feather name="eye" size={24} color="#4E54C8" />
            <Text style={styles.sectionTitle}>Our Vision</Text>
          </View>
          <View style={styles.card}>
            {visionPoints.map((point, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.listText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <View style={styles.missionHeader}>
            <Feather name="target" size={24} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Our Mission</Text>
          </View>
          <View style={styles.card}>
            {missionPoints.map((point, index) => (
              <View key={index} style={styles.listItem}>
                <View style={[styles.bulletPoint, { backgroundColor: "#FF6B6B" }]} />
                <Text style={styles.listText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: feature.color + "20" },
                ]}
              >
                <Feather name={feature.icon as any} size={28} color={feature.color} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Commitment to Quality</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Learning Access</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>∞</Text>
            <Text style={styles.statLabel}>Growth Potential</Text>
          </View>
        </View>

        {/* Contact CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Have Questions?</Text>
          <Text style={styles.ctaText}>
            We&apos;d love to hear from you and help you succeed.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push("../screens/HelpSupport")}
          >
            <Text style={styles.ctaButtonText}>Contact Support</Text>
            <Feather name="arrow-right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>
            © 2024 uThando Lwemfundo. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  heroSection: {
    backgroundColor: "#fff",
    padding: 40,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#4E54C8",
    fontWeight: "600",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 12,
  },
  visionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  missionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aboutText: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 26,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4E54C8",
    marginTop: 8,
    marginRight: 12,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    color: "#64748B",
    lineHeight: 26,
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4E54C8",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  ctaSection: {
    backgroundColor: "#4E54C8",
    margin: 20,
    marginTop: 32,
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 16,
    color: "#EEF2FF",
    textAlign: "center",
    marginBottom: 24,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4E54C8",
  },
  footer: {
    padding: 32,
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: "#94A3B8",
  },
});