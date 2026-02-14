jest.mock('../../../services/watchEntry.service');

const mockCreate = jest.fn();
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  }));
});

import { getUserWatchHistory } from '../../../services/watchEntry.service';
import {
  getRecommendation,
  canGetRecommendations,
  getRemainingWatchesNeeded,
} from '../../../services/recommendation.service';

const mockGetUserWatchHistory = getUserWatchHistory as jest.MockedFunction<typeof getUserWatchHistory>;

function createMockWatchEntry(overrides: Record<string, any> = {}) {
  return {
    id: 'entry-uuid',
    userId: 'user-uuid',
    contentId: 'content-uuid',
    watchedAt: new Date('2025-06-01'),
    rating: 9,
    notes: 'Great!',
    season: null,
    episode: null,
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2025-06-01'),
    content: {
      id: 'content-uuid',
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
    },
    ...overrides,
  };
}

function createMockHistory(count: number) {
  return Array.from({ length: count }, (_, i) =>
    createMockWatchEntry({
      id: `entry-${i}`,
      content: {
        ...createMockWatchEntry().content,
        id: `content-${i}`,
        title: `Movie ${i}`,
        tmdbId: 550 + i,
      },
    })
  );
}

describe('Recommendation Service', () => {
  describe('getRecommendation', () => {
    it('should generate a recommendation when user has 5+ entries', async () => {
      const history = createMockHistory(5);
      mockGetUserWatchHistory.mockResolvedValue(history);

      const mockRecommendation = {
        title: 'Interstellar',
        year: 2014,
        reason: 'Based on your love of dramatic films...',
        type: 'movie',
      };

      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockRecommendation) }],
      });

      const result = await getRecommendation('user-uuid');

      expect(mockGetUserWatchHistory).toHaveBeenCalledWith('user-uuid');
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'user' }),
          ]),
        })
      );
      expect(result).toEqual(mockRecommendation);
    });

    it('should throw error when user has fewer than 5 entries', async () => {
      const history = createMockHistory(3);
      mockGetUserWatchHistory.mockResolvedValue(history);

      await expect(getRecommendation('user-uuid')).rejects.toThrow(
        'You need to watch at least 5 movies/shows before getting recommendations. Current: 3'
      );

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should include preferences in the prompt when provided', async () => {
      const history = createMockHistory(5);
      mockGetUserWatchHistory.mockResolvedValue(history);

      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({ title: 'Comedy Movie', year: 2023, reason: 'Light and fun', type: 'movie' }) }],
      });

      await getRecommendation('user-uuid', 'something lighthearted');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            expect.objectContaining({
              content: expect.stringContaining('something lighthearted'),
            }),
          ],
        })
      );
    });

    it('should throw when Claude API fails', async () => {
      const history = createMockHistory(5);
      mockGetUserWatchHistory.mockResolvedValue(history);
      mockCreate.mockRejectedValue(new Error('API error'));

      await expect(getRecommendation('user-uuid')).rejects.toThrow('API error');
    });
  });

  describe('canGetRecommendations', () => {
    it('should return true when user has 5+ entries', async () => {
      mockGetUserWatchHistory.mockResolvedValue(createMockHistory(5));

      const result = await canGetRecommendations('user-uuid');

      expect(result).toBe(true);
    });

    it('should return true when user has more than 5 entries', async () => {
      mockGetUserWatchHistory.mockResolvedValue(createMockHistory(10));

      const result = await canGetRecommendations('user-uuid');

      expect(result).toBe(true);
    });

    it('should return false when user has fewer than 5 entries', async () => {
      mockGetUserWatchHistory.mockResolvedValue(createMockHistory(3));

      const result = await canGetRecommendations('user-uuid');

      expect(result).toBe(false);
    });

    it('should return false when user has no entries', async () => {
      mockGetUserWatchHistory.mockResolvedValue([]);

      const result = await canGetRecommendations('user-uuid');

      expect(result).toBe(false);
    });
  });

  describe('getRemainingWatchesNeeded', () => {
    it('should return 0 when user has 5+ entries', async () => {
      mockGetUserWatchHistory.mockResolvedValue(createMockHistory(5));

      const result = await getRemainingWatchesNeeded('user-uuid');

      expect(result).toBe(0);
    });

    it('should return 0 when user has more than 5 entries', async () => {
      mockGetUserWatchHistory.mockResolvedValue(createMockHistory(8));

      const result = await getRemainingWatchesNeeded('user-uuid');

      expect(result).toBe(0);
    });

    it('should return correct remaining count', async () => {
      mockGetUserWatchHistory.mockResolvedValue(createMockHistory(2));

      const result = await getRemainingWatchesNeeded('user-uuid');

      expect(result).toBe(3);
    });

    it('should return 5 when user has no entries', async () => {
      mockGetUserWatchHistory.mockResolvedValue([]);

      const result = await getRemainingWatchesNeeded('user-uuid');

      expect(result).toBe(5);
    });
  });
});
