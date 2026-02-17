import React, { useEffect, useRef } from "react";
import {
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
  View,
  Animated,
} from "react-native";

interface NeonTextProps {
  children: string;
  size?: number;
  color?: string;
  glowColor?: string;
  intensity?: "low" | "medium" | "high";
  uppercase?: boolean;
  flicker?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const GLOW_CONFIGS = {
  low: {
    layers: [
      { radius: 2, opacity: 0.8 },
      { radius: 6, opacity: 0.5 },
      { radius: 12, opacity: 0.3 },
    ],
  },
  medium: {
    layers: [
      { radius: 2, opacity: 0.9 },
      { radius: 8, opacity: 0.6 },
      { radius: 16, opacity: 0.35 },
      { radius: 24, opacity: 0.15 },
    ],
  },
  high: {
    layers: [
      { radius: 2, opacity: 1 },
      { radius: 10, opacity: 0.7 },
      { radius: 20, opacity: 0.4 },
      { radius: 30, opacity: 0.2 },
      { radius: 40, opacity: 0.1 },
    ],
  },
};

// Realistic neon flicker pattern — quick dips in brightness
const createFlickerSequence = (anim: Animated.Value): Animated.CompositeAnimation => {
  // Random helper for natural variation
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  const flicker = (): Animated.CompositeAnimation => {
    // Most of the time: steady glow with subtle breathing
    // Occasionally: quick flicker dip
    const shouldFlicker = Math.random() < 0.6;

    if (shouldFlicker) {
      // Quick flicker: dip down and snap back
      const dipDepth = rand(0.3, 0.7);
      const dipDuration = rand(40, 100);
      const recoveryDuration = rand(60, 150);
      // Often double-flicker
      const doubleDip = Math.random() < 0.6;

      const sequence = [
        Animated.timing(anim, {
          toValue: dipDepth,
          duration: dipDuration,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: recoveryDuration,
          useNativeDriver: true,
        }),
      ];

      if (doubleDip) {
        // Triple flicker sometimes
        const tripleDip = Math.random() < 0.3;
        sequence.push(
          Animated.timing(anim, {
            toValue: rand(0.4, 0.75),
            duration: rand(30, 70),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: rand(50, 120),
            useNativeDriver: true,
          }),
        );

        if (tripleDip) {
          sequence.push(
            Animated.timing(anim, {
              toValue: rand(0.3, 0.6),
              duration: rand(30, 60),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 1,
              duration: rand(40, 100),
              useNativeDriver: true,
            }),
          );
        }
      }

      // Shorter pause between flickers
      sequence.push(
        Animated.timing(anim, {
          toValue: 1,
          duration: rand(800, 3000),
          useNativeDriver: true,
        }),
      );

      return Animated.sequence(sequence);
    } else {
      // Faster breathing between flickers
      return Animated.sequence([
        Animated.timing(anim, {
          toValue: rand(0.85, 0.93),
          duration: rand(800, 1800),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: rand(800, 1800),
          useNativeDriver: true,
        }),
      ]);
    }
  };

  // Recursively loop
  const loop = (): void => {
    flicker().start(({ finished }) => {
      if (finished) loop();
    });
  };

  // Return initial kick-off as a composite
  return {
    start: (callback?: Animated.EndCallback) => {
      loop();
    },
    stop: () => anim.stopAnimation(),
    reset: () => anim.setValue(1),
  };
};

export default function NeonText({
  children,
  size = 32,
  color = "#FF1A1A",
  glowColor,
  intensity = "medium",
  uppercase = false,
  flicker = true,
  style,
  textStyle,
}: NeonTextProps) {
  const glow = glowColor || color;
  const config = GLOW_CONFIGS[intensity];
  const displayText = uppercase ? children.toUpperCase() : children;
  const flickerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!flicker) return;

    // Small initial delay so it doesn't all start at once
    const delay = Math.random() * 800;
    const timeout = setTimeout(() => {
      createFlickerSequence(flickerAnim).start();
    }, delay);

    return () => {
      clearTimeout(timeout);
      flickerAnim.stopAnimation();
    };
  }, [flicker]);

  const textShadowOffset = { width: 0, height: 0 };

  const content = (
    <View style={[styles.container, style]}>
      {/* Glow layers rendered behind */}
      {config.layers.map((layer, index) => (
        <Text
          key={index}
          style={[
            styles.glowLayer,
            {
              fontSize: size,
              color: "transparent",
              textShadowColor: `${glow}${Math.round(layer.opacity * 255)
                .toString(16)
                .padStart(2, "0")}`,
              textShadowOffset,
              textShadowRadius: layer.radius,
            },
            textStyle,
          ]}
        >
          {displayText}
        </Text>
      ))}

      {/* Main text on top */}
      <Text
        style={[
          styles.mainText,
          {
            fontSize: size,
            color: color,
            textShadowColor: glow,
            textShadowOffset,
            textShadowRadius: 4,
          },
          textStyle,
        ]}
      >
        {displayText}
      </Text>
    </View>
  );

  if (!flicker) return content;

  return (
    <Animated.View style={{ opacity: flickerAnim }}>
      {content}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  glowLayer: {
    position: "absolute",
    fontFamily: "TiltNeon_400Regular",
    letterSpacing: 2,
  },
  mainText: {
    fontFamily: "TiltNeon_400Regular",
    letterSpacing: 2,
  },
});