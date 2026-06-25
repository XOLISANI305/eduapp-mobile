// app/screens/HelpSupport.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How do I enroll in a subject?",
      answer: "Go to the Explore tab, browse available subjects, and tap 'Enroll Now' on any subject card. You'll get instant access to all lessons and materials.",
    },
    {
      question: "Can I download videos for offline viewing?",
      answer: "Currently, videos require an internet connection. We're working on offline download features for future updates.",
    },
    {
      question: "How do assessments work?",
      answer: "Assessments are compulsory and help identify your strengths and weaknesses. Results are automatically sent to your teachers with detailed reports.",
    },
    {
      question: "How can I contact my teacher?",
      answer: "Use the subject-specific chat groups to engage with your teachers and peers. You can ask questions and get support in real-time.",
    },
    {
      question: "What if I'm struggling with a topic?",
      answer: "Review the interactive video lessons at your own pace, participate in chat groups, and reach out to teachers for additional help. Our platform adapts to your learning style.",
    },
    {
      question: "How do I track my progress?",
      answer: "Visit the 'My Progress' section in your profile to see detailed statistics, completed lessons, quiz scores, and improvement trends.",
    },
    {
      question: "Is there a cost to use uThando Lwemfundo?",
      answer: "We strive to make quality education accessible. Contact us for information about pricing and any available scholarships or free access programs.",
    },
    {
      question: "What subjects are available?",
      answer: "We offer comprehensive matric-level subjects including Mathematics, Physical Sciences, Life Sciences, Accounting, and more. New subjects are added regularly.",
    },
  ];

  const contactOptions = [
    {
      title: "Email Support",
      description: "support@uthandolwemfundo.co.za",
      icon: "mail" as const,
      action: () => Linking.openURL("mailto:support@uthandolwemfundo.co.za"),
    },
    {
      title: "WhatsApp",
      description: "Chat with us on WhatsApp",
      icon: "message-circle" as const,
      action: () => Linking.openURL("https://wa.me/27123456789"),
    },
    {
      title: "Call Us",
      description: "+27 (0) 12 345 6789",
      icon: "phone" as const,
      action: () => Linking.openURL("tel:+27123456789"),
    },
    {
      title: "Visit Website",
      description: "www.uthandolwemfundo.co.za",
      icon: "globe" as const,
      action: () => Linking.openURL("https://www.uthandolwemfundo.co.za"),
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <MaterialIcons name="support-agent" size={48} color="#4E54C8" />
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeText}>
            We&apos;re here to support your learning journey. Browse FAQs or contact
            us directly.
          </Text>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactCard}
                onPress={option.action}
              >
                <View style={styles.contactIcon}>
                  <Feather name={option.icon} size={24} color="#4E54C8" />
                </View>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactDescription}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(index)}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Feather
                    name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
                {expandedIndex === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => router.push("../screens/About")}
          >
            <Feather name="info" size={20} color="#4E54C8" />
            <Text style={styles.quickLinkText}>About uThando Lwemfundo</Text>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => router.push("../screens/PrivacyPolicy")}
          >
            <Feather name="shield" size={20} color="#4E54C8" />
            <Text style={styles.quickLinkText}>Privacy Policy</Text>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            We typically respond within 24 hours
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
  welcomeCard: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 16,
  },
  contactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  contactCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
    textAlign: "center",
  },
  contactDescription: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  faqList: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  faqAnswerText: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 24,
  },
  quickLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  quickLinkText: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    marginLeft: 12,
  },
  footer: {
    padding: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#94A3B8",
    fontStyle: "italic",
  },
});