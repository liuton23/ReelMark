import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import {
  FilmSlateIcon,
  PopcornIcon,
  TelevisionIcon,
  StarIcon,
  HeartIcon,
  CalendarCheckIcon,
  CalendarBlankIcon,
  NewspaperIcon,
} from 'phosphor-react-native';
import { apiService, UserStats } from '../services/api';
import StatCard from '../components/StatCard';

export default function HomeScreen() {
  const theme = useTheme();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await apiService.getUserStats();
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
  const monthChangeText =
    monthChange > 0
      ? `↑ ${monthChange} more than last month`
      : monthChange < 0
        ? `↓ ${Math.abs(monthChange)} fewer than last month`
        : 'Same as last month';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TelevisionIcon size={48} color={theme.colors.primary} weight="duotone" />
        <Text
          style={{
            color: theme.colors.onSurface,
            fontFamily: 'Righteous_400Regular',
            fontSize: 30,
            marginTop: 12,
            letterSpacing: 4,
          }}
        >
          YOUR STATS
        </Text>
        <Text
          style={{
            color: theme.colors.onSurfaceVariant,
            fontFamily: 'SpaceMono_400Regular',
            fontSize: 11,
            marginTop: 4,
          }}
        >
          Your personal video store dashboard
        </Text>
      </View>

      {/* ── COLLECTION ── */}
      <SectionLabel label="COLLECTION" theme={theme} />

      {/* Row 1: Total Watched — full width, primary hero */}
      <View style={styles.row}>
        <StatCard
          icon={FilmSlateIcon}
          label="Total Watched"
          value={stats.totalWatched}
          variant="primary"
        />
      </View>

      {/* Row 2: Movies | TV Shows */}
      <View style={[styles.row, styles.twoCol]}>
        <View style={styles.col}>
          <StatCard
            icon={PopcornIcon}
            label="Movies"
            value={stats.movies}
            variant="secondary"
          />
        </View>
        <View style={styles.col}>
          <StatCard
            icon={TelevisionIcon}
            label="TV Shows"
            value={stats.tvShows}
            variant="secondary"
          />
        </View>
      </View>

      {/* Row 3: Avg Rating | Fav Genre */}
      {(stats.averageRating != null || stats.favoriteGenre) && (
        <View style={[styles.row, styles.twoCol]}>
          {stats.averageRating != null && (
            <View style={styles.col}>
              <StatCard
                icon={StarIcon}
                label="Avg Rating"
                value={`${stats.averageRating}/10`}
                variant="secondary"
              />
            </View>
          )}
          {stats.favoriteGenre && (
            <View style={styles.col}>
              <StatCard
                icon={HeartIcon}
                label="Fav Genre"
                value={stats.favoriteGenre}
                variant="secondary"
              />
            </View>
          )}
        </View>
      )}

      {/* ── ACTIVITY ── */}
      <SectionLabel label="ACTIVITY" theme={theme} />

      {/* This Month — full width, primary */}
      <View style={styles.row}>
        <StatCard
          icon={CalendarCheckIcon}
          label="This Month"
          value={stats.thisMonth}
          subtitle={monthChangeText}
          variant="primary"
        />
      </View>

      {/* Last Month — secondary */}
      <View style={styles.row}>
        <StatCard
          icon={CalendarBlankIcon}
          label="Last Month"
          value={stats.lastMonth}
          variant="secondary"
        />
      </View>

      {/* ── Coming Soon ── */}
      <View
        style={[
          styles.comingSoon,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: theme.colors.outline,
          },
        ]}
      >
        <NewspaperIcon size={40} color={theme.colors.onSurfaceVariant} weight="duotone" />
        <Text
          style={{
            color: theme.colors.onSurface,
            fontFamily: 'Righteous_400Regular',
            fontSize: 16,
            marginTop: 12,
            letterSpacing: 1,
          }}
        >
          ENTERTAINMENT NEWS
        </Text>
        <Text
          style={{
            color: theme.colors.onSurfaceVariant,
            marginTop: 8,
            textAlign: 'center',
            fontSize: 13,
          }}
        >
          Personalized news based on your watch history
        </Text>
        <Text
          style={{
            color: theme.colors.primary,
            marginTop: 10,
            fontFamily: 'SpaceMono_400Regular',
            fontSize: 10,
            letterSpacing: 1.5,
          }}
        >
          COMING SOON
        </Text>
      </View>
    </ScrollView>
  );
}

function SectionLabel({ label, theme }: { label: string; theme: any }) {
  return (
    <View style={styles.sectionLabelRow}>
      <View style={[styles.sectionLine, { backgroundColor: theme.colors.outline }]} />
      <Text style={[styles.sectionLabelText, { color: theme.colors.onSurfaceVariant }]}>
        {label}
      </Text>
      <View style={[styles.sectionLine, { backgroundColor: theme.colors.outline }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 28 },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 8,
  },
  sectionLine: { flex: 1, height: 1 },
  sectionLabelText: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    letterSpacing: 2,
    marginHorizontal: 10,
  },
  row: { marginBottom: 10 },
  twoCol: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  comingSoon: {
    padding: 32,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
});