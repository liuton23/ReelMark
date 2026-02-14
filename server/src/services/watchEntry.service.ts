import { prisma } from '../config/database';

// Create a watch entry
export const createWatchEntry = async (
  userId: string,
  contentId: string,
  rating?: number,
  notes?: string,
  season?: number,
  episode?: number,
  watchedAt?: Date
) => {
  try {
    const watchEntry = await prisma.watchEntry.create({
      data: {
        userId,
        contentId,
        rating,
        notes,
        season,
        episode,
        watchedAt: watchedAt || new Date(),
      },
      include: {
        content: true, // Include the content details in response
        user: true,
      },
    });
    
    console.log('✨ Created watch entry for:', watchEntry.content.title);
    return watchEntry;
  } catch (error) {
    console.error('Error creating watch entry:', error);
    throw error;
  }
};

// Get all watch entries for a user
export const getUserWatchHistory = async (userId: string) => {
  try {
    const watchHistory = await prisma.watchEntry.findMany({
      where: { userId },
      include: {
        content: true,
      },
      orderBy: {
        watchedAt: 'desc', // Most recent first
      },
    });
    return watchHistory;
  } catch (error) {
    console.error('Error fetching watch history:', error);
    throw error;
  }
};

// Get a specific watch entry by ID
export const getWatchEntryById = async (entryId: string) => {
  try {
    const entry = await prisma.watchEntry.findUnique({
      where: { id: entryId },
      include: {
        content: true,
        user: true,
      },
    });
    return entry;
  } catch (error) {
    console.error('Error fetching watch entry:', error);
    throw error;
  }
};

// Update a watch entry (edit rating/notes)
export const updateWatchEntry = async (
  entryId: string,
  rating?: number,
  notes?: string
) => {
  try {
    const updated = await prisma.watchEntry.update({
      where: { id: entryId },
      data: {
        rating,
        notes,
      },
      include: {
        content: true,
      },
    });
    
    console.log('✏️ Updated watch entry for:', updated.content.title);
    return updated;
  } catch (error) {
    console.error('Error updating watch entry:', error);
    throw error;
  }
};

// Delete a watch entry
export const deleteWatchEntry = async (entryId: string) => {
  try {
    await prisma.watchEntry.delete({
      where: { id: entryId },
    });
    
    console.log('🗑️ Deleted watch entry');
    return true;
  } catch (error) {
    console.error('Error deleting watch entry:', error);
    throw error;
  }
};

// Get watch entries for specific content
export const getWatchEntriesForContent = async (contentId: string) => {
  try {
    const entries = await prisma.watchEntry.findMany({
      where: { contentId },
      include: {
        user: true,
      },
      orderBy: {
        watchedAt: 'desc',
      },
    });
    return entries;
  } catch (error) {
    console.error('Error fetching watch entries for content:', error);
    throw error;
  }
};

export const getUserStats = async (userId: string) => {
  try {
    const watchHistory = await prisma.watchEntry.findMany({
      where: { userId },
      include: {
        content: true,
      },
    });

    // Total watched
    const totalWatched = watchHistory.length;

    // By type
    const movies = watchHistory.filter(e => e.content.type === 'MOVIE').length;
    const tvShows = watchHistory.filter(e => e.content.type === 'TV_SHOW').length;

    // Average rating (only entries with ratings)
    const rated = watchHistory.filter(e => e.rating !== null);
    const avgRating = rated.length > 0
      ? rated.reduce((sum, e) => sum + (e.rating || 0), 0) / rated.length
      : null;

    // This month's activity
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = watchHistory.filter(e => 
      new Date(e.watchedAt) >= startOfMonth
    ).length;

    // Last month's activity
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonth = watchHistory.filter(e => {
      const watchDate = new Date(e.watchedAt);
      return watchDate >= startOfLastMonth && watchDate <= endOfLastMonth;
    }).length;

    // Favorite genre (most common)
    const genreCounts: Record<string, number> = {};
    watchHistory.forEach(entry => {
      entry.content.genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
    const favoriteGenre = Object.keys(genreCounts).length > 0
      ? Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    return {
      totalWatched,
      movies,
      tvShows,
      averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      thisMonth,
      lastMonth,
      favoriteGenre,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};