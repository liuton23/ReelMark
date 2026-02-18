import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text, useTheme, Button } from "react-native-paper";
import { UserIcon } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import Constants from "expo-constants";
import { MembershipCard } from "../components/MembershipCard";

const appVersion = Constants.expoConfig?.version ?? "1.0.0";

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Return Your Membership Card?",
      "You'll be signed out of ReelMark.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            setLoggingOut(true);
            try {
              await logout();
            } catch (error) {
              console.error("Logout error:", error);
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
    >
      {/* Avatar — Polaroid style */}
      <View style={styles.header}>
        <View style={[styles.polaroid, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
          <View style={[styles.avatarInner, { backgroundColor: theme.colors.surfaceVariant }]}>
            <UserIcon size={56} color={theme.colors.onSurfaceVariant} weight="regular" />
          </View>
        </View>
        <Text style={[styles.displayName, { color: theme.colors.onSurface }]}>
          {user?.displayName || user?.username || "Member"}
        </Text>
        <Text style={[styles.username, { color: theme.colors.onSurfaceVariant }]}>
          @{user?.username}
        </Text>
      </View>

      <MembershipCard user={user} theme={theme} />

      <Button
        mode="contained"
        onPress={handleLogout}
        loading={loggingOut}
        disabled={loggingOut}
        style={styles.logoutButton}
        buttonColor={theme.colors.surfaceVariant}
        textColor={theme.colors.error}
        labelStyle={styles.logoutLabel}
      >
        SIGN OUT
      </Button>

      <Text style={[styles.version, { color: theme.colors.onSurfaceVariant }]}>
        ReelMark Video v{appVersion}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  header: { alignItems: "center", marginBottom: 24, marginTop: 12 },
  polaroid: {
    width: 110,
    height: 110,
    borderRadius: 12,
    padding: 6,
    marginBottom: 16,
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarInner: { flex: 1, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  displayName: { fontFamily: "Righteous_400Regular", fontSize: 32, letterSpacing: 2 },
  username: { fontFamily: "SpaceMono_400Regular", fontSize: 16, marginTop: 6, textAlign: "center" },
  logoutButton: { borderRadius: 8, paddingVertical: 4 },
  logoutLabel: { fontFamily: "Righteous_400Regular", fontSize: 14, letterSpacing: 1 },
  version: { fontFamily: "SpaceMono_400Regular", fontSize: 11, textAlign: "center", marginTop: 24 },
});