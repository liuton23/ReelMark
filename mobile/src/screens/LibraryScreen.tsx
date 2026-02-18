import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { apiService, WatchEntry } from "../services/api";
import WatchCard from "../components/WatchCard";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LibraryScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [watchHistory, setWatchHistory] = useState<WatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchHistory = async () => {
    try {
      setError(null);
      const data = await apiService.getWatchHistory();
      setWatchHistory(data);
    } catch (err) {
      console.error("Error fetching watch history:", err);
      setError("Failed to load your collection. Check if backend is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWatchHistory();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWatchHistory();
  }, []);

  const handleCardPress = (entry: WatchEntry) => {
    navigation.navigate("Detail", { entry });
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.onSurface, marginTop: 16 }}>
          Loading your collection...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error, textAlign: "center", paddingHorizontal: 24 }}>
          {error}
        </Text>
        <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, fontSize: 12 }}>
          Make sure your backend server is running
        </Text>
      </View>
    );
  }

  // Empty state
  if (watchHistory.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text
          variant="headlineSmall"
          style={{
            color: theme.colors.onSurface,
            fontFamily: "Righteous_400Regular",
            marginBottom: 8,
          }}
        >
          YOUR SHELVES ARE EMPTY
        </Text>
        <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
          Start browsing to add movies and shows to your collection
        </Text>
      </View>
    );
  }

  // Grid count label (e.g. "42 titles")
  const countLabel = `${watchHistory.length} title${watchHistory.length !== 1 ? "s" : ""}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={watchHistory}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <WatchCard entry={item} onPress={() => handleCardPress(item)} />
          </View>
        )}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={[styles.countLabel, { color: theme.colors.onSurfaceVariant }]}>
            {countLabel}
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  cardWrapper: {
    flex: 1,
  },
  countLabel: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 11,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});