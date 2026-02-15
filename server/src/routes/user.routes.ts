import express, { Request, Response } from 'express';
import { getUserById, updateProfile, deleteUser } from '../services/user.service';

const router = express.Router();

// Get your own profile
// (GET /auth/me is the primary way — this is here if you need to fetch by ID)
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update your profile
router.patch('/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { displayName, avatarUrl, email } = req.body;

    const user = await updateProfile(userId, { displayName, avatarUrl, email });

    res.json(user);
  } catch (error) {
    if (error instanceof Error && error.message === 'Email already in use') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete your account
router.delete('/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await deleteUser(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;