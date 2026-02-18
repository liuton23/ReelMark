import React, { useState, useEffect, useLayoutEffect } from "react";
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
  TouchableOpacity,
} from "react-native";
import {
  Text,
  useTheme,
  Button,
  Chip,
  Divider,
  TextInput,
} from "react-native-paper";
import { FilmStripIcon, StarIcon, PencilSimpleIcon, TrashIcon, XIcon } from "phosphor-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { getTMDBPosterUrl, apiService } from "../services/api";
import { haptics } from "../utils/haptics";
import Toast from "react-native-toast-message";
import { StarButton } from "../components/StarButton";

type Props = NativeStackScreenProps<RootStackParamList, "Detail">;

export default function DetailScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { entry } = route.params;
  const { content } = entry;

  const [rating, setRating] = useState(entry.rating);
  const [notes, setNotes] = useState(entry.notes);
  const [watchedAt] = useState(entry.watchedAt);
  const [deleting, setDeleting] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editRating, setEditRating] = useState(rating);
  const [editNotes, setEditNotes] = useState(notes || "");
  const [saving, setSaving] = useState(false);

  const posterUrl = getTMDBPosterUrl(content.posterPath, "w500");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 6,
          gap: 10,
        }}>
          <TouchableOpacity
            onPress={handleEdit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <PencilSimpleIcon size={18} color={theme.colors.primary} weight="regular" />
          </TouchableOpacity>

          <View style={{
            width: 1,
            height: 14,
            backgroundColor: theme.colors.onSurfaceVariant,
            opacity: 0.4,
          }} />

          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleting}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ opacity: deleting ? 0.4 : 1 }}
          >
            <TrashIcon size={18} color={theme.colors.primary} weight="regular" />
          </TouchableOpacity>
        </View>
      ),
      // Match the back button width so the title stays centred
      headerBackTitleStyle: { fontSize: 17 },
    });
  }, [navigation, deleting, theme]);


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
      setRating(editRating);
      setNotes(editNotes.trim() || undefined);
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
      ]
    );
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Poster */}
        <View style={styles.posterContainer}>
          {posterUrl ? (
            <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={[styles.posterPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
              <FilmStripIcon size={80} color={theme.colors.onSurfaceVariant} weight="thin" />
            </View>
          )}

        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text
            style={{
              color: theme.colors.onSurface,
              fontFamily: "Righteous_400Regular",
              fontSize: 27,
              marginBottom: 8,
            }}
          >
            {content.title}
          </Text>

          <View style={styles.metadata}>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontFamily: "SpaceMono_400Regular" }}>
              {content.releaseYear} {"• "}
              {content.type === "MOVIE" ? "Movie" : "TV Show"}
              {content.runtime && ` • ${content.runtime} min`}
            </Text>
          </View>

          {content.genres && content.genres.length > 0 && (
            <View style={styles.genres}>
              {content.genres.map((genre, index) => (
                <Chip
                  key={index}
                  style={{ backgroundColor: theme.colors.surfaceVariant, marginRight: 8, marginBottom: 8 }}
                  textStyle={{ color: theme.colors.onSurfaceVariant, fontFamily: "SpaceMono_400Regular", fontSize: 12 }}
                >
                  {genre}
                </Chip>
              ))}
            </View>
          )}

          <Divider style={{ marginVertical: 10 }} />

          {/* Rating */}
          {rating ? (
            <View style={styles.section}>
              <Text
                style={{
                  color: theme.colors.primary,
                  fontFamily: "Righteous_400Regular",
                  fontSize: 16,
                  marginBottom: 8,
                }}
              >
                YOUR RATING
              </Text>
              <View style={styles.ratingRow}>
                <StarIcon size={28} color={theme.colors.primary} weight="fill" />
                <Text
                  style={{
                    color: theme.colors.primary,
                    marginLeft: 8,
                    fontFamily: "Righteous_400Regular",
                    fontSize: 24,
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
                <Text style={{ color: theme.colors.primary, fontFamily: "SpaceMono_400Regular" }}>
                  + Add a rating
                </Text>
              </Pressable>
            </View>
          )}

          {/* Watch Date */}
          <View style={styles.section}>
            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                fontFamily: "Righteous_400Regular",
                fontSize: 16,
                marginBottom: 4,
              }}
            >
              CHECKED OUT ON
            </Text>
            <Text style={{ color: theme.colors.onSurface, fontFamily: "SpaceMono_400Regular", fontSize: 12 }}>
              {watchDate}
            </Text>
          </View>

          <Divider style={{ marginVertical: 10 }} />

          {/* Notes */}
          <View style={styles.section}>
            <Text
              style={{
                color: theme.colors.onSurface,
                fontFamily: "Righteous_400Regular",
                fontSize: 16,
                marginBottom: 12,
              }}
            >
              YOUR NOTES
            </Text>
            {notes ? (
              <Text style={{ color: theme.colors.onSurface, fontFamily: "PatrickHand_400Regular", lineHeight: 24, fontSize: 16 }}>
                {notes}
              </Text>
            ) : (
              <Pressable onPress={handleEdit}>
                <Text style={{ color: theme.colors.primary, fontFamily: "SpaceMono_400Regular" }}>
                  + Add notes
                </Text>
              </Pressable>
            )}
          </View>

          {/* Overview */}
          {content.overview && (
            <>
              <Divider style={{ marginVertical: 10 }} />
              <View style={styles.section}>
                <Text
                  style={{
                    color: theme.colors.onSurface,
                    fontFamily: "Righteous_400Regular",
                    fontSize: 16,
                    marginBottom: 12,
                  }}
                >
                  OVERVIEW
                </Text>
                <Text
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    fontFamily: "SpaceMono_400Regular",
                    lineHeight: 22,
                    fontSize: 12,
                  }}
                >
                  {content.overview}
                </Text>
              </View>
            </>
          )}

          {/* TV Show Info */}
          {content.type === "TV_SHOW" && (content.numberOfSeasons || content.numberOfEpisodes) && (
            <>
              <Divider style={{ marginVertical: 10 }} />
              <View style={styles.section}>
                <Text
                  style={{
                    color: theme.colors.onSurface,
                    fontFamily: "Righteous_400Regular",
                    fontSize: 16,
                    marginBottom: 10,
                  }}
                >
                  SERIES INFO
                </Text>
                {content.numberOfSeasons && (
                  <Text style={{ color: theme.colors.onSurfaceVariant, fontFamily: "SpaceMono_400Regular", fontSize: 12 }}>
                    Seasons: {content.numberOfSeasons}
                  </Text>
                )}
                {content.numberOfEpisodes && (
                  <Text style={{ color: theme.colors.onSurfaceVariant, fontFamily: "SpaceMono_400Regular", fontSize: 12 }}>
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
          <Pressable style={styles.modalBackdrop} onPress={() => setEditVisible(false)} />
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                EDIT RENTAL CARD
              </Text>
              <TouchableOpacity onPress={() => setEditVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <XIcon size={20} color={theme.colors.onSurfaceVariant} weight="bold" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {content.title}
            </Text>

            <Divider style={{ marginVertical: 16 }} />

            <Text style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>RATING</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <StarButton
                  key={star}
                  value={star}
                  rating={editRating}
                  setRating={(v) => setEditRating(v === 0 ? undefined : v)}
                />
              ))}
            </View>

            {editRating ? (
              <Text style={[styles.ratingLabel, { color: theme.colors.primary }]}>{editRating}/10</Text>
            ) : (
              <Text style={[styles.ratingLabel, { color: theme.colors.onSurfaceVariant }]}>No rating</Text>
            )}

            <Text style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant, marginTop: 20 }]}>NOTES</Text>
            <TextInput
              mode="outlined"
              placeholder="What did you think?"
              value={editNotes}
              onChangeText={setEditNotes}
              multiline
              numberOfLines={4}
              style={styles.notesInput}
              contentStyle={{ fontFamily: "PatrickHand_400Regular", fontSize: 16 }}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />

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
  container: { flex: 1 },
  posterContainer: { width: "100%", height: 400, position: "relative" },
  poster: { width: "100%", height: "100%" },
  posterPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtn: {
    padding: 6,
    borderRadius: 8,
  },
  content: { padding: 20 },
  metadata: { marginBottom: 16 },
  genres: { flexDirection: "row", flexWrap: "wrap" },
  section: { marginBottom: 10 },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { flex: 1 },
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
  modalTitle: { fontFamily: "Righteous_400Regular", fontSize: 20, letterSpacing: 2 },
  modalSubtitle: { fontFamily: "SpaceMono_400Regular", fontSize: 13, marginTop: -4 },
  fieldLabel: { fontFamily: "SpaceMono_400Regular", fontSize: 12, marginBottom: 8 },
  stars: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" },
  ratingLabel: { fontFamily: "SpaceMono_400Regular", fontSize: 13, marginTop: 8 },
  notesInput: { backgroundColor: "transparent", maxHeight: 120 },
  saveButton: { marginTop: 24, paddingVertical: 4, borderRadius: 8 },
  saveButtonLabel: { fontFamily: "Righteous_400Regular", fontSize: 14, letterSpacing: 1 },
});