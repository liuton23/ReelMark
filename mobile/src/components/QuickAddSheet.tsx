import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { Text, useTheme, Button, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { haptics } from "../utils/haptics";

interface QuickAddSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number | undefined, notes: string) => void;
  movieTitle: string;
}

export default function QuickAddSheet({
  visible,
  onClose,
  onSubmit,
  movieTitle,
}: QuickAddSheetProps) {
  const theme = useTheme();
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    onSubmit(rating, notes);
    // Reset
    setRating(undefined);
    setNotes("");
  };

  const StarButton = ({ value }: { value: number }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      setRating(value);
      haptics.light();

      // Animate star
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 10,
        }),
      ]).start();
    };

    return (
      <TouchableOpacity onPress={handlePress}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <MaterialCommunityIcons
            name={rating && rating >= value ? "star" : "star-outline"}
            size={36}
            color={
              rating && rating >= value
                ? theme.colors.primary
                : theme.colors.onSurfaceVariant
            }
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.avoidingView}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.sheet, { backgroundColor: theme.colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text
                  variant="titleLarge"
                  style={{
                    color: theme.colors.onSurface,
                    fontFamily: "Righteous_400Regular",
                    fontSize: 16,
                    flex: 1,
                    paddingRight: 8,
                  }}
                  numberOfLines={2}
                >
                  LOG: {movieTitle}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={theme.colors.onSurface}
                  />
                </TouchableOpacity>
              </View>

              {/* Rating */}
              <View style={styles.section}>
                <Text
                  variant="titleSmall"
                  style={{
                    color: theme.colors.onSurface,
                    marginBottom: 12,
                    fontFamily: "SpaceMono_400Regular",
                    fontSize: 14,
                  }}
                >
                  RATING (OPTIONAL)
                </Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <StarButton key={value} value={value} />
                  ))}
                </View>
                {rating && (
                  <Text
                    style={{
                      color: theme.colors.primary,
                      marginTop: 8,
                      textAlign: "center",
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    {rating}/10
                  </Text>
                )}
              </View>

              {/* Notes */}
              <View style={styles.section}>
                <Text
                  variant="titleSmall"
                  style={{
                    color: theme.colors.onSurface,
                    marginBottom: 8,
                    fontFamily: "SpaceMono_400Regular",
                    fontSize: 14,
                  }}
                >
                  YOUR THOUGHTS (OPTIONAL)
                </Text>
                <TextInput
                  mode="outlined"
                  placeholder="What did you think?"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  style={styles.notesInput}
                  contentStyle={{ fontFamily: 'PatrickHand_400Regular', fontSize: 16 }}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  textColor={theme.colors.onSurface}
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  returnKeyType="done"
                />
              </View>

              {/* Buttons */}
              <View style={styles.buttons}>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  buttonColor={theme.colors.primary}
                  textColor={theme.colors.onPrimary}
                  labelStyle={{
                    fontFamily: "Righteous_400Regular",
                    fontSize: 14,
                    letterSpacing: 1,
                  }}
                >
                  ADD TO COLLECTION
                </Button>
                <Button
                  mode="text"
                  onPress={onClose}
                  textColor={theme.colors.onSurfaceVariant}
                  labelStyle={{ fontFamily: "Righteous_400Regular" }}
                >
                  Cancel
                </Button>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  avoidingView: {
    maxHeight: "90%",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "100%",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  stars: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  notesInput: {
    backgroundColor: "transparent",
    maxHeight: 120,
  },
  buttons: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  submitButton: {
    marginBottom: 12,
  },
});
