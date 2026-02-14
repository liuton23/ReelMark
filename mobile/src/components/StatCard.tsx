import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtitle?: string;
}

export default function StatCard({ icon, label, value, subtitle }: StatCardProps) {
  const theme = useTheme();

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        <MaterialCommunityIcons 
          name={icon as any} 
          size={32} 
          color={theme.colors.primary} 
        />
        <View style={styles.textContainer}>
          <Text 
            variant="headlineMedium"
            style={{ 
              color: theme.colors.onSurface,
              fontFamily: 'BebasNeue_400Regular',
              fontSize: 28,
            }}
          >
            {value}
          </Text>
          <Text 
            variant="bodySmall"
            style={{ 
              color: theme.colors.onSurfaceVariant,
              fontFamily: 'VT323_400Regular',
              fontSize: 14,
            }}
          >
            {label}
          </Text>
          {subtitle && (
            <Text 
              variant="bodySmall"
              style={{ 
                color: theme.colors.primary,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
});