import React, { useEffect, useRef, useCallback } from "react";
import {
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
  View,
  Animated,
  Pressable,
} from "react-native";
import { haptics } from "../utils/haptics";

interface NeonTextProps {
  children: string;
  size?: number;
  color?: string;
  glowColor?: string;
  intensity?: "low" | "medium" | "high";
  uppercase?: boolean;
  flicker?: boolean;
  interactive?: boolean;
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

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

// Rapid burst flicker — like tapping a neon tube
const triggerBurst = (anim: Animated.Value, onDone?: () => void) => {
  const flickCount = Math.floor(rand(4, 8));
  const steps: Animated.CompositeAnimation[] = [];

  for (let i = 0; i < flickCount; i++) {
    steps.push(
      Animated.timing(anim, {
        toValue: rand(0.1, 0.5),
        duration: rand(30, 70),
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: rand(0.7, 1),
        duration: rand(30, 80),
        useNativeDriver: true,
      }),
    );
  }

  // Settle back to full brightness
  steps.push(
    Animated.timing(anim, {
      toValue: 1,
      duration: rand(80, 150),
      useNativeDriver: true,
    }),
  );

  Animated.sequence(steps).start(() => onDone?.());
};

// Ambient flicker loop
const createFlickerSequence = (anim: Animated.Value): { start: () => void; stop: () => void } => {
  let stopped = false;

  const flicker = (): Animated.CompositeAnimation => {
    const shouldFlicker = Math.random() < 0.6;

    if (shouldFlicker) {
      const dipDepth = rand(0.3, 0.7);
      const dipDuration = rand(40, 100);
      const recoveryDuration = rand(60, 150);
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

      sequence.push(
        Animated.timing(anim, {
          toValue: 1,
          duration: rand(800, 3000),
          useNativeDriver: true,
        }),
      );

      return Animated.sequence(sequence);
    } else {
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

  const loop = (): void => {
    if (stopped) return;
    flicker().start(({ finished }) => {
      if (finished && !stopped) loop();
    });
  };

  return {
    start: () => {
      stopped = false;
      loop();
    },
    stop: () => {
      stopped = true;
      anim.stopAnimation();
    },
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
  interactive = true,
  style,
  textStyle,
}: NeonTextProps) {
  const glow = glowColor || color;
  const config = GLOW_CONFIGS[intensity];
  const displayText = uppercase ? children.toUpperCase() : children;
  const flickerAnim = useRef(new Animated.Value(1)).current;
  const ambientRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const burstingRef = useRef(false);

  useEffect(() => {
    if (!flicker) return;

    const delay = Math.random() * 800;
    const timeout = setTimeout(() => {
      ambientRef.current = createFlickerSequence(flickerAnim);
      ambientRef.current.start();
    }, delay);

    return () => {
      clearTimeout(timeout);
      ambientRef.current?.stop();
    };
  }, [flicker]);

  const handlePress = useCallback(() => {
    if (!interactive || burstingRef.current) return;

    burstingRef.current = true;
    haptics.light();

    // Stop ambient, run burst, then resume ambient
    ambientRef.current?.stop();
    triggerBurst(flickerAnim, () => {
      burstingRef.current = false;
      if (flicker) {
        ambientRef.current = createFlickerSequence(flickerAnim);
        ambientRef.current.start();
      }
    });
  }, [interactive, flicker]);

  const textShadowOffset = { width: 0, height: 0 };

  const content = (
    <View style={[styles.container, style]}>
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

  const animatedContent = flicker ? (
    <Animated.View style={{ opacity: flickerAnim }}>{content}</Animated.View>
  ) : (
    content
  );

  if (interactive) {
    return <Pressable onPress={handlePress}>{animatedContent}</Pressable>;
  }

  return animatedContent;
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