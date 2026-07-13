import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { MaterialIcons, Feather } from "@expo/vector-icons";

const provinces = [
  {
    name: "KwaZulu-Natal",
    schools: [
      { name: "Durban High School", address: "255 St Thomas Rd, Musgrave, Durban", rating: "4.8" },
      { name: "Glenwood High School", address: "10 Glenwood Rd, Durban", rating: "4.7" },
      { name: "Westville Boys High", address: "Westville, Durban", rating: "4.7" },
      { name: "Northwood School", address: "Durban North", rating: "4.6" },
      { name: "Maritzburg College", address: "Pietermaritzburg", rating: "4.8" },
      { name: "Hilton College", address: "Hilton", rating: "4.9" },
      { name: "Michaelhouse", address: "Balgowan Midlands", rating: "4.8" },
      { name: "St Charles College", address: "Pietermaritzburg", rating: "4.7" },
      { name: "Kearsney College", address: "Botha's Hill", rating: "4.8" },
      { name: "Pinetown Boys High", address: "Pinetown", rating: "4.6" },
    ],
  },
  {
    name: "Gauteng",
    schools: [
      { name: "St Stithians College", address: "Sandton, Johannesburg", rating: "4.9" },
      { name: "King Edward VII School", address: "Houghton, Johannesburg", rating: "4.8" },
      { name: "Parktown Boys High", address: "Parktown, Johannesburg", rating: "4.7" },
      { name: "Roedean School", address: "Parktown, Johannesburg", rating: "4.8" },
      { name: "Pretoria Boys High", address: "Brooklyn, Pretoria", rating: "4.8" },
      { name: "Pretoria High School for Girls", address: "Hatfield, Pretoria", rating: "4.7" },
      { name: "Afrikaanse Hoër Seunskool", address: "Pretoria", rating: "4.6" },
      { name: "Hoërskool Menlopark", address: "Menlo Park, Pretoria", rating: "4.7" },
      { name: "St Mary's School Waverley", address: "Johannesburg", rating: "4.8" },
      { name: "Redhill School", address: "Sandton", rating: "4.7" },
    ],
  },
  {
    name: "Western Cape",
    schools: [
      { name: "Rondebosch Boys High", address: "Rondebosch, Cape Town", rating: "4.8" },
      { name: "Bishops Diocesan College", address: "Rondebosch, Cape Town", rating: "4.9" },
      { name: "Rustenburg Girls High", address: "Rondebosch, Cape Town", rating: "4.7" },
      { name: "Wynberg Boys High", address: "Wynberg, Cape Town", rating: "4.8" },
      { name: "Westerford High School", address: "Newlands, Cape Town", rating: "4.7" },
      { name: "SACS High School", address: "Newlands, Cape Town", rating: "4.7" },
      { name: "Paul Roos Gymnasium", address: "Stellenbosch", rating: "4.8" },
      { name: "Parel Vallei High", address: "Somerset West", rating: "4.7" },
      { name: "Stellenberg High School", address: "Durbanville", rating: "4.6" },
      { name: "Fairmont High School", address: "Durbanville", rating: "4.6" },
    ],
  },
  {
    name: "Eastern Cape",
    schools: [
      { name: "Grey High School", address: "Gqeberha", rating: "4.8" },
      { name: "Victoria Park High", address: "Gqeberha", rating: "4.7" },
      { name: "Selborne College", address: "East London", rating: "4.8" },
      { name: "Clarendon Girls High", address: "East London", rating: "4.7" },
      { name: "St Andrew's College", address: "Makhanda", rating: "4.8" },
      { name: "Kingswood College", address: "Makhanda", rating: "4.7" },
      { name: "Queen's College", address: "Komani", rating: "4.6" },
      { name: "Hudson Park High", address: "East London", rating: "4.6" },
      { name: "Cambridge High School", address: "East London", rating: "4.6" },
      { name: "Alexander Road High", address: "Gqeberha", rating: "4.5" },
    ],
  },
  {
    name: "Free State",
    schools: [
      { name: "Grey College", address: "Bloemfontein", rating: "4.9" },
      { name: "Eunice High School", address: "Bloemfontein", rating: "4.8" },
      { name: "St Andrew's School", address: "Bloemfontein", rating: "4.7" },
      { name: "Hoërskool Sentraal", address: "Bloemfontein", rating: "4.6" },
      { name: "Jim Fouche High", address: "Bloemfontein", rating: "4.6" },
      { name: "Welkom Gymnasium", address: "Welkom", rating: "4.5" },
      { name: "Trio High School", address: "Kroonstad", rating: "4.5" },
      { name: "Hoërskool Fichardtpark", address: "Bloemfontein", rating: "4.6" },
      { name: "Voortrekker High", address: "Bethlehem", rating: "4.5" },
      { name: "Harrismith High", address: "Harrismith", rating: "4.5" },
    ],
  },
  {
    name: "Limpopo",
    schools: [
      { name: "Pietersburg High", address: "Polokwane", rating: "4.6" },
      { name: "Capricorn High", address: "Polokwane", rating: "4.6" },
      { name: "Merensky High", address: "Tzaneen", rating: "4.5" },
      { name: "Ben Vorster High", address: "Tzaneen", rating: "4.5" },
      { name: "Hoërskool Piet Potgieter", address: "Mokopane", rating: "4.5" },
      { name: "Nico Malan High", address: "Polokwane", rating: "4.4" },
      { name: "Mopani High", address: "Phalaborwa", rating: "4.4" },
      { name: "Letaba High", address: "Tzaneen", rating: "4.4" },
      { name: "Mbilwi Secondary School", address: "Thohoyandou", rating: "4.6" },
      { name: "Makhado High School", address: "Louis Trichardt", rating: "4.4" },
    ],
  },
  {
    name: "Mpumalanga",
    schools: [
      { name: "Hoërskool Nelspruit", address: "Mbombela", rating: "4.6" },
      { name: "Penryn College", address: "White River", rating: "4.7" },
      { name: "Curro Nelspruit", address: "Mbombela", rating: "4.6" },
      { name: "Rob Ferreira High", address: "White River", rating: "4.6" },
      { name: "Ermelo High School", address: "Ermelo", rating: "4.5" },
      { name: "Middelburg High", address: "Middelburg", rating: "4.5" },
      { name: "Lydenburg High", address: "Lydenburg", rating: "4.4" },
      { name: "Secunda High", address: "Secunda", rating: "4.4" },
      { name: "Standerton High", address: "Standerton", rating: "4.4" },
      { name: "Barberton High", address: "Barberton", rating: "4.3" },
    ],
  },
  {
    name: "Northern Cape",
    schools: [
      { name: "Diamantveld High", address: "Kimberley", rating: "4.5" },
      { name: "Kimberley Boys High", address: "Kimberley", rating: "4.5" },
      { name: "Kimberley Girls High", address: "Kimberley", rating: "4.5" },
      { name: "Northern Cape High", address: "Kimberley", rating: "4.4" },
      { name: "Upington High", address: "Upington", rating: "4.4" },
      { name: "De Aar High", address: "De Aar", rating: "4.3" },
      { name: "Postmasburg High", address: "Postmasburg", rating: "4.3" },
      { name: "Kuruman High", address: "Kuruman", rating: "4.3" },
      { name: "Douglas High", address: "Douglas", rating: "4.2" },
      { name: "Colesberg High", address: "Colesberg", rating: "4.2" },
    ],
  },
  {
    name: "North West",
    schools: [
      { name: "Potchefstroom Gimnasium", address: "Potchefstroom", rating: "4.7" },
      { name: "Potchefstroom Boys High", address: "Potchefstroom", rating: "4.6" },
      { name: "Rustenburg High School", address: "Rustenburg", rating: "4.5" },
      { name: "Hoërskool Bergsig", address: "Rustenburg", rating: "4.5" },
      { name: "Lichtenburg High", address: "Lichtenburg", rating: "4.4" },
      { name: "Klerksdorp High", address: "Klerksdorp", rating: "4.4" },
      { name: "Wolmaransstad High", address: "Wolmaransstad", rating: "4.3" },
      { name: "Vryburg High", address: "Vryburg", rating: "4.3" },
      { name: "Mahikeng High", address: "Mahikeng", rating: "4.3" },
      { name: "Brits High", address: "Brits", rating: "4.2" },
    ],
  },
];

// Distinct accent per province so chips + avatars aren't monotone, while
// staying inside the app's existing purple/indigo family.
const PROVINCE_COLORS: Record<string, string> = {
  "KwaZulu-Natal": "#4E54C8",
  "Gauteng": "#6D5DD3",
  "Western Cape": "#3E8FB0",
  "Eastern Cape": "#C77DFF",
  "Free State": "#4FA688",
  "Limpopo": "#E0A458",
  "Mpumalanga": "#D46A6A",
  "Northern Cape": "#8D6E63",
  "North West": "#5C8A8A",
};

function initials(name: string) {
  return name
    .replace(/[^A-Za-z\s]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function SchoolsInfoScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [activeProvince, setActiveProvince] = useState(provinces[0].name);
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});

  const filteredProvinces = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return provinces;

    return provinces
      .map((province) => ({
        ...province,
        schools: province.schools.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.address.toLowerCase().includes(q) ||
            province.name.toLowerCase().includes(q)
        ),
      }))
      .filter((province) => province.schools.length > 0);
  }, [searchText]);

  const totalResults = filteredProvinces.reduce(
    (sum, p) => sum + p.schools.length,
    0
  );

  const handleChipPress = (name: string) => {
    setActiveProvince(name);
    const y = sectionOffsets.current[name];
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: y - 12, animated: true });
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Browse Schools</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search schools, towns or provinces..."
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Feather name="x-circle" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          )}
        </View>

        {/* Province chips */}
        {!searchText && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
            contentContainerStyle={styles.chipRowContent}
          >
            {provinces.map((province) => {
              const color = PROVINCE_COLORS[province.name] || "#4E54C8";
              const active = province.name === activeProvince;
              return (
                <TouchableOpacity
                  key={province.name}
                  onPress={() => handleChipPress(province.name)}
                  style={[
                    styles.chip,
                    { borderColor: color },
                    active && { backgroundColor: color },
                  ]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive, !active && { color }]}>
                    {province.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {searchText.length > 0 && (
          <Text style={styles.resultsCount}>
            {totalResults} {totalResults === 1 ? "school" : "schools"} found
          </Text>
        )}

        <ScrollView ref={scrollRef} style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredProvinces.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={56} color="#CBD5E1" />
              <Text style={styles.emptyText}>No schools match your search</Text>
              <Text style={styles.emptySubtext}>Try a different name, town or province</Text>
            </View>
          ) : (
            filteredProvinces.map((province) => {
              const color = PROVINCE_COLORS[province.name] || "#4E54C8";
              return (
                <View
                  key={province.name}
                  style={styles.provinceSection}
                  onLayout={(e) => {
                    sectionOffsets.current[province.name] = e.nativeEvent.layout.y;
                  }}
                >
                  <View style={styles.provinceHeaderRow}>
                    <View style={[styles.provinceDot, { backgroundColor: color }]} />
                    <Text style={styles.provinceTitle}>{province.name}</Text>
                    <Text style={styles.provinceCount}>{province.schools.length}</Text>
                  </View>

                  {province.schools.map((school, i) => (
                    <TouchableOpacity key={i} style={styles.schoolCard} activeOpacity={0.7}>
                      <View style={[styles.avatar, { backgroundColor: `${color}1A` }]}>
                        <Text style={[styles.avatarText, { color }]}>
                          {initials(school.name)}
                        </Text>
                      </View>

                      <View style={styles.schoolInfo}>
                        <Text style={styles.schoolName} numberOfLines={1}>
                          {school.name}
                        </Text>
                        <View style={styles.addressRow}>
                          <Feather name="map-pin" size={12} color="#94A3B8" />
                          <Text style={styles.schoolAddress} numberOfLines={1}>
                            {school.address}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.ratingPill}>
                        <MaterialIcons name="star" size={13} color="#F5A623" />
                        <Text style={styles.ratingText}>{school.rating}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    backgroundColor: "#4E54C8",
    paddingTop: 60,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  placeholder: { width: 36 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: "#1E293B", padding: 0 },

  chipRow: { marginTop: 14, maxHeight: 44 },
  chipRowContent: { paddingHorizontal: 20, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#fff" },

  resultsCount: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 14,
    marginHorizontal: 20,
  },

  content: { flex: 1, marginTop: 12 },

  provinceSection: { paddingHorizontal: 20, marginBottom: 22 },
  provinceHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  provinceDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  provinceTitle: { fontSize: 17, fontWeight: "700", color: "#1E293B", flex: 1 },
  provinceCount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
  },

  schoolCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 14, fontWeight: "700" },

  schoolInfo: { flex: 1, marginRight: 8 },
  schoolName: { fontSize: 15, fontWeight: "700", color: "#1E293B", marginBottom: 3 },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  schoolAddress: { fontSize: 12, color: "#94A3B8", flexShrink: 1 },

  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7E6",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 3,
  },
  ratingText: { fontSize: 12, fontWeight: "700", color: "#B8860B" },

  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: "700", color: "#1E293B", marginTop: 14 },
  emptySubtext: { fontSize: 13, color: "#94A3B8", marginTop: 6 },
});