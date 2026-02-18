import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { IconProps } from 'phosphor-react-native';

interface StatCardProps {
  icon: React.FC<IconProps>;
  label: string;
  value: string | number;
  subtitle?: string;
  /** 'primary' = hero card (larger, fill weight), 'secondary' = supporting stat (smaller, regular weight) */
  variant?: 'primary' | 'secondary';
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  variant = 'secondary',
}: StatCardProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
      ]}
    >
      <Icon
        size={isPrimary ? 30 : 24}
        color={theme.colors.primary}
        weight={isPrimary ? 'fill' : 'regular'}
      />
      <View style={styles.textContainer}>
        <Text
          numberOfLines={1}
          style={[
            styles.value,
            {
              color: theme.colors.onSurface,
              fontSize: isPrimary ? 32 : 22,
            },
          ]}
        >
          {value}
        </Text>
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          {label}
        </Text>
        {subtitle && (
          <Text
            style={[styles.subtitle, { color: theme.colors.primary }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    gap: 14,
  },
  textContainer: {
    flex: 1,
  },
  value: {
    fontFamily: 'Righteous_400Regular',
    lineHeight: 36,
  },
  label: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  subtitle: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    marginTop: 4,
  },
});