import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import universities1Img from "../../assets/images/Universities1.jpg";
import universities2Img from "../../assets/images/Universities2.jpg";
const categories = ["All", "Universities", "Bursaries", "Tips"];

const portalItems = [
  {
    category: "Universities",
    title: "Top Universities 🇿🇦",
    image: require("../../assets/images/Universities1.jpg"),
    content:
      "Top SA universities:\n\n• UCT\n• Wits\n• Stellenbosch\n• UP\n• UKZN\n\nThese universities offer strong programs in science, business, and engineering.",
  },
  {
    category: "Bursaries",
    title: "NSFAS Funding",
    image: require("../../assets/images/Universities2.jpg"),
    content:
      "NSFAS helps students pay for:\n\n• Tuition\n• Accommodation\n• Food\n\nApply early and make sure your documents are correct.",
  },
  {
    category: "Tips",
    title: "Study Smart 📚",
    image: require("../../assets/images/videos.jpg"),
    content:
      "Best study tips:\n\n• Study 2–3 hours daily\n• Use past papers\n• Avoid cramming\n• Teach others what you learn",
  },
  {
    category: "Bursaries",
    title: "Private Bursaries",
    image: require("../../assets/images/assessments1.jpg"),
    content:
      "Companies offer bursaries:\n\n• Sasol\n• Eskom\n• Standard Bank\n\nThey may require good marks + contract after graduation.",
  },
  {
    category: "Tips",
    title: "Exam Preparation 📝",
    image: require("../../assets/images/assessments2.jpg"),
    content:
      "Before exams:\n\n• Revise summaries\n• Sleep well\n• Practice questions\n• Stay calm and confident",
  },
];

export default function UThandoPortal() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems =
    activeCategory === "All"
      ? portalItems
      : portalItems.filter((item) => item.category === activeCategory);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>uThando Portal 🎓</Text>
      <Text style={styles.subtitle}>
        Explore your future, one step at a time
      </Text>

      {/* CATEGORY TABS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tab,
              activeCategory === cat && styles.activeTab,
            ]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text
              style={[
                styles.tabText,
                activeCategory === cat && styles.activeTabText,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* CARDS */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => setSelectedItem(item)}
          >
            <Image source={item.image} style={styles.cardImage} />

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.overlay}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={!!selectedItem} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image
              source={selectedItem?.image}
              style={styles.modalImage}
            />

            <Text style={styles.modalTitle}>
              {selectedItem?.title}
            </Text>

            <Text style={styles.modalText}>
              {selectedItem?.content}
            </Text>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedItem(null)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },

  // TABS
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#eee",
    borderRadius: 20,
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: "#667eea",
  },
  tabText: {
    color: "#333",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // CARDS
  card: {
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 15,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 15,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // MODAL
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalImage: {
    width: "100%",
    height: 150,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 15,
  },
  modalText: {
    fontSize: 14,
    color: "#444",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  closeBtn: {
    backgroundColor: "#667eea",
    margin: 15,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
  },
});