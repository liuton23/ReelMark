import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import { Text, useTheme, Searchbar } from 'react-native-paper';
import { apiService } from '../services/api';
import SearchResultCard from '../components/SearchResultCard';
import QuickAddSheet from '../components/QuickAddSheet';
import { haptics } from '../utils/haptics';
import Toast from 'react-native-toast-message';

export default function SearchScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  // Quick add sheet
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    
    try {
      const data = await apiService.searchMulti(searchQuery);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (result: any) => {
    setSelectedItem(result);
    setSheetVisible(true);
    Keyboard.dismiss();
  };

  const handleSubmitAdd = async (rating: number | undefined, notes: string) => {
    if (!selectedItem) return;

    try {
      // media_type comes from the /search/multi response
      const contentType = selectedItem.media_type === 'tv' ? 'tv' : 'movie';
      await apiService.addWatchEntry({
        tmdbId: selectedItem.id,
        contentType,
        rating,
        notes: notes || undefined,
      });

      setSheetVisible(false);
      setSelectedItem(null);
      
      haptics.success();
      Toast.show({
        type: 'success',
        text1: 'Added to Collection!',
        text2: `${selectedItem.title || selectedItem.name} has been logged`,
        position: 'bottom',
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error('Error adding entry:', error);
      haptics.error();
      Toast.show({
        type: 'error',
        text1: 'Failed to Add',
        text2: 'Please try again',
        position: 'bottom',
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search movies & shows..."
          onChangeText={(text) => {
            setQuery(text);
            handleSearch(text);
          }}
          value={query}
          style={{ backgroundColor: theme.colors.surface }}
          inputStyle={{ fontFamily: 'SpaceMono_400Regular', fontSize: 16 }}
          iconColor={theme.colors.primary}
        />
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ color: theme.colors.onSurface, marginTop: 16 }}>
            Searching...
          </Text>
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text 
            variant="titleLarge" 
            style={{ color: theme.colors.onSurface, fontFamily: 'BebasNeue_400Regular', marginBottom: 8 }}
          >
            NO TAPES FOUND
          </Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Try searching for something else
          </Text>
        </View>
      ) : !searched ? (
        <View style={styles.centerContainer}>
          <Text 
            variant="titleLarge" 
            style={{ color: theme.colors.onSurface, fontFamily: 'Righteous_400Regular', marginBottom: 8 }}
          >
            BROWSE THE STORE
          </Text>
          <Text style={{ color: theme.colors.onSurfaceVariant, fontFamily: 'SpaceMono_400Regular', textAlign: 'center' }}>
            Search for movies and TV shows
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.media_type}-${item.id}`}
          renderItem={({ item }) => (
            <SearchResultCard
              result={item}
              onPress={() => handleQuickAdd(item)}
              onQuickAdd={() => handleQuickAdd(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Quick Add Sheet */}
      <QuickAddSheet
        visible={sheetVisible}
        onClose={() => {
          setSheetVisible(false);
          setSelectedItem(null);
        }}
        onSubmit={handleSubmitAdd}
        movieTitle={selectedItem?.title || selectedItem?.name || ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
});