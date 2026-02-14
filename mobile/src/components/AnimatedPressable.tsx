import React, { useRef } from 'react';
import { Pressable, Animated, PressableProps, ViewStyle } from 'react-native';
import { haptics } from '../utils/haptics';

interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode;
  scaleValue?: number;
  haptic?: boolean;
  style?: ViewStyle;
}

export default function AnimatedPressable({ 
  children, 
  scaleValue = 0.97,
  haptic = true,
  onPress,
  style,
  ...props 
}: AnimatedPressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (haptic) {
      haptics.light();
    }
    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={style}
      {...props}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}