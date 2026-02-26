import { Worker } from 'bullmq';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../config/database';
import { getUserWatchHistory } from '../services/watchEntry.service';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const connection = {
  host: process.env.REDIS_HOST || 'redis',
  port: 6379,
};

// Format watch history for Claude
const formatWatchHistory = (watchHistory: any[]) => {
  return watchHistory
    .map((entry) => ({
      title: entry.content.title,
      type: entry.content.type,
      year: entry.content.releaseYear,
      genres: entry.content.genres,
      rating: entry.rating,
      notes: entry.notes,
      watchedAt: entry.watchedAt,
    }))
    .slice(0, 50);
};

// Worker — processes recommendation jobs off the queue
export const recommendationWorker = new Worker(
  'recommendations',
  async (job) => {
    const { userId, preferences } = job.data;

    // Fetch watch history
    const watchHistory = await getUserWatchHistory(userId);
    const formattedHistory = formatWatchHistory(watchHistory);

    // Get past recommendations to avoid repeats
    const pastRecs = await prisma.recommendation.findMany({
      where: { userId },
      select: { title: true },
    });
    const pastTitles = pastRecs.map((r: { title: string }) => r.title);

    // Build prompt
    const prompt = `You are a movie and TV show recommendation expert. Based on the user's watch history below, recommend ONE movie or TV show they would enjoy.

User's Watch History (most recent first):
${JSON.stringify(formattedHistory, null, 2)}

${preferences ? `User's specific request: "${preferences}"` : ''}

${pastTitles.length > 0 ? `Previously recommended (do NOT recommend these again):\n${pastTitles.map((t: string) => `- ${t}`).join('\n')}` : ''}

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

    // Call Claude
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    const recommendation = JSON.parse(responseText);

    // Persist to DB
    const saved = await prisma.recommendation.create({
      data: {
        userId,
        title: recommendation.title,
        reason: recommendation.reason,
      },
    });

    console.log(`✨ Recommendation generated: ${recommendation.title}`);

    // Return result — stored in job, accessible via polling
    return { ...recommendation, id: saved.id };
  },
  { connection },
);

recommendationWorker.on('completed', (job) => {
  console.log(`✅ Recommendation job ${job.id} completed`);
});

recommendationWorker.on('failed', (job, err) => {
  console.error(`❌ Recommendation job ${job?.id} failed:`, err.message);
});
