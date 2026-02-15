import express, { Request, Response } from 'express';
import {
  createWatchEntry,
  getUserWatchHistory,
  getWatchEntryById,
  updateWatchEntry,
  deleteWatchEntry,
  getUserStats,
} from '../services/watchEntry.service';
import { saveMovieFromTMDB, saveTVShowFromTMDB } from '../services/content.service';

const router = express.Router();

// Create a watch entry (userId comes from auth, NOT request body)
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      contentId,
      tmdbId,
      contentType, // 'movie' or 'tv'
      rating,
      notes,
      season,
      episode,
      watchedAt,
    } = req.body;

    let finalContentId = contentId;

    // If tmdbId is provided, save content first (if not already in DB)
    if (tmdbId && !contentId) {
      if (!contentType) {
        return res.status(400).json({ error: 'contentType (movie/tv) is required when using tmdbId' });
      }

      let content;
      if (contentType === 'movie') {
        content = await saveMovieFromTMDB(tmdbId);
      } else if (contentType === 'tv') {
        content = await saveTVShowFromTMDB(tmdbId);
      } else {
        return res.status(400).json({ error: 'contentType must be "movie" or "tv"' });
      }

      finalContentId = content.id;
    }

    if (!finalContentId) {
      return res.status(400).json({ error: 'Either contentId or tmdbId must be provided' });
    }

    const watchEntry = await createWatchEntry(
      userId,
      finalContentId,
      rating,
      notes,
      season,
      episode,
      watchedAt ? new Date(watchedAt) : undefined
    );

    res.status(201).json(watchEntry);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({
      error: 'Failed to create watch entry',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get all watch entries for the authenticated user
// Changed from /user/:userId to /history (userId from auth token)
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const watchHistory = await getUserWatchHistory(userId);
    res.json(watchHistory);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to fetch watch history' });
  }
});

// Get stats for the authenticated user
// Changed from /stats/:userId to /stats (userId from auth token)
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const stats = await getUserStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get a specific watch entry (ownership enforced)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const entryId = req.params.id as string;
    const entry = await getWatchEntryById(entryId, userId);

    if (!entry) {
      return res.status(404).json({ error: 'Watch entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to fetch watch entry' });
  }
});

// Update a watch entry (ownership enforced)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const entryId = req.params.id as string;
    const { rating, notes } = req.body;

    const updated = await updateWatchEntry(entryId, userId, rating, notes);

    if (!updated) {
      return res.status(404).json({ error: 'Watch entry not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to update watch entry' });
  }
});

// Delete a watch entry (ownership enforced)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const entryId = req.params.id as string;
    const deleted = await deleteWatchEntry(entryId, userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Watch entry not found' });
    }

    res.json({ message: 'Watch entry deleted successfully' });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to delete watch entry' });
  }
});

export default router;