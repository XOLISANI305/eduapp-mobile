// app/index.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
} from "react-native";
import { useRouter, Href, usePathname } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons, Feather, FontAwesome5 } from "@expo/vector-icons";
import {
  getSubjects,
  getStudentStats,
  getEnrolledSubjects,
  getCurrentUser,
  Subject,
  User,
  handleApiError,
} from "./services/api";
import { SafeAreaView } from "react-native";


import logo from "../assets/images/logo.png";
import videosImg from "../assets/images/videos.jpg";
import assessments1Img from "../assets/images/assessments1.jpg";
import assessments2Img from "../assets/images/assessments2.jpg";
import StStithiansCollege from "../assets/images/StStithiansCollege.jpg";
import RondeboschBoysHigh from "../assets/images/RondeboschBoysHigh.jpg";
import WynbergBoysHigh from "../assets/images/WynbergBoysHigh.jpg";
import DurbanHighSchool from "../assets/images/DurbanHighSchool.jpg";
import StudentPortalImg from "../assets/images/StudentPortal.jpg";



type RoutePath = "/subjects" | "/topics" | "/assessments" | "/chats";
type MaterialIconName = "book" | "play-circle-outline" | "quiz" | "chat";

// Define gradient types
type GradientColors = [string, string, ...string[]];

// Bottom Navigation Component
const BottomNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { 
      name: "Home", 
      icon: "home", 
      route: "/home" as Href,
      iconComponent: MaterialIcons
    },
    { 
      name: "Dashboard", 
      icon: "dashboard", 
      route: "/Dashboard" as Href,
      iconComponent: MaterialIcons
    },
    { 
      name: "Profile", 
      icon: "person", 
      route: "/profile" as Href,
      iconComponent: MaterialIcons
    },
    { 
      name: "Settings", 
      icon: "settings", 
      route: "/settings" as Href,
      iconComponent: MaterialIcons
    },
  ];

  const isActive = (route: Href) => {
    return pathname === route;
  };

  return (
    <View style={bottomNavStyles.container}>
      {navItems.map((item, index) => {
        const IconComponent = item.iconComponent;
        const active = isActive(item.route);
        
        return (
          <TouchableOpacity
            key={index}
            style={[
              bottomNavStyles.navItem,
              active && bottomNavStyles.navItemActive
            ]}
            onPress={() => router.push(item.route)}
          >
            <IconComponent
              name={item.icon as any}
              size={24}
              color={active ? "#667eea" : "#999"}
            />
            <Text
              style={[
                bottomNavStyles.navText,
                active && bottomNavStyles.navTextActive
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const bottomNavStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    color: "#999",
    fontWeight: "500",
  },
  navTextActive: {
    color: "#667eea",
    fontWeight: "600",
  },
});

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState<Subject[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState({
    videoLessons: 0,
    quizzes: 0,
    enrolledSubjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadHomeData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

const loadHomeData = async () => {
  try {
    setLoading(true);

    const [userData, allSubjects, enrollments] = await Promise.all([
      getCurrentUser(),
      getSubjects(),
      getEnrolledSubjects(),
    ]);

    //ROLE-BASED ACCESS
    if (userData.role !== "student") {
      router.replace("../Dashboard");
      return;
    }

    setUser(userData);
    setAllSubjects(allSubjects);
    setSubjects(allSubjects.slice(0, 4));
    setEnrolledSubjects(
      enrollments.map((e) => e.subject).filter(Boolean) as Subject[]
    );

    const studentStats = await getStudentStats();
    setStats({
      videoLessons: studentStats.total_resources || 150,
      quizzes: studentStats.total_assessments || 80,
      enrolledSubjects: enrollments.length || 0,
    });

  } catch (error: any) {
    Alert.alert("Error", handleApiError(error));
  } finally {
    setLoading(false);
  }
};

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const navigateToFeature = (path: Href, featureName: string) => {
    try {
      router.push(path as any);
    } catch (error) {
      Alert.alert("Navigation Error", `Could not open ${featureName}`);
    }
  };

 const handleSearch = async () => {
  if (searchQuery.trim() && filteredSubjects.length > 0) {
    router.push(`/subject-details/${filteredSubjects[0].id}`); 
    setSearchQuery("");
    setShowSearchResults(false);
  }
};

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim()) {
      const query = text.toLowerCase();
      const filtered = allSubjects.filter(subject => {
        const subjectName = subject.name.toLowerCase();
        return subjectName.includes(query) || 
               query.split(' ').some(word => word && subjectName.includes(word));
      });
      setFilteredSubjects(filtered);
      setShowSearchResults(true);
    } else {
      setFilteredSubjects([]);
      setShowSearchResults(false);
    }
  };

 const featuredSchools = [
  {
    name: "St Stithians College",
    province: "Gauteng",
    image: StStithiansCollege,
  },
  {
    name: "Rondebosch Boys High",
    province: "Western Cape",
    image: RondeboschBoysHigh,
  },
  {
    name: "Wynberg Boys High",
    province: "Western Cape",
    image: WynbergBoysHigh,
  },
  {
    name: "Durban High School",
    province: "KwaZulu-Natal",
    image: DurbanHighSchool,
  },
];

  // Define gradients with proper typing
  const headerGradient: GradientColors = ["#667eea", "#764ba2"];
  const profileGradient: GradientColors = ["#ffffff", "#f8f9fa"];
  const searchGradient: GradientColors = ["#667eea", "#764ba2"];
  const premiumGradient: GradientColors = ["rgba(149, 167, 245, 0.36)", "rgba(139, 108, 170, 0.29)"];
  const footerGradient: GradientColors = ["#f8f9fa", "#e9ecef"];

  const features: Array<{ 
    title: string; 
    path: RoutePath; 
    icon: MaterialIconName; 
    gradient: GradientColors 
  }> = [
    { title: "Subjects", path: "/subjects", icon: "book", gradient: ["#667eea", "#764ba2"] },
    { title: "Video Lessons", path: "/topics", icon: "play-circle-outline", gradient: ["#f093fb", "#f5576c"] },
    { title: "Assessments", path: "/assessments", icon: "quiz", gradient: ["#4facfe", "#00f2fe"] },
    { title: "Study Groups", path: "/chats", icon: "chat", gradient: ["#fa709a", "#fee140"] },
  ];

  const statGradients: GradientColors[] = [
    ["#667eea", "#764ba2"],
    ["#f093fb", "#f5576c"],
    ["#4facfe", "#00f2fe"]
  ];

  const upcomingFeatures: { title: string; icon: string; description: string }[] = [
    { title: "Study Guides", icon: "library-outline", description: "Comprehensive learning materials" },
    { title: "Smart Timetable", icon: "alarm-outline", description: "Personalized study schedules" },
    { title: "Live Sessions", icon: "videocam-outline", description: "Interactive webinars" },
    { title: "Premium Plans", icon: "card-outline", description: "Enhanced features" },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Preparing your learning journey...</Text>
      </View>
    );
  }

  
  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
         {/* Modern Header */}
        <LinearGradient colors={headerGradient} style={styles.header}>
          <View style={styles.headerTop}>
            {/* Brand / Logo */}
            <View style={styles.brandContainer}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
              <View>
                <Text style={styles.brandTitle}>uThando Lwemfundo</Text>
                <Text style={styles.brandTagline}>Learn Without Limits</Text>
              </View>
            </View>
          </View>

          {/* Welcome Message */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
            </Text>
            <Text style={styles.welcomeSubtext}>
              Ready to continue your learning journey?
            </Text>
          </View>

          {/* Role Dashboard */}
          {user?.role && (
            <TouchableOpacity
              style={styles.roleButton}
              onPress={() => router.push(`../Dashboard`)}
            >
              <View style={styles.roleButtonContent}>
                <Text style={styles.roleButtonText}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
                </Text>
                <Feather name="arrow-right" size={16} color="#667eea" />
              </View>
            </TouchableOpacity>
          )}

          {/* Smart Search */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Discover subjects, lessons, and more..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearchChange}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={() => {
                  setSearchQuery("");
                  setFilteredSubjects([]);
                  setShowSearchResults(false);
                }}
              >
                <Feather name="x" size={18} color="#999" />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <LinearGradient colors={searchGradient} style={styles.searchButtonGradient}>
                <Feather name="search" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Search Results Dropdown */}
          {showSearchResults && filteredSubjects.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.searchResultsTitle}>
                Found {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''}
              </Text>
              {filteredSubjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={styles.searchResultItem}
                  onPress={() => {
  router.push(`/subject-details/${subject.id}`); 
  setSearchQuery("");
  setShowSearchResults(false);
}}
                >
                
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName}>{subject.name}</Text>
                    <Text style={styles.searchResultGrade}>Grade {subject.grade}</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {showSearchResults && filteredSubjects.length === 0 && searchQuery.trim() && (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.noResultsText}>No subjects found for &quot;{searchQuery}&quot;</Text>
            </View>
          )}
        </LinearGradient>

        {/*Overview*/}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Your Learning Progress</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardElevated]}>
              <LinearGradient colors={statGradients[0]} style={styles.statIconContainer}>
                <MaterialIcons name="play-circle-outline" size={20} color="#fff" />
              </LinearGradient>
              <Text style={styles.statNumber}>{stats.videoLessons}+</Text>
              <Text style={styles.statLabel}>Video Lessons</Text>
            </View>
            <View style={[styles.statCard, styles.statCardElevated]}>
              <LinearGradient colors={statGradients[1]} style={styles.statIconContainer}>
                <MaterialIcons name="quiz" size={20} color="#fff" />
              </LinearGradient>
              <Text style={styles.statNumber}>{stats.quizzes}+</Text>
              <Text style={styles.statLabel}>Assessments</Text>
            </View>
            <View style={[styles.statCard, styles.statCardElevated]}>
              <LinearGradient colors={statGradients[2]} style={styles.statIconContainer}>
                <MaterialIcons name="school" size={20} color="#fff" />
              </LinearGradient>
              <Text style={styles.statNumber}>{stats.enrolledSubjects}</Text>
              <Text style={styles.statLabel}>Enrolled Subjects</Text>
            </View>
          </View>
        </View>

        {/* Quick Access Features */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Learning Tools</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push("./screens/LearningTools")}>
              <Text style={styles.seeAllText}>View All</Text>
              <Feather name="chevron-right" size={16} color="#667eea" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuresScroll}>
            {features.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigateToFeature(item.path as any, item.title)}
              >
                <LinearGradient colors={item.gradient} style={[styles.featureCard, styles.featureCardElevated]}>
                  <View style={styles.featureIconContainer}>
                    <MaterialIcons name={item.icon} size={24} color="#fff" />
                  </View>
                  <Text style={styles.featureText}>{item.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
{/* uThando Lwemfundo Premium */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>uThando Lwemfundo Premium</Text>

  <TouchableOpacity
    style={[styles.premiumCard, styles.premiumCardElevated]}
    onPress={() => router.push("./subscription")}
    activeOpacity={0.9}
  >
    <Image
      source={require("../assets/images/premium.jpg")}
      style={styles.premiumImage}
      resizeMode="cover"
    />

    <View style={styles.premiumOverlay}>
      <LinearGradient
        colors={["rgba(149, 167, 245, 0.36)", "rgba(139, 108, 170, 0.29)"]}
        style={styles.premiumGradient}
      >
        <View style={styles.premiumContent}>

          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>
              PREMIUM
            </Text>
          </View>

          <Text style={styles.premiumTitle}>
            Learn Without Limits
          </Text>

          <Text style={styles.premiumDescription}>
            Unlock unlimited subjects, downloads,
            quizzes and premium learning features.
          </Text>

          <TouchableOpacity
            style={styles.premiumButton}
            onPress={() => router.push("./subscription")}
          >
            <Text style={styles.premiumButtonText}>
              View Plans
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#fff"
            />

          </TouchableOpacity>

        </View>
      </LinearGradient>
    </View>
  </TouchableOpacity>
</View>
        {/* Featured Schools */}
<View style={styles.section}>
  
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>Featured Schools</Text>

    <TouchableOpacity
      style={styles.seeAllButton}
      onPress={() => router.push("/screens/info/SchoolsInfoScreen")}
    >
      <Text style={styles.seeAllText}>Browse by Province</Text>
      <Feather name="chevron-right" size={16} color="#667eea" />
    </TouchableOpacity>
  </View>

  <View style={styles.subjectsGrid}>
    
    {featuredSchools.map((school, index) => (
      
      <TouchableOpacity
        key={index}
        style={[styles.subjectCard, styles.subjectCardElevated]}
        onPress={() => router.push("/screens/info/SchoolsInfoScreen")}
      >

        <Image
          source={school.image}
          style={styles.subjectImage}
          resizeMode="cover"
        />

        <View style={styles.subjectOverlay}>
          
          <Text style={styles.subjectTitle}>
            {school.name}
          </Text>

          <Text style={styles.subjectGrade}>
            {school.province}
          </Text>

        </View>

      </TouchableOpacity>

    ))}

  </View>

</View>

        {/* Premium Content */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.premiumCard, styles.premiumCardElevated]}
            onPress={() => router.push("../topics")}
            activeOpacity={0.9}
          >
            <Image source={videosImg} style={styles.premiumImage} resizeMode="cover" />
            <View style={styles.premiumOverlay}>
              <LinearGradient colors={premiumGradient} style={styles.premiumGradient}>
                <View style={styles.premiumContent}>
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                  </View>
                  <Text style={styles.premiumTitle}>Expert Video Lessons</Text>
                  <Text style={styles.premiumDescription}>
                    Access high-quality content from top educators with interactive learning experiences
                  </Text>
                  <View style={styles.premiumButton}>
                    <Text style={styles.premiumButtonText}>Start Learning</Text>
                    <Feather name="play-circle" size={16} color="#fff" />
                  </View>
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>

        {/* Assessment Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Test Your Knowledge</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push("../assessments")}>
              <Text style={styles.seeAllText}>All Tests</Text>
              <Feather name="chevron-right" size={16} color="#667eea" />
            </TouchableOpacity>
          </View>
          <View style={styles.assessmentsGrid}>
            <TouchableOpacity style={[styles.assessmentCard, styles.assessmentCardElevated]} onPress={() => router.push("./screens/info/AssessmentsInfoScreen")}>
              <Image source={assessments1Img} style={styles.assessmentImage} resizeMode="cover" />
              <View style={styles.assessmentContent}>
                <Text style={styles.assessmentTitle}>Practice Quizzes</Text>
                <Text style={styles.assessmentDescription}>Build confidence with practice tests</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.assessmentCard, styles.assessmentCardElevated]} onPress={() => router.push("./screens/info/FinalAssessmentsScreen")}>
              <Image source={assessments2Img} style={styles.assessmentImage} resizeMode="cover" />
              <View style={styles.assessmentContent}>
                <Text style={styles.assessmentTitle}>Final Assessments</Text>
                <Text style={styles.assessmentDescription}>Test your comprehensive knowledge</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* uThando Portal Section */}
<View style={styles.section}>
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>uThando Portal</Text>
    <MaterialIcons name="menu-book" size={24} color="#667eea" />
  </View>

  <TouchableOpacity
    style={[styles.universityCard, styles.universityCardElevated]}
    onPress={() => router.push("./screens/UthandoPortalScreen")}
    activeOpacity={0.9}
  >
    <Image
      source={require("../assets/images/StudentPortal.jpg")}
      style={styles.universityImage}
      resizeMode="cover"
    />

    <LinearGradient
      colors={["transparent", "rgba(0,0,0,0.8)"]}
      style={styles.universityOverlay}
    >
      <Text style={styles.universityName}>
        Explore Universities, Bursaries & Study Tips
      </Text>
    </LinearGradient>
  </TouchableOpacity>
</View>

        {/* Coming Soon Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exciting Features Coming Soon</Text>
          <View style={styles.upcomingGrid}>
            {upcomingFeatures.map((item, index) => (
              <View key={index} style={[styles.upcomingCard, styles.upcomingCardElevated]}>
                <View style={styles.upcomingIconContainer}>
                  <Ionicons name={item.icon as any} size={24} color="#667eea" />
                </View>
                <Text style={styles.upcomingTitle}>{item.title}</Text>
                <Text style={styles.upcomingDescription}>{item.description}</Text>
                <View style={styles.comingSoonTag}>
                  <Text style={styles.comingSoonTagText}>COMING SOON</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Modern Footer */}
        <LinearGradient colors={footerGradient} style={styles.footer}>
          <Image source={logo} style={styles.footerLogo} resizeMode="contain" />
          <Text style={styles.footerMission}>
            &quot;Transforming education through innovative technology and personalized learning experiences.&quot;
          </Text>
          <Text style={styles.footerVision}>
            Empowering every learner to achieve their full potential
          </Text>
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>Terms</Text>
            <Text style={styles.footerLink}>Privacy</Text>
            <Text style={styles.footerLink}>Support</Text>
          </View>
        </LinearGradient>
      </Animated.ScrollView>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}

// ===== Modernized Styles =====
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFFFFF" 
  },
  scrollView: {
    flex: 1,
  },
  centerContent: { 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16, 
    color: "#64748B", 
    fontWeight: "500" 
  },

  // Header Styles
  header: { 
    paddingTop: 60, 
    paddingBottom: 30, 
    paddingHorizontal: 24, 
    borderBottomLeftRadius: 32, 
    borderBottomRightRadius: 32 
  },
  headerTop: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 20 
  },
  brandContainer: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  logo: { 
    width: 100, 
    height: 100, 
    marginRight: 12 
  },
  brandTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#FFFFFF", 
    letterSpacing: -0.5 
  },
  brandTagline: { 
    fontSize: 14, 
    color: "rgba(255,255,255,0.8)", 
    marginTop: 2 
  },
  profileButton: { 
    borderRadius: 16 
  },
  profileGradient: { 
    padding: 12, 
    borderRadius: 16, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8 
  },

  welcomeSection: { 
    marginBottom: 20 
  },
  welcomeText: { 
    fontSize: 20, 
    fontWeight: "600", 
    color: "#FFFFFF", 
    marginBottom: 4 
  },
  welcomeSubtext: { 
    fontSize: 14, 
    color: "rgba(255,255,255,0.8)" 
  },

  roleButton: { 
    marginBottom: 20, 
    borderRadius: 16, 
    backgroundColor: "#ffffff", 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8 
  },
  roleButtonContent: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: 16, 
    borderRadius: 16 
  },
  roleButtonText: { 
    color: "#667eea", 
    fontWeight: "600", 
    fontSize: 14 
  },

  searchContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "rgba(255,255,255,0.95)", 
    borderRadius: 16, 
    padding: 4 
  },
  searchIcon: { 
    marginLeft: 12 
  },
  searchInput: { 
    flex: 1, 
    paddingVertical: 12, 
    paddingHorizontal: 8, 
    color: "#1a1a1a", 
    fontSize: 16 
  },
  searchButton: { 
    borderRadius: 12 
  },
  searchButtonGradient: { 
    padding: 12, 
    borderRadius: 12 
  },
  clearButton: {
    padding: 8,
    marginRight: 4,
  },

  // Search Results Dropdown
  searchResultsContainer: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  searchResultsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#667eea",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    marginBottom: 8,
  },
  searchResultImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  searchResultGrade: {
    fontSize: 12,
    color: "#666",
  },
  noResultsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingVertical: 12,
  },

  // Stats Section - Fixed overlapping
  statsSection: { 
    paddingHorizontal: 24, 
    marginTop: 16, 
    marginBottom: 8 
  },
  statsTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#1a1a1a", 
    marginBottom: 16 
  },
  statsGrid: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  statCard: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 16, 
    marginHorizontal: 4, 
    borderRadius: 16, 
    alignItems: "center" 
  },
  statCardElevated: { 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 12, 
    elevation: 8 
  },
  statIconContainer: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 8 
  },
  statNumber: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#1a1a1a", 
    marginBottom: 2 
  },
  statLabel: { 
    fontSize: 12, 
    color: "#666", 
    fontWeight: "500" 
  },

  // Section Styles
  section: { 
    marginTop: 32, 
    paddingHorizontal: 24 
  },
  sectionHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 16 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#1a1a1a", 
    letterSpacing: -0.5 
  },
  seeAllButton: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  seeAllText: { 
    fontSize: 14, 
    color: "#667eea", 
    fontWeight: "600", 
    marginRight: 4 
  },

  // Features Scroll
  featuresScroll: { 
    marginHorizontal: -24, 
    paddingHorizontal: 24 
  },
  featureCard: { 
    width: 140, 
    height: 120, 
    padding: 16, 
    borderRadius: 20, 
    marginRight: 12, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  featureCardElevated: { 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 16, 
    elevation: 8 
  },
  featureIconContainer: { 
    marginBottom: 12 
  },
  featureText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 14, 
    textAlign: "center" 
  },

  // Subjects Grid
  subjectsGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between" 
  },
  subjectCard: { 
    width: "48%", 
    height: 120, 
    borderRadius: 16, 
    overflow: "hidden", 
    marginBottom: 16 
  },
  subjectCardElevated: { 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4 
  },
  subjectImage: { 
    width: "100%", 
    height: "100%" 
  },
  subjectOverlay: { 
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  subjectTitle: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 14, 
    marginBottom: 2 
  },
  subjectGrade: { 
    color: "rgba(255,255,255,0.8)", 
    fontSize: 12 
  },

  // Premium Card
  premiumCard: { 
    borderRadius: 24, 
    overflow: "hidden", 
    width: "100%",
    height: 200 
  },
  premiumCardElevated: { 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 12 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 24, 
    elevation: 12 
  },
  premiumImage: { 
    width: "100%", 
    height: "100%" 
  },
  premiumOverlay: { 
    position: "absolute", 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0 
  },
  premiumGradient: { 
    flex: 1, 
    justifyContent: "center" 
  },
  premiumContent: { 
    padding: 24 
  },
  premiumBadge: { 
    backgroundColor: "rgba(255, 255, 255, 0.26)", 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8, 
    alignSelf: "flex-start", 
    marginBottom: 12 
  },
  premiumBadgeText: { 
    color: "#fff", 
    fontSize: 10, 
    fontWeight: "bold" 
  },
  premiumTitle: { 
    color: "#fff", 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  premiumDescription: { 
    color: "#fff", 
    fontSize: 14, 
    marginBottom: 16, 
    lineHeight: 20,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  premiumButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    alignSelf: "flex-start", 
    backgroundColor: "rgba(255,255,255,0.2)", 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 12 
  },
  premiumButtonText: { 
    color: "#fff", 
    fontWeight: "600", 
    marginRight: 8 
  },

  // Assessments
  assessmentsGrid: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  assessmentCard: { 
    width: "48%", 
    borderRadius: 16, 
    overflow: "hidden", 
    backgroundColor: "#fff" 
  },
  assessmentCardElevated: { 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4 
  },
  assessmentImage: { 
    width: "100%", 
    height: 120 
  },
  assessmentContent: { 
    padding: 12 
  },
  assessmentTitle: { 
    fontSize: 14, 
    fontWeight: "bold", 
    color: "#1a1a1a", 
    marginBottom: 4 
  },
  assessmentDescription: { 
    fontSize: 12, 
    color: "#666" 
  },

  // uThando Portal card — matched to Premium card sizing (full width, same height)
  universitiesScroll: { 
    marginHorizontal: -24, 
    paddingHorizontal: 24 
  },
  universityCard: { 
    width: "100%", 
    height: 200, 
    borderRadius: 24, 
    overflow: "hidden" 
  },
  universityCardElevated: { 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 12 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 24, 
    elevation: 12 
  },
  universityImage: { 
    width: "100%", 
    height: "100%" 
  },
  universityOverlay: { 
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 24,
    paddingTop: 40
  },
  universityRank: { 
    backgroundColor: "#667eea", 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 8,
    alignSelf: 'flex-start'
  },
  universityRankText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 12 
  },
  universityName: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 18, 
    flexShrink: 1 
  },

  // Upcoming Features
  upcomingGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between" 
  },
  upcomingCard: { 
    width: "48%", 
    backgroundColor: "#fff", 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 16 
  },
  upcomingCardElevated: { 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2 
  },
  upcomingIconContainer: { 
    width: 48, 
    height: 48, 
    backgroundColor: "rgba(102, 126, 234, 0.1)", 
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 12 
  },
  upcomingTitle: { 
    fontSize: 14, 
    fontWeight: "bold", 
    color: "#1a1a1a", 
    marginBottom: 4 
  },
  upcomingDescription: { 
    fontSize: 12, 
    color: "#666", 
    lineHeight: 16 
  },
  comingSoonTag: { 
    position: "absolute", 
    top: 12, 
    right: 12, 
    backgroundColor: "#667eea", 
    borderRadius: 4, 
    paddingHorizontal: 6, 
    paddingVertical: 2 
  },
  comingSoonTagText: { 
    color: "#fff", 
    fontSize: 8, 
    fontWeight: "bold" 
  },

  // Footer
  footer: { 
    marginTop: 48, 
    padding: 32, 
    alignItems: "center" 
  },
  footerLogo: { 
    width: 64, 
    height: 64, 
    marginBottom: 16 
  },
  footerMission: { 
    textAlign: "center", 
    fontSize: 14, 
    color: "#666", 
    lineHeight: 20, 
    marginBottom: 8, 
    fontStyle: "italic" 
  },
  footerVision: { 
    textAlign: "center", 
    fontSize: 12, 
    color: "#999", 
    marginBottom: 16 
  },
  footerLinks: { 
    flexDirection: "row" 
  },
  footerLink: { 
    fontSize: 12, 
    color: "#667eea", 
    marginHorizontal: 8, 
    fontWeight: "500" 
  },
});