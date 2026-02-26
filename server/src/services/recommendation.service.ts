import { prisma } from '../config/database';
import { getUserWatchHistory } from './watchEntry.service';

const MINIMUM_WATCH_HISTORY = 5;

// Get a user's past recommendations
export const getUserRecommendations = async (userId: string) => {
  const recommendations = await prisma.recommendation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return recommendations;
};

// Check if user has enough watch history
export const canGetRecommendations = async (userId: string): Promise<boolean> => {
  const watchHistory = await getUserWatchHistory(userId);
  return watchHistory.length >= MINIMUM_WATCH_HISTORY;
};

// Get remaining items needed for recommendations
export const getRemainingWatchesNeeded = async (userId: string): Promise<number> => {
  const watchHistory = await getUserWatchHistory(userId);
  const remaining = MINIMUM_WATCH_HISTORY - watchHistory.length;
  return remaining > 0 ? remaining : 0;
};
