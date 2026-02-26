import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { FilmStripIcon, PlusCircleIcon, CheckCircleIcon } from 'phosphor-react-native';
import { TouchableOpacity } from 'react-native';
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
  isWatched?: boolean;
}

export default function SearchResultCard({ result, onPress, onQuickAdd, isWatched = false }: SearchResultCardProps) {
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
    <AnimatedPressable onPress={isWatched ? undefined : onPress}>
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.posterContainer}>
          {posterUrl ? (
            <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={[styles.posterPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
              <FilmStripIcon size={30} color={theme.colors.onSurfaceVariant} weight="thin" />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text
            numberOfLines={2}
            style={{ color: theme.colors.onSurface, fontFamily: 'Righteous_400Regular', fontSize: 16 }}
          >
            {title}
          </Text>
          <Text
            style={{ color: theme.colors.onSurfaceVariant, fontFamily: 'SpaceMono_400Regular', fontSize: 12, marginTop: 4 }}
          >
            {year || 'N/A'} • {mediaType === 'movie' ? 'Movie' : 'TV Show'}
          </Text>
          {isWatched && (
            <Text style={{ color: '#4CAF50', fontFamily: 'SpaceMono_400Regular', fontSize: 11, marginTop: 4 }}>
              In your collection
            </Text>
          )}
        </View>

        {/* Watched indicator or add button */}
        {isWatched ? (
          <View style={styles.addButton}>
            <CheckCircleIcon size={28} color="#4CAF50" weight="fill" />
          </View>
        ) : onQuickAdd ? (
          <TouchableOpacity
            onPress={onQuickAdd}
            style={styles.addButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <PlusCircleIcon size={28} color={theme.colors.primary} weight="fill" />
          </TouchableOpacity>
        ) : null}
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
  posterContainer: { width: 60, height: 90 },
  poster: { width: '100%', height: '100%' },
  posterPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  addButton: { paddingRight: 12 },
});
