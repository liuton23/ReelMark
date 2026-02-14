import express, { Request, Response } from 'express';
import { canGetRecommendations, getRecommendation, getRemainingWatchesNeeded } from '../services/recommendation.service';

const router = express.Router();

// Get recommendations for a user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, preferences} = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

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

    const recommendations = await getRecommendation(
      userId,
      preferences
    );

    res.json({
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({
      error: 'Failed to get recommendations',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/status/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    
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