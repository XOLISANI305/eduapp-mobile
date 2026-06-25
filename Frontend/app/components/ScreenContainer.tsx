import React from "react";
import { View, ScrollView, StyleSheet, ViewStyle } from "react-native";

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
}

export default function ScreenContainer({ children, scrollable = true, style }: ScreenContainerProps) {
  const Container = scrollable ? ScrollView : View;

  return (
    <Container
      contentContainerStyle={[styles.container, style]}
      style={!scrollable ? [styles.container, style] : undefined}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 90, // 👈 space for BottomNavigation
    backgroundColor: "#fff",
  },
});
