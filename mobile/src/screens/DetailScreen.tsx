import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image, Alert } from "react-native";
import {
  Text,
  useTheme,
  Button,
  IconButton,
  Chip,
  Divider,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { getTMDBPosterUrl, apiService } from "../services/api";
import { haptics } from "../utils/haptics";
import Toast from "react-native-toast-message";

type Props = NativeStackScreenProps<RootStackParamList, "Detail">;

export default function DetailScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { entry } = route.params;
  const { content, rating, notes, watchedAt } = entry;

  const [deleting, setDeleting] = useState(false);

  const posterUrl = getTMDBPosterUrl(content.posterPath, "w500");
  const watchDate = new Date(watchedAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleEdit = () => {
    // TODO: Navigate to edit screen or show edit modal
    Alert.alert("Coming Soon", "Edit functionality will be added next!");
  };

  const handleDelete = () => {
    haptics.warning();
    Alert.alert(
      "Lost the Tape?",
      `Remove "${content.title}" from your collection?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await apiService.deleteWatchEntry(entry.id);
              haptics.success();
              Toast.show({
                type: "success",
                text1: "Removed from Collection",
                text2: `${content.title} has been deleted`,
                position: "bottom",
              });
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting:", error);
              haptics.error();
              Toast.show({
                type: "error",
                text1: "Failed to Delete",
                text2: "Please try again",
                position: "bottom",
              });
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Poster */}
      <View style={styles.posterContainer}>
        {posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            style={styles.poster}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.posterPlaceholder,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <MaterialCommunityIcons
              name="filmstrip"
              size={80}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
        )}

        {/* Action Buttons Overlay */}
        <View style={styles.headerActions}>
          <IconButton
            icon="pencil"
            iconColor={theme.colors.onPrimary}
            containerColor={theme.colors.primary}
            size={24}
            onPress={handleEdit}
          />
          <IconButton
            icon="delete"
            iconColor={theme.colors.onPrimary}
            containerColor={theme.colors.error}
            size={24}
            onPress={handleDelete}
            disabled={deleting}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text
          variant="headlineMedium"
          style={{
            color: theme.colors.onSurface,
            fontFamily: "BebasNeue_400Regular",
            fontSize: 32,
            marginBottom: 8,
          }}
        >
          {content.title}
        </Text>

        {/* Metadata */}
        <View style={styles.metadata}>
          <Text
            variant="bodyLarge"
            style={{
              color: theme.colors.onSurfaceVariant,
              fontFamily: "SpaceMono_400Regular",
            }}
          >
            {content.releaseYear} •{" "}
            {content.type === "MOVIE" ? "Movie" : "TV Show"}
            {content.runtime && ` • ${content.runtime} min`}
          </Text>
        </View>

        {/* Genres */}
        {content.genres && content.genres.length > 0 && (
          <View style={styles.genres}>
            {content.genres.map((genre, index) => (
              <Chip
                key={index}
                style={{
                  backgroundColor: theme.colors.surfaceVariant,
                  marginRight: 8,
                  marginBottom: 8,
                }}
                textStyle={{
                  color: theme.colors.onSurfaceVariant,
                  fontFamily: "SpaceMono_400Regular",
                  fontSize: 14,
                }}
              >
                {genre}
              </Chip>
            ))}
          </View>
        )}

        <Divider style={{ marginVertical: 20 }} />

        {/* Your Rating */}
        {rating && (
          <View style={styles.section}>
            <Text
              variant="labelLarge"
              style={{
                color: theme.colors.primary,
                fontFamily: "SpaceMono_400Regular",
                fontSize: 16,
                marginBottom: 8,
              }}
            >
              YOUR RATING
            </Text>
            <View style={styles.rating}>
              <MaterialCommunityIcons
                name="star"
                size={28}
                color={theme.colors.primary}
              />
              <Text
                variant="headlineSmall"
                style={{
                  color: theme.colors.primary,
                  marginLeft: 8,
                  fontWeight: "bold",
                }}
              >
                {rating}/10
              </Text>
            </View>
          </View>
        )}

        {/* Watch Date */}
        <View style={styles.section}>
          <Text
            variant="labelLarge"
            style={{
              color: theme.colors.onSurfaceVariant,
              fontFamily: "SpaceMono_400Regular",
              fontSize: 16,
              marginBottom: 4,
            }}
          >
            CHECKED OUT ON
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
            {watchDate}
          </Text>
        </View>

        <Divider style={{ marginVertical: 20 }} />

        {/* Your Notes */}
        <View style={styles.section}>
          <Text
            variant="titleMedium"
            style={{
              color: theme.colors.onSurface,
              fontFamily: "BebasNeue_400Regular",
              fontSize: 20,
              marginBottom: 12,
            }}
          >
            YOUR NOTES
          </Text>
          {notes ? (
            <Text
              variant="bodyLarge"
              style={{
                color: theme.colors.onSurface,
                lineHeight: 24,
              }}
            >
              {notes}
            </Text>
          ) : (
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.onSurfaceVariant,
                fontStyle: "italic",
              }}
            >
              No notes for this one
            </Text>
          )}
        </View>

        {/* Overview */}
        {content.overview && (
          <>
            <Divider style={{ marginVertical: 20 }} />
            <View style={styles.section}>
              <Text
                variant="titleMedium"
                style={{
                  color: theme.colors.onSurface,
                  fontFamily: "BebasNeue_400Regular",
                  fontSize: 20,
                  marginBottom: 12,
                }}
              >
                OVERVIEW
              </Text>
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  lineHeight: 22,
                }}
              >
                {content.overview}
              </Text>
            </View>
          </>
        )}

        {/* TV Show Info */}
        {content.type === "TV_SHOW" &&
          (content.numberOfSeasons || content.numberOfEpisodes) && (
            <>
              <Divider style={{ marginVertical: 20 }} />
              <View style={styles.section}>
                <Text
                  variant="titleMedium"
                  style={{
                    color: theme.colors.onSurface,
                    fontFamily: "BebasNeue_400Regular",
                    fontSize: 20,
                    marginBottom: 12,
                  }}
                >
                  SERIES INFO
                </Text>
                {content.numberOfSeasons && (
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    Seasons: {content.numberOfSeasons}
                  </Text>
                )}
                {content.numberOfEpisodes && (
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    Total Episodes: {content.numberOfEpisodes}
                  </Text>
                )}
              </View>
            </>
          )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  posterContainer: {
    width: "100%",
    height: 400,
    position: "relative",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  posterPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    gap: 8,
  },
  content: {
    padding: 20,
  },
  metadata: {
    marginBottom: 16,
  },
  genres: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  section: {
    marginBottom: 20,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
});
