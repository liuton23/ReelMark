import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, useTheme, Button, TextInput } from "react-native-paper";
import { BellRingingIcon, InfoIcon } from "phosphor-react-native";
import { apiService, Recommendation, RecommendationStatus } from "../services/api";
import RecommendationCard from "../components/RecommendationCard";

const POLL_INTERVAL_MS = 2000;

export default function RecommendScreen() {
  const theme = useTheme();
  const [status, setStatus] = useState<RecommendationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | undefined>(undefined);
  const [preferences, setPreferences] = useState("");
  const [pollingMessage, setPollingMessage] = useState("Analyzing your watch history...");

  // Hold polling interval ref so we can clear it
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchStatus();
    // Clear any polling on unmount
    return () => stopPolling();
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await apiService.getRecommendationStatus();
      setStatus(data);
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const pollJobStatus = (jobId: string) => {
    // Cycle through messages so it doesn't feel frozen
    const messages = [
      "Analyzing your watch history...",
      "Consulting the clerk...",
      "Browsing the shelves...",
      "Finding the perfect pick...",
    ];
    let messageIndex = 0;

    pollIntervalRef.current = setInterval(async () => {
      // Rotate message
      messageIndex = (messageIndex + 1) % messages.length;
      setPollingMessage(messages[messageIndex]);

      try {
        const result = await apiService.getRecommendationJob(jobId);

        if (result.status === "completed") {
          stopPolling();
          setRecommendation(result.recommendation);
          setGenerating(false);
        } else if (result.status === "failed") {
          stopPolling();
          setGenerating(false);
          alert("Failed to generate recommendation. Please try again.");
        }
        // status === 'processing' — keep polling
      } catch (error) {
        console.error("Polling error:", error);
        stopPolling();
        setGenerating(false);
        alert("Failed to get recommendation status. Please try again.");
      }
    }, POLL_INTERVAL_MS);
  };

  const handleGetRecommendation = async () => {
    setGenerating(true);
    setRecommendation(undefined);
    setPollingMessage("Analyzing your watch history...");

    try {
      // Returns immediately with jobId
      const { jobId } = await apiService.getRecommendation(preferences.trim() || undefined);
      // Start polling
      pollJobStatus(jobId);
    } catch (error: any) {
      setGenerating(false);
      alert(error.response?.data?.details || "Failed to start recommendation");
    }
  };

  const handleAddToWatchlist = () => {
    alert("Feature coming soon! Search for this title in the Browse tab to add it.");
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <BellRingingIcon size={48} color={theme.colors.primary} weight="duotone" />
          <Text
            style={{
              color: theme.colors.onSurface,
              fontFamily: "Righteous_400Regular",
              fontSize: 32,
              marginTop: 16,
              textAlign: "center",
              letterSpacing: 2,
            }}
          >
            ASK THE CLERK
          </Text>
          <Text
            style={{
              color: theme.colors.onSurfaceVariant,
              fontFamily: "SpaceMono_400Regular",
              fontSize: 12,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            AI-powered picks just for you
          </Text>
        </View>

        {status && !status.canGetRecommendations ? (
          <View style={[styles.statusCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <InfoIcon size={32} color={theme.colors.onSurfaceVariant} weight="duotone" />
            <Text
              style={{
                color: theme.colors.onSurface,
                marginTop: 12,
                textAlign: "center",
                fontFamily: "Righteous_400Regular",
                fontSize: 16,
              }}
            >
              WATCH {status.remainingWatchesNeeded} MORE TO UNLOCK
            </Text>
            <Text
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, textAlign: "center" }}
            >
              The clerk needs to know your taste before making recommendations
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.inputSection}>
              <Text
                style={{
                  color: theme.colors.onSurface,
                  marginBottom: 8,
                  fontFamily: "SpaceMono_400Regular",
                  fontSize: 13,
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
                contentStyle={{ fontFamily: "SpaceMono_400Regular", fontSize: 13 }}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                textColor={theme.colors.onSurface}
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleGetRecommendation}
              loading={generating}
              disabled={generating}
              style={styles.button}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              labelStyle={{ fontFamily: "Righteous_400Regular", fontSize: 14, letterSpacing: 1 }}
              icon={() => <BellRingingIcon size={16} color={theme.colors.onPrimary} weight="fill" />}
            >
              {generating ? "CLERK IS THINKING..." : "RING BELL FOR SERVICE"}
            </Button>

            {generating && (
              <View style={styles.loadingContainer}>
                <Text
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    fontFamily: "SpaceMono_400Regular",
                    fontSize: 13,
                  }}
                >
                  {pollingMessage}
                </Text>
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ marginTop: 12 }}
                />
              </View>
            )}

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
  container: { flex: 1 },
  content: { padding: 20 },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 32 },
  statusCard: { padding: 24, borderRadius: 12, alignItems: "center" },
  inputSection: { marginBottom: 20 },
  input: { backgroundColor: "transparent" },
  button: { marginBottom: 20 },
  loadingContainer: { alignItems: "center", padding: 20 },
  recommendationContainer: { marginTop: 8 },
});