import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { FilmStripIcon, StarIcon } from 'phosphor-react-native';
import type { WatchEntry } from '../services/api';
import { getTMDBPosterUrl } from '../services/api';
import AnimatedPressable from './AnimatedPressable';
import { LinearGradient } from 'expo-linear-gradient';

interface WatchCardProps {
  entry: WatchEntry;
  onPress?: () => void;
}

const CARD_WIDTH = (Dimensions.get('window').width - 16 * 2 - 12) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

export default function WatchCard({ entry, onPress }: WatchCardProps) {
  const theme = useTheme();
  const { content, rating } = entry;
  const posterUrl = getTMDBPosterUrl(content.posterPath);

  return (
    <AnimatedPressable onPress={onPress}>
      <View style={[styles.card, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
        {posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: theme.colors.surfaceVariant }]}>
            <FilmStripIcon size={48} color={theme.colors.onSurfaceVariant} weight="thin" />
          </View>
        )}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.85)']}
          locations={[0.3, 0.6, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {content.type === 'MOVIE' ? '🎬' : '📺'}
          </Text>
        </View>

        <View style={styles.infoOverlay}>
          <Text numberOfLines={2} style={styles.title}>
            {content.title}
          </Text>
          <View style={styles.meta}>
            <Text style={styles.year}>{content.releaseYear ?? '—'}</Text>
            {rating !== null && rating !== undefined && (
              <View style={styles.ratingPill}>
                <StarIcon size={11} color="#FFD700" weight="fill" />
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  typeBadgeText: { fontSize: 12 },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 4,
  },
  title: {
    fontFamily: 'Righteous_400Regular',
    fontSize: 13,
    lineHeight: 17,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  year: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  ratingText: {
    fontFamily: 'Righteous_400Regular',
    fontSize: 11,
    color: '#FFD700',
  },
});