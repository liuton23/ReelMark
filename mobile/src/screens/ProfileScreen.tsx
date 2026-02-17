import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Text, useTheme, Button, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import Constants from "expo-constants";

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
      ],
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
    >
      {/* Avatar / Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <MaterialCommunityIcons
            name="account"
            size={56}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
        <Text
          style={[
            styles.displayName,
            { color: theme.colors.onSurface },
          ]}
        >
          {user?.displayName || user?.username || "Member"}
        </Text>
        <Text
          style={[
            styles.username,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          @{user?.username}
        </Text>
      </View>

      {/* Membership Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: theme.colors.outline,
          },
        ]}
      >
        <Text
          style={[
            styles.cardTitle,
            { color: theme.colors.primary },
          ]}
        >
          MEMBERSHIP CARD
        </Text>

        <Divider style={{ backgroundColor: theme.colors.outline, marginVertical: 16 }} />

        <View style={styles.cardRow}>
          <Text style={[styles.cardLabel, { color: theme.colors.onSurfaceVariant }]}>
            USERNAME
          </Text>
          <Text style={[styles.cardValue, { color: theme.colors.onSurface }]}>
            {user?.username}
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={[styles.cardLabel, { color: theme.colors.onSurfaceVariant }]}>
            EMAIL
          </Text>
          <Text style={[styles.cardValue, { color: theme.colors.onSurface }]}>
            {user?.email || "Not set"}
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={[styles.cardLabel, { color: theme.colors.onSurfaceVariant }]}>
            MEMBER SINCE
          </Text>
          <Text style={[styles.cardValue, { color: theme.colors.onSurface }]}>
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : "—"}
          </Text>
        </View>
      </View>

      {/* Logout */}
      <Button
        mode="outlined"
        onPress={handleLogout}
        loading={loggingOut}
        disabled={loggingOut}
        style={[styles.logoutButton, { borderColor: theme.colors.error }]}
        labelStyle={[styles.logoutLabel, { color: theme.colors.error }]}
        icon="logout"
      >
        SIGN OUT
      </Button>

      {/* App info */}
      <Text
        style={[
          styles.version,
          { color: theme.colors.onSurfaceVariant },
        ]}
      >
        ReelMark Video v{appVersion}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  displayName: {
    fontFamily: "Righteous_400Regular",
    fontSize: 32,
    letterSpacing: 2,
  },
  username: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    marginBottom: 32,
  },
  cardTitle: {
    fontFamily: "Righteous_400Regular",
    fontSize: 16,
    letterSpacing: 2,
    textAlign: "center",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardLabel: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 11,
  },
  cardValue: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 13,
  },
  logoutButton: {
    borderRadius: 8,
    paddingVertical: 4,
  },
  logoutLabel: {
    fontFamily: "Righteous_400Regular",
    fontSize: 14,
    letterSpacing: 1,
  },
  version: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 11,
    textAlign: "center",
    marginTop: 24,
  },
});