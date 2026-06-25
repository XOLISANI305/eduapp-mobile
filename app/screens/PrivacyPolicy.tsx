// app/screens/PrivacyPolicy.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const sections = [
    {
      title: "1. Information We Collect",
      content: [
        "Personal Information: When you register, we collect your name, email address, grade level, and school information.",
        "Learning Data: We track your progress, completed lessons, quiz scores, and study patterns to personalize your learning experience.",
        "Device Information: We collect information about your device, including IP address, browser type, and operating system for security and optimization purposes.",
        "Communication Data: Messages sent through chat groups and interactions with teachers are stored to facilitate learning support.",
      ],
    },
    {
      title: "2. How We Use Your Information",
      content: [
        "Personalized Learning: To adapt content to your learning speed and style.",
        "Progress Tracking: To monitor your academic progress and provide detailed reports to you and your teachers.",
        "Communication: To facilitate interaction between students, peers, and educators through our platform.",
        "Service Improvement: To enhance our platform features and user experience.",
        "Security: To protect against unauthorized access and ensure platform safety.",
      ],
    },
    {
      title: "3. Information Sharing",
      content: [
        "Teachers & Educators: Your progress reports, assessment results, and learning analytics are shared with your assigned teachers.",
        "Parents/Guardians: If you're under 18, certain information may be shared with your parents or legal guardians.",
        "Service Providers: We may share data with trusted third-party services that help us operate our platform (e.g., hosting, analytics).",
        "We DO NOT sell your personal information to third parties for marketing purposes.",
      ],
    },
    {
      title: "4. Data Protection for Students",
      content: [
        "We comply with POPIA (Protection of Personal Information Act) and international standards for protecting student data.",
        "All student data is encrypted both in transit and at rest.",
        "Access to student information is strictly limited to authorized educators and administrators.",
        "We maintain age-appropriate privacy protections for learners under 18.",
        "Parents/guardians have the right to review and request deletion of their child's data.",
      ],
    },
    {
      title: "5. Your Rights",
      content: [
        "Access: You can request access to all personal data we hold about you.",
        "Correction: You may update or correct your personal information at any time.",
        "Deletion: You can request deletion of your account and associated data, subject to legal retention requirements.",
        "Data Portability: You can request a copy of your data in a commonly used format.",
        "Opt-Out: You can opt out of non-essential communications and notifications.",
      ],
    },
    {
      title: "6. Cookies and Tracking",
      content: [
        "We use cookies and similar technologies to:",
        "• Remember your login and preferences",
        "• Analyze platform usage and improve functionality",
        "• Provide personalized learning recommendations",
        "• Ensure security and prevent fraud",
        "You can control cookie preferences through your browser settings.",
      ],
    },
    {
      title: "7. Third-Party Links",
      content: [
        "Our platform may contain links to external educational resources.",
        "We are not responsible for the privacy practices of third-party websites.",
        "We encourage you to review the privacy policies of any external sites you visit.",
      ],
    },
    {
      title: "8. Data Retention",
      content: [
        "Active Accounts: We retain your data while your account is active.",
        "Academic Records: Progress data and assessment results may be retained for 5 years for educational record-keeping.",
        "Deleted Accounts: After account deletion, personal data is removed within 90 days, except where legal retention is required.",
      ],
    },
    {
      title: "9. Security Measures",
      content: [
        "We implement industry-standard security measures including:",
        "• Encryption of sensitive data",
        "• Regular security audits and updates",
        "• Secure authentication protocols",
        "• Staff training on data protection",
        "• Incident response procedures",
      ],
    },
    {
      title: "10. Changes to Privacy Policy",
      content: [
        "We may update this privacy policy periodically to reflect changes in our practices or legal requirements.",
        "Significant changes will be communicated via email or platform notification.",
        "Your continued use of uThando Lwemfundo after changes constitutes acceptance of the updated policy.",
      ],
    },
    {
      title: "11. Children's Privacy",
      content: [
        "We take special precautions to protect the privacy of users under 18.",
        "Parental consent is required for users under 13.",
        "We do not knowingly collect more information than necessary for educational purposes.",
        "Parents can request to review, update, or delete their child's information.",
      ],
    },
    {
      title: "12. International Data Transfers",
      content: [
        "Your data is primarily stored and processed in South Africa.",
        "If data is transferred internationally, we ensure adequate protection through standard contractual clauses or equivalent safeguards.",
      ],
    },
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Feather name="shield" size={48} color="#4E54C8" />
          <Text style={styles.introTitle}>Your Privacy Matters</Text>
          <Text style={styles.introText}>
            At uThando Lwemfundo, we are committed to protecting your privacy
            and ensuring the security of your personal information. This policy
            explains how we collect, use, and protect your data.
          </Text>
          <Text style={styles.lastUpdated}>
            Last Updated: October 15, 2024
          </Text>
        </View>

        {/* Policy Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.content.map((paragraph, pIndex) => (
                <Text key={pIndex} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}
            </View>
          </View>
        ))}

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <View style={styles.contactHeader}>
            <Feather name="mail" size={24} color="#4E54C8" />
            <Text style={styles.contactTitle}>Questions About Privacy?</Text>
          </View>
          <Text style={styles.contactText}>
            If you have any questions or concerns about this privacy policy or
            how we handle your data, please contact us:
          </Text>
          <View style={styles.contactDetails}>
            <View style={styles.contactItem}>
              <Feather name="mail" size={16} color="#64748B" />
              <Text style={styles.contactDetailText}>
                privacy@uthandolwemfundo.co.za
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Feather name="phone" size={16} color="#64748B" />
              <Text style={styles.contactDetailText}>
                +27 (0) 12 345 6789
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => router.push("../screens/HelpSupport")}
          >
            <Text style={styles.supportButtonText}>Contact Support</Text>
            <Feather name="arrow-right" size={20} color="#4E54C8" />
          </TouchableOpacity>
        </View>

        {/* Consent Section */}
        <View style={styles.consentSection}>
          <Feather name="check-circle" size={24} color="#10B981" />
          <Text style={styles.consentText}>
            By using uThando Lwemfundo, you acknowledge that you have read and
            understood this Privacy Policy and agree to its terms.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
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
  introSection: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 16,
    marginBottom: 12,
  },
  introText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  lastUpdated: {
    fontSize: 14,
    color: "#94A3B8",
    fontStyle: "italic",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
  },
  paragraph: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 24,
    marginBottom: 12,
  },
  contactSection: {
    backgroundColor: "#EEF2FF",
    margin: 20,
    marginTop: 8,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  contactText: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 24,
    marginBottom: 16,
  },
  contactDetails: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  contactDetailText: {
    fontSize: 15,
    color: "#64748B",
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4E54C8",
  },
  consentSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0FDF4",
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: 12,
  },
  consentText: {
    flex: 1,
    fontSize: 14,
    color: "#166534",
    lineHeight: 22,
  },
  footer: {
    padding: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#94A3B8",
  },
});