import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, useTheme, Button, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  apiService,
  Recommendation,
  RecommendationStatus,
} from "../services/api";
import RecommendationCard from "../components/RecommendationCard";

const DEFAULT_USER_ID = "572bc43f-b148-4a6a-9ce3-e929b152fa57";

export default function RecommendScreen() {
  const theme = useTheme();
  const [status, setStatus] = useState<RecommendationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null,
  );
  const [preferences, setPreferences] = useState("");

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await apiService.getRecommendationStatus(DEFAULT_USER_ID);
      setStatus(data);
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendation = async () => {
    console.log("🔔 Getting recommendation...");
    setGenerating(true);
    setRecommendation(null);

    try {
      const data = await apiService.getRecommendation(
        DEFAULT_USER_ID,
        preferences.trim() || undefined,
      );

      console.log("Full API response:", JSON.stringify(data, null, 2));
      console.log("Recommendation field:", data.recommendation);
      console.log("Setting state with:", data.recommendation);

      setRecommendation(data.recommendation);

      // Force a re-render check
      setTimeout(() => {
        console.log("Current recommendation state:", recommendation);
      }, 100);
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert(error.response?.data?.details || "Failed to get recommendation");
    } finally {
      setGenerating(false);
    }
  };

  const handleAddToWatchlist = () => {
    // TODO: Navigate to search to find this movie/show
    alert(
      "Feature coming soon! Search for this title in the Browse tab to add it.",
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="bell-ring"
            size={48}
            color={theme.colors.primary}
          />
          <Text
            variant="headlineMedium"
            style={{
              color: theme.colors.onSurface,
              fontFamily: "BebasNeue_400Regular",
              fontSize: 32,
              marginTop: 16,
              textAlign: "center",
              letterSpacing: 2,
            }}
          >
            ASK THE CLERK
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            AI-powered picks just for you
          </Text>
        </View>

        {/* Status Check */}
        {status && !status.canGetRecommendations ? (
          <View
            style={[
              styles.statusCard,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <MaterialCommunityIcons
              name="information"
              size={32}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="titleMedium"
              style={{
                color: theme.colors.onSurface,
                marginTop: 12,
                textAlign: "center",
                fontFamily: "BebasNeue_400Regular",
              }}
            >
              WATCH {status.remainingWatchesNeeded} MORE TO UNLOCK
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.onSurfaceVariant,
                marginTop: 8,
                textAlign: "center",
              }}
            >
              The clerk needs to know your taste before making recommendations
            </Text>
          </View>
        ) : (
          <>
            {/* Preferences Input */}
            <View style={styles.inputSection}>
              <Text
                variant="labelLarge"
                style={{
                  color: theme.colors.onSurface,
                  marginBottom: 8,
                  fontFamily: "SpaceMono_400Regular",
                  fontSize: 16,
                }}
              >
                WHAT ARE YOU IN THE MOOD FOR? (OPTIONAL)
              </Text>
              <TextInput
                mode="outlined"
                placeholder="e.g., something lighthearted, a mind-bending thriller..."
                value={preferences}
                onChangeText={setPreferences}
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                textColor={theme.colors.onSurface}
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
            </View>

            {/* Get Recommendation Button */}
            <Button
              mode="contained"
              onPress={handleGetRecommendation}
              loading={generating}
              disabled={generating}
              style={styles.button}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              labelStyle={{
                fontFamily: "BebasNeue_400Regular",
                fontSize: 18,
                letterSpacing: 1,
              }}
              icon="bell-ring"
            >
              {generating ? "CLERK IS THINKING..." : "RING BELL FOR SERVICE 🔔"}
            </Button>

            {/* Loading State with Typing Animation */}
            {generating && (
              <View style={styles.loadingContainer}>
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    fontFamily: "SpaceMono_400Regular",
                    fontSize: 16,
                  }}
                >
                  Analyzing your watch history...
                </Text>
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ marginTop: 12 }}
                />
              </View>
            )}

            {/* Recommendation Card */}
            {recommendation && !generating && (
              <View style={styles.recommendationContainer}>
                <RecommendationCard
                  recommendation={recommendation}
                  onAddToWatchlist={handleAddToWatchlist}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  statusCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  inputSection: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "transparent",
  },
  button: {
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  recommendationContainer: {
    marginTop: 8,
  },
});
