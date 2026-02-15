import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { WatchEntry } from '../services/api';
import { getTMDBPosterUrl } from '../services/api';
import AnimatedPressable from './AnimatedPressable';

interface WatchCardProps {
  entry: WatchEntry;
  onPress?: () => void;
}

export default function WatchCard({ entry, onPress }: WatchCardProps) {
  const theme = useTheme();
  const { content, rating, watchedAt } = entry;
  
  const posterUrl = getTMDBPosterUrl(content.posterPath);
  const watchDate = new Date(watchedAt).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric' 
  });

  return (
    <AnimatedPressable onPress={onPress}>
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.posterContainer}>
          {posterUrl ? (
            <Image 
              source={{ uri: posterUrl }} 
              style={styles.poster}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.posterPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
              <MaterialCommunityIcons 
                name="filmstrip" 
                size={40} 
                color={theme.colors.onSurfaceVariant} 
              />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text 
            variant="titleMedium" 
            numberOfLines={2}
            style={{ color: theme.colors.onSurface, fontFamily: 'BebasNeue_400Regular', fontSize: 18 }}
          >
            {content.title}
          </Text>
          
          <View style={styles.metadata}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {content.releaseYear || 'N/A'} • {content.type === 'MOVIE' ? 'Movie' : 'TV Show'}
            </Text>
          </View>

          {rating && (
            <View style={styles.rating}>
              <MaterialCommunityIcons 
                name="star" 
                size={16} 
                color={theme.colors.primary} 
              />
              <Text 
                variant="bodyMedium" 
                style={{ color: theme.colors.primary, marginLeft: 4, fontWeight: 'bold' }}
              >
                {rating}/10
              </Text>
            </View>
          )}

          <Text 
            variant="bodySmall" 
            style={{ color: theme.colors.onSurfaceVariant, marginTop: 4, fontFamily: 'VT323_400Regular' }}
          >
            Watched: {watchDate}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  posterContainer: {
    width: 80,
    height: 120,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  metadata: {
    marginTop: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});