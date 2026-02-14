import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService, UserStats } from '../services/api';
import StatCard from '../components/StatCard';

const DEFAULT_USER_ID = '572bc43f-b148-4a6a-9ce3-e929b152fa57';

export default function HomeScreen() {
  const theme = useTheme();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await apiService.getUserStats(DEFAULT_USER_ID);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error }}>Failed to load stats</Text>
      </View>
    );
  }

  const monthChange = stats.thisMonth - stats.lastMonth;
  const monthChangeText = monthChange > 0 
    ? `↑ ${monthChange} more than last month`
    : monthChange < 0
    ? `↓ ${Math.abs(monthChange)} fewer than last month`
    : 'Same as last month';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name="television-classic" 
          size={48} 
          color={theme.colors.primary} 
        />
        <Text 
          variant="headlineLarge"
          style={{ 
            color: theme.colors.onSurface,
            fontFamily: 'BebasNeue_400Regular',
            fontSize: 36,
            marginTop: 12,
            letterSpacing: 3,
          }}
        >
          YOUR STATS
        </Text>
        <Text 
          variant="bodyMedium"
          style={{ 
            color: theme.colors.onSurfaceVariant,
            marginTop: 4,
          }}
        >
          Your personal video store dashboard
        </Text>
      </View>

      {/* Main Stats */}
      <View style={styles.section}>
        <Text 
          variant="titleMedium"
          style={{ 
            color: theme.colors.onSurface,
            fontFamily: 'BebasNeue_400Regular',
            fontSize: 20,
            marginBottom: 12,
            letterSpacing: 1,
          }}
        >
          COLLECTION
        </Text>
        
        <StatCard
          icon="movie-open"
          label="TOTAL WATCHED"
          value={stats.totalWatched}
        />

        <View style={styles.row}>
          <View style={styles.halfCard}>
            <StatCard
              icon="film"
              label="MOVIES"
              value={stats.movies}
            />
          </View>
          <View style={styles.halfCard}>
            <StatCard
              icon="television"
              label="TV SHOWS"
              value={stats.tvShows}
            />
          </View>
        </View>

        {stats.averageRating && (
          <StatCard
            icon="star"
            label="AVERAGE RATING"
            value={`${stats.averageRating}/10`}
          />
        )}

        {stats.favoriteGenre && (
          <StatCard
            icon="heart"
            label="FAVORITE GENRE"
            value={stats.favoriteGenre}
          />
        )}
      </View>

      {/* Activity */}
      <View style={styles.section}>
        <Text 
          variant="titleMedium"
          style={{ 
            color: theme.colors.onSurface,
            fontFamily: 'BebasNeue_400Regular',
            fontSize: 20,
            marginBottom: 12,
            letterSpacing: 1,
          }}
        >
          ACTIVITY
        </Text>

        <StatCard
          icon="calendar-month"
          label="THIS MONTH"
          value={stats.thisMonth}
          subtitle={monthChangeText}
        />

        <StatCard
          icon="calendar-clock"
          label="LAST MONTH"
          value={stats.lastMonth}
        />
      </View>

      {/* Coming Soon Placeholder */}
      <View style={[styles.comingSoon, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons 
          name="newspaper-variant-outline" 
          size={40} 
          color={theme.colors.onSurfaceVariant} 
        />
        <Text 
          variant="titleMedium"
          style={{ 
            color: theme.colors.onSurface,
            fontFamily: 'BebasNeue_400Regular',
            marginTop: 12,
          }}
        >
          ENTERTAINMENT NEWS
        </Text>
        <Text 
          variant="bodyMedium"
          style={{ 
            color: theme.colors.onSurfaceVariant,
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          Personalized news based on your watch history
        </Text>
        <Text 
          variant="bodySmall"
          style={{ 
            color: theme.colors.primary,
            marginTop: 8,
            fontFamily: 'VT323_400Regular',
          }}
        >
          COMING SOON
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
  },
  comingSoon: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
});