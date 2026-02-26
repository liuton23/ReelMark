import express, { Request, Response } from 'express';
import {
  canGetRecommendations,
  getRemainingWatchesNeeded,
  getUserRecommendations,
} from '../services/recommendation.service';
import { recommendationQueue } from '../config/queue';

const router = express.Router();

// POST / — queue a recommendation job, return jobId immediately
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { preferences } = req.body;

    // Check eligibility before queuing
    const canRecommend = await canGetRecommendations(userId);
    if (!canRecommend) {
      const remaining = await getRemainingWatchesNeeded(userId);
      return res.status(400).json({
        error: 'Insufficient watch history',
        message: `Watch ${remaining} more movie${remaining > 1 ? 's' : ''}/show${remaining > 1 ? 's' : ''} to get recommendations`,
        remaining,
      });
    }

    // Add job to queue — returns immediately
    const job = await recommendationQueue.add('generate', { userId, preferences });

    res.json({ jobId: job.id, status: 'processing' });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to queue recommendation' });
  }
});

// GET /job/:jobId — poll for job result
router.get('/job/:jobId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
    const job = await recommendationQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();

    if (state === 'completed') {
      return res.json({ status: 'completed', recommendation: job.returnvalue });
    }

    if (state === 'failed') {
      return res.status(500).json({ status: 'failed', error: job.failedReason });
    }

    // Still processing (waiting, active, delayed)
    return res.json({ status: 'processing' });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

// GET /history — past recommendations
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

// GET /status — check recommendation eligibility
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
