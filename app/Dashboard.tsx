// app/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import AdminDashboard from "./Dashboards/AdminDashboard";
import ParentDashboard from "./Dashboards/ParentDashboard";
import StudentDashboard from "./Dashboards/StudentDashboard";
import TeacherDashboard from "./Dashboards/TeacherDashboard";
import { getUserRole } from "./services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserRole() {
      try {
        setLoading(true);
        setError(null);
        
        // Get token from AsyncStorage
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        // Use the API function directly
        const userRole = await getUserRole(token);
        setRole(userRole);
        
      } catch (err: any) {
        console.error("Error fetching user role:", err);
        setError("Failed to load user role");
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0B0B44" />
        <Text style={{ marginTop: 10 }}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
        <Text>Please log in again.</Text>
      </View>
    );
  }

  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    case "parent":
      return <ParentDashboard />;
    case "student":
      return <StudentDashboard />;
    default:
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>No dashboard available for your role.</Text>
          <Text>Your role: {role || 'unknown'}</Text>
        </View>
      );
  }
}