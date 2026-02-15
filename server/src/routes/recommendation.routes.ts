import express, { Request, Response } from 'express';
import { canGetRecommendations, getRecommendation, getRemainingWatchesNeeded, getUserRecommendations } from '../services/recommendation.service';

const router = express.Router();

// Get a new recommendation for the authenticated user
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { preferences } = req.body;

    // Check if user has enough watch history
    const canRecommend = await canGetRecommendations(userId);
    
    if (!canRecommend) {
      const remaining = await getRemainingWatchesNeeded(userId);
      return res.status(400).json({
        error: 'Insufficient watch history',
        message: `Watch ${remaining} more movie${remaining > 1 ? 's' : ''}/show${remaining > 1 ? 's' : ''} to get recommendations`,
        remaining,
      });
    }

    const recommendation = await getRecommendation(userId, preferences);

    res.json({ recommendation });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({
      error: 'Failed to get recommendation',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get past recommendations for the authenticated user
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const recommendations = await getUserRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendation history' });
  }
});

// Check recommendation eligibility for the authenticated user
// Changed from /status/:userId to /status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const canRecommend = await canGetRecommendations(userId);
    const remaining = await getRemainingWatchesNeeded(userId);

    res.json({
      canGetRecommendations: canRecommend,
      remainingWatchesNeeded: remaining,
      message: canRecommend 
        ? 'Ready for recommendations!' 
        : `Watch ${remaining} more to unlock recommendations`,
    });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to check recommendation status' });
  }
});

export default router;