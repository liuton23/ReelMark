import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../config/database';
import { getUserWatchHistory } from './watchEntry.service';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MINIMUM_WATCH_HISTORY = 5;

// Type for Claude's raw response (before saving to DB)
export interface AIRecommendation {
  title: string;
  year: number;
  reason: string;
  type: 'movie' | 'tv';
}

// Format watch history for Claude
const formatWatchHistory = (watchHistory: any[]) => {
  return watchHistory.map((entry) => {
    const content = entry.content;
    return {
      title: content.title,
      type: content.type,
      year: content.releaseYear,
      genres: content.genres,
      rating: entry.rating,
      notes: entry.notes,
      watchedAt: entry.watchedAt,
    };
  }).slice(0, 50); // Limit to last 50 entries to avoid token limits
};

// Get AI-powered recommendation (single item)
export const getRecommendation = async (
  userId: string,
  preferences?: string
) => {
  try {
    // Get user's watch history
    const watchHistory = await getUserWatchHistory(userId);

    // Check minimum requirement
    if (watchHistory.length < MINIMUM_WATCH_HISTORY) {
      throw new Error(
        `You need to watch at least ${MINIMUM_WATCH_HISTORY} movies/shows before getting recommendations. Current: ${watchHistory.length}`
      );
    }

    const formattedHistory = formatWatchHistory(watchHistory);

    // Get past recommendations to avoid repeats
    const pastRecs = await prisma.recommendation.findMany({
      where: { userId },
      select: { title: true },
    });
    const pastTitles = pastRecs.map(r => r.title);

    // Build prompt for Claude
    const prompt = `You are a movie and TV show recommendation expert. Based on the user's watch history below, recommend ONE movie or TV show they would enjoy.

User's Watch History (most recent first):
${JSON.stringify(formattedHistory, null, 2)}

${preferences ? `User's specific request: "${preferences}"` : ''}

${pastTitles.length > 0 ? `Previously recommended (do NOT recommend these again):\n${pastTitles.map(t => `- ${t}`).join('\n')}` : ''}

Please recommend ONE title that:
1. Matches their taste based on ratings and genres
2. Is NOT in their watch history
3. Has NOT been previously recommended
4. Would genuinely appeal to them based on their preferences
5. Include a compelling explanation for why they'd like it

Format your response as a JSON object with this structure:
{
  "title": "Movie/Show Title",
  "year": 2020,
  "reason": "Detailed explanation why they'd like it based on their watch history",
  "type": "movie" or "tv"
}

IMPORTANT: Return ONLY valid JSON, no additional text or markdown.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract and parse response
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    const recommendation: AIRecommendation = JSON.parse(responseText);

    // Persist to database
    const saved = await prisma.recommendation.create({
      data: {
        userId,
        title: recommendation.title,
        reason: recommendation.reason,
      },
    });

    console.log(`✨ Generated recommendation: ${recommendation.title}`);
    return { ...recommendation, id: saved.id };
  } catch (error) {
    console.error('Error getting recommendation:', error);
    throw error;
  }
};

// Get a user's past recommendations
export const getUserRecommendations = async (userId: string) => {
  try {
    const recommendations = await prisma.recommendation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return recommendations;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
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