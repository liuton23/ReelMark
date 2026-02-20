jest.mock('../../../config/database');

import { prisma } from '../../../config/database';
import {
  createWatchEntry,
  getUserWatchHistory,
  getWatchEntryById,
  updateWatchEntry,
  deleteWatchEntry,
  getWatchEntriesForContent,
  getUserStats,
} from '../../../services/watchEntry.service';

const mockPrisma = prisma as jest.MockedObjectDeep<typeof prisma>;

const mockContent = {
  id: 'content-uuid-1',
  tmdbId: 550,
  type: 'MOVIE' as const,
  title: 'Fight Club',
  releaseYear: 1999,
  posterPath: '/poster.jpg',
  genres: ['Drama'],
  overview: 'A movie.',
  runtime: 139,
  showType: null,
  numberOfSeasons: null,
  numberOfEpisodes: null,
  episodeRuntime: null,
  createdAt: new Date('2025-01-01'),
};

const mockUser = {
  id: 'user-uuid-1',
  username: 'testuser',
  email: null,
  createdAt: new Date('2025-01-01'),
};

const mockWatchEntry = {
  id: 'entry-uuid-1',
  userId: 'user-uuid-1',
  contentId: 'content-uuid-1',
  watchedAt: new Date('2025-06-01'),
  rating: 9,
  notes: 'Great movie!',
  season: null,
  episode: null,
  createdAt: new Date('2025-06-01'),
  updatedAt: new Date('2025-06-01'),
  content: mockContent,
  user: mockUser,
};

describe('WatchEntry Service', () => {
  describe('createWatchEntry', () => {
    it('should create a watch entry with all fields', async () => {
      mockPrisma.watchEntry.create.mockResolvedValue(mockWatchEntry);

      const watchDate = new Date('2025-06-01');
      const result = await createWatchEntry(
        'user-uuid-1',
        'content-uuid-1',
        9,
        'Great movie!',
        undefined,
        undefined,
        watchDate
      );

      expect(mockPrisma.watchEntry.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-uuid-1',
          contentId: 'content-uuid-1',
          rating: 9,
          notes: 'Great movie!',
          season: undefined,
          episode: undefined,
          watchedAt: watchDate,
        },
        include: {
          content: true,
          user: true,
        },
      });
      expect(result).toEqual(mockWatchEntry);
    });

    it('should create a watch entry with default date when not provided', async () => {
      mockPrisma.watchEntry.create.mockResolvedValue(mockWatchEntry);

      await createWatchEntry('user-uuid-1', 'content-uuid-1');

      expect(mockPrisma.watchEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          watchedAt: expect.any(Date),
        }),
        include: {
          content: true,
          user: true,
        },
      });
    });

    it('should create a TV watch entry with season and episode', async () => {
      const tvEntry = { ...mockWatchEntry, season: 1, episode: 5 };
      mockPrisma.watchEntry.create.mockResolvedValue(tvEntry);

      const result = await createWatchEntry(
        'user-uuid-1',
        'content-uuid-1',
        8,
        'Good episode',
        1,
        5
      );

      expect(mockPrisma.watchEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          season: 1,
          episode: 5,
        }),
        include: {
          content: true,
          user: true,
        },
      });
      expect(result.season).toBe(1);
      expect(result.episode).toBe(5);
    });

    it('should throw on database error', async () => {
      mockPrisma.watchEntry.create.mockRejectedValue(new Error('DB error'));

      await expect(
        createWatchEntry('user-uuid-1', 'content-uuid-1')
      ).rejects.toThrow('DB error');
    });
  });

  describe('getUserWatchHistory', () => {
    it('should return sorted watch history for user', async () => {
      const entries = [mockWatchEntry, { ...mockWatchEntry, id: 'entry-2' }];
      mockPrisma.watchEntry.findMany.mockResolvedValue(entries);

      const result = await getUserWatchHistory('user-uuid-1');

      expect(mockPrisma.watchEntry.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        include: { content: true },
        orderBy: { watchedAt: 'desc' },
      });
      expect(result).toEqual(entries);
      expect(result).toHaveLength(2);
    });

    it('should return empty array for user with no history', async () => {
      mockPrisma.watchEntry.findMany.mockResolvedValue([]);

      const result = await getUserWatchHistory('user-uuid-1');

      expect(result).toEqual([]);
    });

    it('should throw on database error', async () => {
      mockPrisma.watchEntry.findMany.mockRejectedValue(new Error('DB error'));

      await expect(getUserWatchHistory('user-uuid-1')).rejects.toThrow('DB error');
    });
  });

  describe('getWatchEntryById', () => {
    it('should return watch entry when found and owned by user', async () => {
      mockPrisma.watchEntry.findFirst.mockResolvedValue(mockWatchEntry);

      const result = await getWatchEntryById('entry-uuid-1', 'user-uuid-1');

      expect(mockPrisma.watchEntry.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'entry-uuid-1',
          userId: 'user-uuid-1',
        },
        include: { content: true, user: true },
      });
      expect(result).toEqual(mockWatchEntry);
    });

    it('should return null when not found or not owned', async () => {
      mockPrisma.watchEntry.findFirst.mockResolvedValue(null);

      const result = await getWatchEntryById('nonexistent', 'user-uuid-1');

      expect(result).toBeNull();
    });

    it('should throw on database error', async () => {
      mockPrisma.watchEntry.findFirst.mockRejectedValue(new Error('DB error'));

      await expect(getWatchEntryById('id', 'user-id')).rejects.toThrow('DB error');
    });
  });

  describe('updateWatchEntry', () => {
    it('should update rating and notes when entry is owned by user', async () => {
      const updated = { ...mockWatchEntry, rating: 10, notes: 'Updated!' };
      mockPrisma.watchEntry.findFirst.mockResolvedValue(mockWatchEntry);
      mockPrisma.watchEntry.update.mockResolvedValue(updated);

      const result = await updateWatchEntry('entry-uuid-1', 'user-uuid-1', 10, 'Updated!');

      expect(mockPrisma.watchEntry.findFirst).toHaveBeenCalledWith({
        where: { id: 'entry-uuid-1', userId: 'user-uuid-1' },
      });
      expect(mockPrisma.watchEntry.update).toHaveBeenCalledWith({
        where: { id: 'entry-uuid-1' },
        data: { rating: 10, notes: 'Updated!' },
        include: { content: true },
      });
      expect(result!.rating).toBe(10);
      expect(result!.notes).toBe('Updated!');
    });

    it('should return null when entry not found or not owned', async () => {
      mockPrisma.watchEntry.findFirst.mockResolvedValue(null);

      const result = await updateWatchEntry('entry-uuid-1', 'wrong-user-id', 10);

      expect(mockPrisma.watchEntry.update).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should throw on database error', async () => {
      mockPrisma.watchEntry.findFirst.mockRejectedValue(new Error('DB error'));

      await expect(updateWatchEntry('id', 'user-id', 5)).rejects.toThrow('DB error');
    });
  });

  describe('deleteWatchEntry', () => {
    it('should delete and return true when owned by user', async () => {
      mockPrisma.watchEntry.findFirst.mockResolvedValue(mockWatchEntry);
      mockPrisma.watchEntry.delete.mockResolvedValue(mockWatchEntry);

      const result = await deleteWatchEntry('entry-uuid-1', 'user-uuid-1');

      expect(mockPrisma.watchEntry.findFirst).toHaveBeenCalledWith({
        where: { id: 'entry-uuid-1', userId: 'user-uuid-1' },
      });
      expect(mockPrisma.watchEntry.delete).toHaveBeenCalledWith({
        where: { id: 'entry-uuid-1' },
      });
      expect(result).toBe(true);
    });

    it('should return false when entry not found or not owned', async () => {
      mockPrisma.watchEntry.findFirst.mockResolvedValue(null);

      const result = await deleteWatchEntry('entry-uuid-1', 'wrong-user-id');

      expect(mockPrisma.watchEntry.delete).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should throw on database error', async () => {
      mockPrisma.watchEntry.findFirst.mockRejectedValue(new Error('DB error'));

      await expect(deleteWatchEntry('id', 'user-id')).rejects.toThrow('DB error');
    });
  });

  describe('getWatchEntriesForContent', () => {
    it('should return entries for specific content scoped to user', async () => {
      const entries = [mockWatchEntry];
      mockPrisma.watchEntry.findMany.mockResolvedValue(entries);

      const result = await getWatchEntriesForContent('content-uuid-1', 'user-uuid-1');

      expect(mockPrisma.watchEntry.findMany).toHaveBeenCalledWith({
        where: {
          contentId: 'content-uuid-1',
          userId: 'user-uuid-1',
        },
        orderBy: { watchedAt: 'desc' },
      });
      expect(result).toEqual(entries);
    });

    it('should return empty array when no entries', async () => {
      mockPrisma.watchEntry.findMany.mockResolvedValue([]);

      const result = await getWatchEntriesForContent('content-uuid-1', 'user-uuid-1');

      expect(result).toEqual([]);
    });

    it('should throw on database error', async () => {
      mockPrisma.watchEntry.findMany.mockRejectedValue(new Error('DB error'));

      await expect(getWatchEntriesForContent('id', 'user-id')).rejects.toThrow('DB error');
    });
  });

  describe('getUserStats', () => {
    it('should return correct stats for user with entries', async () => {
      const now = new Date();
      const entries = [
        { ...mockWatchEntry, content: { ...mockContent, type: 'MOVIE' as const, genres: ['Drama'] }, rating: 8, watchedAt: now },
        { ...mockWatchEntry, id: 'e2', content: { ...mockContent, type: 'TV_SHOW' as const, genres: ['Drama', 'Crime'] }, rating: 10, watchedAt: now },
        { ...mockWatchEntry, id: 'e3', content: { ...mockContent, type: 'MOVIE' as const, genres: ['Drama'] }, rating: null, watchedAt: new Date('2020-01-01') },
      ];
      mockPrisma.watchEntry.findMany.mockResolvedValue(entries as any);

      const result = await getUserStats('user-uuid-1');

      expect(result.totalWatched).toBe(3);
      expect(result.movies).toBe(2);
      expect(result.tvShows).toBe(1);
      expect(result.favoriteGenre).toBe('Drama');
      expect(result.averageRating).toBe(9); // average of 8 and 10
    });

    it('should return null averageRating when no entries have ratings', async () => {
      const entries = [
        { ...mockWatchEntry, rating: null },
      ];
      mockPrisma.watchEntry.findMany.mockResolvedValue(entries as any);

      const result = await getUserStats('user-uuid-1');

      expect(result.averageRating).toBeNull();
    });

    it('should return zeroes for user with no entries', async () => {
      mockPrisma.watchEntry.findMany.mockResolvedValue([]);

      const result = await getUserStats('user-uuid-1');

      expect(result.totalWatched).toBe(0);
      expect(result.movies).toBe(0);
      expect(result.tvShows).toBe(0);
      expect(result.averageRating).toBeNull();
      expect(result.favoriteGenre).toBeNull();
    });

    it('should throw on database error', async () => {
      mockPrisma.watchEntry.findMany.mockRejectedValue(new Error('DB error'));

      await expect(getUserStats('user-uuid-1')).rejects.toThrow('DB error');
    });
  });
});
