import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AssessmentsInfoScreen() {
  const router = useRouter();
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setRole(user.role);
      }
    };
    fetchUser();
  }, []);

  const handleStartQuickAssessment = () => {
    // Navigate to Mock Quiz screen
    router.push("/screens/info/MockQuiz"); 
  };

  const handleFinalAssessments = () => {
    if (role === "student") {
      router.push("/screens/info/FinalAssessmentsScreen");
    } else {
      Alert.alert(
        "Access Restricted",
        "You need to enroll as a student to access final assessments. Visit your Student Dashboard to enroll."
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={require("../../../assets/images/mock.jpg")} style={styles.banner} />
      <Text style={styles.title}>Assessments</Text>

      <Text style={styles.description}>
        Quick Assessments are short, fun tests that challenge your general knowledge with mixed questions.
        Anyone can take them to see how well they remember what they’ve learned!
        {"\n\n"}
        For Final Assessments, students must enroll to access structured, syllabus-based tests through the Student Dashboard.
      </Text>

      <TouchableOpacity style={styles.quickButton} onPress={handleStartQuickAssessment}>
        <Text style={styles.quickText}>Start Quick Assessment</Text>
      </TouchableOpacity>

  
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  banner: { width: "100%", height: 220, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#4E54C8", marginTop: 16, textAlign: "center" },
  description: { fontSize: 15, color: "#444", margin: 16, lineHeight: 22, textAlign: "center" },
  quickButton: { backgroundColor: "#4E54C8", marginHorizontal: 60, borderRadius: 30, paddingVertical: 12, marginTop: 10 },
  quickText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  finalButton: { backgroundColor: "#CC5500", marginHorizontal: 60, borderRadius: 30, paddingVertical: 12, marginTop: 16, marginBottom: 20 },
  finalText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
});
