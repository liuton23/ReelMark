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