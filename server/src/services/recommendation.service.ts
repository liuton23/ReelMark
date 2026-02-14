import Anthropic from '@anthropic-ai/sdk';
import { getUserWatchHistory } from './watchEntry.service';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MINIMUM_WATCH_HISTORY = 5;

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
  preferences?: string // Optional: "something light", "action movie", etc.
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

    // Build prompt for Claude
    const prompt = `You are a movie and TV show recommendation expert. Based on the user's watch history below, recommend ONE movie or TV show they would enjoy.

User's Watch History (most recent first):
${JSON.stringify(formattedHistory, null, 2)}

${preferences ? `User's specific request: "${preferences}"` : ''}

Please recommend ONE title that:
1. Matches their taste based on ratings and genres
2. Is NOT in their watch history
3. Would genuinely appeal to them based on their preferences
4. Include a compelling explanation for why they'd like it

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

    // Parse JSON response
    const recommendation = JSON.parse(responseText);

    console.log(`✨ Generated recommendation: ${recommendation.title}`);
    return recommendation;
  } catch (error) {
    console.error('Error getting recommendation:', error);
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