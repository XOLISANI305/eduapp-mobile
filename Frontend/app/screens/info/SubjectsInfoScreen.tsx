import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SubjectsInfoScreen() {
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

  const handleViewSubjects = () => {
    if (role === "student") {
      router.push("/Dashboards/SubjectBrowser");
    } else {
      Alert.alert(
        "Access Restricted",
        "Only registered students can enroll in subjects. Visit your Student Dashboard for more information."
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={require("../../../assets/images/subjects.jpg")} style={styles.banner} />
      <Text style={styles.title}>Explore Subjects</Text>

      <Text style={styles.description}>
        Our subjects are designed to help learners understand key concepts step by step.
        From Mathematics to Physical Sciences, each subject follows the South African CAPS
        curriculum and builds confidence through easy-to-follow lessons and quizzes.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleViewSubjects}>
        <Text style={styles.buttonText}>View All Subjects</Text>
      </TouchableOpacity>

      {role !== "student" && (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            ⚠ Only registered students can enroll in subjects.{"\n"}
            For more information, visit your Student Dashboard.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  banner: { width: "100%", height: 220, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0B0B44", marginTop: 16, textAlign: "center" },
  description: { fontSize: 15, color: "#444", margin: 16, lineHeight: 22, textAlign: "center" },
  button: { backgroundColor: "#CC5500", marginHorizontal: 60, borderRadius: 30, paddingVertical: 12, marginBottom: 20 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  noticeBox: { backgroundColor: "#F8F8F8", marginHorizontal: 20, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#EEE" },
  noticeText: { color: "#CC5500", textAlign: "center", fontSize: 14, lineHeight: 20 },
});
