import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AnimatedPressable from './AnimatedPressable';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  media_type?: string;
}

interface SearchResultCardProps {
  result: SearchResult;
  onPress: () => void;
  onQuickAdd?: () => void;
}

export default function SearchResultCard({ result, onPress, onQuickAdd }: SearchResultCardProps) {
  const theme = useTheme();
  
  const title = result.title || result.name || 'Unknown';
  const year = result.release_date 
    ? new Date(result.release_date).getFullYear()
    : result.first_air_date 
    ? new Date(result.first_air_date).getFullYear()
    : null;
  
  const posterUrl = result.poster_path
    ? `https://image.tmdb.org/t/p/w185${result.poster_path}`
    : null;

  const mediaType = result.media_type || (result.title ? 'movie' : 'tv');

  return (
    <AnimatedPressable onPress={onPress}>
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        {/* Poster */}
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
                size={30} 
                color={theme.colors.onSurfaceVariant} 
              />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text 
            variant="titleMedium" 
            numberOfLines={2}
            style={{ color: theme.colors.onSurface, fontFamily: 'Righteous_400Regular', fontSize: 16 }}
          >
            {title}
          </Text>
          
          <View style={styles.metadata}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontFamily: 'SpaceMono_400Regular' }}>
              {year || 'N/A'} • {mediaType === 'movie' ? 'Movie' : 'TV Show'}
            </Text>
          </View>
        </View>

        {/* Quick Add Button */}
        {onQuickAdd && (
          <IconButton
            icon="plus-circle"
            iconColor={theme.colors.primary}
            size={28}
            onPress={(e) => {
              e.stopPropagation();
              onQuickAdd();
            }}
          />
        )}
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
    alignItems: 'center',
  },
  posterContainer: {
    width: 60,
    height: 90,
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
    justifyContent: 'center',
  },
  metadata: {
    marginTop: 4,
  },
});