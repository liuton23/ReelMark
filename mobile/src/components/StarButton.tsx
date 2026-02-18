import React, { useRef } from "react";
import { TouchableOpacity, Animated } from "react-native";
import { useTheme } from "react-native-paper";
import { StarIcon } from "phosphor-react-native";
import { haptics } from "../utils/haptics";

type StarButtonProp = {
  value: number;
  rating: number | undefined;
  setRating: (v: number) => void;
  edit?: boolean;
};

export const StarButton = ({ value, rating, setRating, edit }: StarButtonProp) => {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const filled = rating !== undefined && rating >= value;

  const handlePress = () => {
    if (edit) {
      setRating(value === rating ? 0 : value);
    } else {
      setRating(value);
    }
    haptics.light();
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 10 }),
    ]).start();
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <StarIcon
          size={28}
          weight={filled ? "fill" : "regular"}
          color={filled ? theme.colors.primary : theme.colors.onSurfaceVariant}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};