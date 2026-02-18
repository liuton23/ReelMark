import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Card, Button } from 'react-native-paper';
import { UserSoundIcon, PlusCircleIcon } from 'phosphor-react-native';
import type { Recommendation } from '../services/api';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAddToWatchlist?: () => void;
}

export default function RecommendationCard({ recommendation, onAddToWatchlist }: RecommendationCardProps) {
  const theme = useTheme();

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.header}>
          <UserSoundIcon size={32} color={theme.colors.primary} weight="duotone" />
          <Text
            style={{
              color: theme.colors.primary,
              fontFamily: 'SpaceMono_400Regular',
              fontSize: 14,
              marginLeft: 8,
            }}
          >
            The Clerk Recommends:
          </Text>
        </View>

        <Text
          style={{
            color: theme.colors.onSurface,
            fontFamily: "Righteous_400Regular",
            fontSize: 28,
            marginTop: 16,
            marginBottom: 4,
          }}
        >
          {recommendation.title}
        </Text>

        <Text
          style={{
            color: theme.colors.onSurfaceVariant,
            fontFamily: 'SpaceMono_400Regular',
            marginBottom: 16,
          }}
        >
          {recommendation.year} • {recommendation.type === 'movie' ? 'Movie' : 'TV Show'}
        </Text>

        <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

        <Text
          style={{
            color: theme.colors.primary,
            fontFamily: 'SpaceMono_400Regular',
            fontSize: 13,
            marginBottom: 8,
            marginTop: 16,
          }}
        >
          Why you'll like it:
        </Text>
        <Text style={{ color: theme.colors.onSurface, lineHeight: 22 }}>
          {recommendation.reason}
        </Text>

        {onAddToWatchlist && (
          <Button
            mode="contained"
            onPress={onAddToWatchlist}
            style={styles.button}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
            labelStyle={{ fontFamily: 'Righteous_400Regular', fontSize: 13, letterSpacing: 1 }}
            icon={() => <PlusCircleIcon size={16} color={theme.colors.onPrimary} weight="fill" />}
          >
            ADD TO WATCHLIST
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, elevation: 4 },
  header: { flexDirection: 'row', alignItems: 'center' },
  divider: { height: 2, width: '100%' },
  button: { marginTop: 20 },
});