import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function FinalAssessmentsScreen() {
  const [role, setRole] = React.useState<string | null>(null);
  const router = useRouter();

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

  const handleEnroll = () => {
    if (role === "student") {
      // Navigate to SubjectBrowser for enrolled students
      router.push("/Dashboards/SubjectBrowser");
    } else {
      Alert.alert(
        "Access Restricted",
        "Only students can enroll in final assessments. Please sign in or register as a student."
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={require("../../../assets/images/Final.jpg")} style={styles.banner} />
      <Text style={styles.title}>Final Assessments</Text>

      <Text style={styles.description}>
        Final Assessments are designed to test your complete understanding of the syllabus.
        They mirror real exam-style questions and help learners build confidence before final exams.
        {"\n\n"}
        To access these assessments, you need to be enrolled as a student. You can manage your enrollment
        and view your progress on the Student Dashboard.
      </Text>

      <TouchableOpacity style={styles.enrollButton} onPress={handleEnroll}>
        <Text style={styles.enrollText}>Enroll to Access</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  banner: { width: "100%", height: 220, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#4E54C8", marginTop: 16, textAlign: "center" },
  description: { fontSize: 15, color: "#444", margin: 16, lineHeight: 22, textAlign: "center" },
  enrollButton: { backgroundColor: "#CC5500", marginHorizontal: 60, borderRadius: 30, paddingVertical: 12, marginTop: 16, marginBottom: 30 },
  enrollText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
});
