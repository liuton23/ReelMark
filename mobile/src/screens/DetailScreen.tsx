import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import {
  Text,
  useTheme,
  Button,
  IconButton,
  Chip,
  Divider,
  TextInput,
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
  const { content } = entry;

  const [rating, setRating] = useState(entry.rating);
  const [notes, setNotes] = useState(entry.notes);
  const [watchedAt] = useState(entry.watchedAt);
  const [deleting, setDeleting] = useState(false);

  // Edit modal state
  const [editVisible, setEditVisible] = useState(false);
  const [editRating, setEditRating] = useState(rating);
  const [editNotes, setEditNotes] = useState(notes || "");
  const [saving, setSaving] = useState(false);

  const posterUrl = getTMDBPosterUrl(content.posterPath, "w500");
  const watchDate = new Date(watchedAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleEdit = () => {
    setEditRating(rating);
    setEditNotes(notes || "");
    setEditVisible(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.updateWatchEntry(entry.id, {
        rating: editRating ?? undefined,
        notes: editNotes.trim() || undefined,
      });

      // Update local state so the screen reflects changes immediately
      setRating(editRating);
      setNotes(editNotes.trim() || null);

      haptics.success();
      Toast.show({
        type: "success",
        text1: "Updated",
        text2: `${content.title} has been updated`,
        position: "bottom",
      });
      setEditVisible(false);
    } catch (error) {
      console.error("Error updating:", error);
      haptics.error();
      Toast.show({
        type: "error",
        text1: "Failed to Update",
        text2: "Please try again",
        position: "bottom",
      });
    } finally {
      setSaving(false);
    }
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

  // Star rating component
  const StarRating = ({
    value,
    onSelect,
  }: {
    value: number | null;
    onSelect: (v: number) => void;
  }) => (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <Pressable
          key={star}
          onPress={() => {
            haptics.light();
            onSelect(star === value ? 0 : star);
          }}
          hitSlop={4}
        >
          <MaterialCommunityIcons
            name={value && star <= value ? "star" : "star-outline"}
            size={28}
            color={
              value && star <= value
                ? theme.colors.primary
                : theme.colors.onSurfaceVariant
            }
          />
        </Pressable>
      ))}
    </View>
  );

  return (
    <>
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
          {rating ? (
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
              <View style={styles.ratingRow}>
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
          ) : (
            <View style={styles.section}>
              <Pressable onPress={handleEdit}>
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.primary,
                    fontFamily: "SpaceMono_400Regular",
                  }}
                >
                  + Add a rating
                </Text>
              </Pressable>
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
              <Pressable onPress={handleEdit}>
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.primary,
                    fontFamily: "SpaceMono_400Regular",
                  }}
                >
                  + Add notes
                </Text>
              </Pressable>
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

      {/* Edit Modal */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setEditVisible(false)}
          />
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                EDIT RENTAL CARD
              </Text>
              <IconButton
                icon="close"
                size={20}
                iconColor={theme.colors.onSurfaceVariant}
                onPress={() => setEditVisible(false)}
              />
            </View>

            <Text
              style={[
                styles.modalSubtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {content.title}
            </Text>

            <Divider style={{ marginVertical: 16 }} />

            {/* Rating */}
            <Text
              style={[
                styles.fieldLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              RATING
            </Text>
            <StarRating
              value={editRating}
              onSelect={(v) => setEditRating(v === 0 ? null : v)}
            />

            {editRating ? (
              <Text
                style={[
                  styles.ratingLabel,
                  { color: theme.colors.primary },
                ]}
              >
                {editRating}/10
              </Text>
            ) : (
              <Text
                style={[
                  styles.ratingLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                No rating
              </Text>
            )}

            {/* Notes */}
            <Text
              style={[
                styles.fieldLabel,
                { color: theme.colors.onSurfaceVariant, marginTop: 20 },
              ]}
            >
              NOTES
            </Text>
            <TextInput
              mode="outlined"
              placeholder="What did you think?"
              value={editNotes}
              onChangeText={setEditNotes}
              multiline
              numberOfLines={4}
              style={styles.notesInput}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />

            {/* Save Button */}
            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              style={styles.saveButton}
              labelStyle={styles.saveButtonLabel}
            >
              SAVE CHANGES
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
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
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 24,
    letterSpacing: 2,
  },
  modalSubtitle: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 13,
    marginTop: -4,
  },
  fieldLabel: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 12,
    marginBottom: 8,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  ratingLabel: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 13,
    marginTop: 8,
  },
  notesInput: {
    backgroundColor: "transparent",
    maxHeight: 120,
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 4,
    borderRadius: 8,
  },
  saveButtonLabel: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 18,
    letterSpacing: 1,
  },
});