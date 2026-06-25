import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const tools = [
  {
    id: "1",
    title: "Subjects",
    icon: "book",
    iconType: "MaterialIcons",
    color: "#4F46E5",
    route: "/subjects",
  },
  {
    id: "2",
    title: "Video Lessons",
    icon: "play-circle",
    iconType: "FontAwesome5",
    color: "#E11D48",
    route: "/topics",
  },
  {
    id: "3",
    title: "Assessments",
    icon: "quiz",
    iconType: "MaterialIcons",
    color: "#F59E0B",
    route: "/assessments",
  },
  {
    id: "4",
    title: "Study Groups",
    icon: "chatbubbles",
    iconType: "Ionicons",
    color: "#10B981",
    route: "/chats",
  },
];

export default function LearningTools() {
  const router = useRouter();

  const renderIcon = (item: any) => {
    const size = 36;

    if (item.iconType === "MaterialIcons") {
      return <MaterialIcons name={item.icon} size={size} color={item.color} />;
    }

    if (item.iconType === "FontAwesome5") {
      return <FontAwesome5 name={item.icon} size={size} color={item.color} />;
    }

    if (item.iconType === "Ionicons") {
      return <Ionicons name={item.icon} size={size} color={item.color} />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Learning Tools</Text>

      <FlatList
        data={tools}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.iconCircle, { backgroundColor: item.color + "15" }]}>
              {renderIcon(item)}
            </View>

            <Text style={styles.text}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#0F172A",
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
  },

  iconCircle: {
    width: 65,
    height: 65,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  text: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "center",
  },
});