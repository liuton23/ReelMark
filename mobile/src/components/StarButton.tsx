import React, { useRef } from "react";
import {
  TouchableOpacity,
  Animated,
} from "react-native";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { haptics } from "../utils/haptics";

type starButtonProp = {
  value: number,
  rating: number | undefined,
  setRating: React.Dispatch<React.SetStateAction<number | undefined>>
}
export const StarButton = ({ value, rating, setRating }: starButtonProp) => {
  const theme = useTheme();
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
          size={28}
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