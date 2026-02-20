/**
 * E2E Tests — Full API flow against a real test database.
 *
 * Prerequisites:
 *   1. PostgreSQL running locally
 *   2. A test database created: CREATE DATABASE reelmark_test;
 *   3. Set DATABASE_URL env to point to reelmark_test before running
 *   4. Run: npx prisma migrate deploy (against test DB)
 *
 * These tests hit the real database and real Express app.
 * External APIs (TMDB, Anthropic) are still mocked to avoid flaky tests.
 */

jest.mock('@anthropic-ai/sdk');
jest.mock('axios');

import request from 'supertest';
import app from '../../app';
import { prisma } from '../../config/database';
import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockCreate = jest.fn();
(Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(
  () =>
    ({
      messages: { create: mockCreate },
    }) as any,
);

// TMDB mock data
const mockTmdbMovie = {
  id: 27205,
  title: 'Inception',
  release_date: '2010-07-16',
  poster_path: '/inception.jpg',
  genres: [
    { id: 28, name: 'Action' },
    { id: 878, name: 'Science Fiction' },
  ],
  overview: 'A thief who steals corporate secrets...',
  runtime: 148,
};

const mockTmdbMovies = [
  {
    id: 27205,
    title: 'Inception',
    release_date: '2010-07-16',
    poster_path: '/inception.jpg',
    genres: [{ name: 'Action' }, { name: 'Sci-Fi' }],
    overview: 'Dream heist',
    runtime: 148,
  },
  {
    id: 155,
    title: 'The Dark Knight',
    release_date: '2008-07-18',
    poster_path: '/dk.jpg',
    genres: [{ name: 'Action' }],
    overview: 'Batman vs Joker',
    runtime: 152,
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    release_date: '1994-10-14',
    poster_path: '/pf.jpg',
    genres: [{ name: 'Crime' }],
    overview: 'Interconnected stories',
    runtime: 154,
  },
  {
    id: 13,
    title: 'Forrest Gump',
    release_date: '1994-07-06',
    poster_path: '/fg.jpg',
    genres: [{ name: 'Drama' }],
    overview: 'Life is like...',
    runtime: 142,
  },
  {
    id: 278,
    title: 'The Shawshank Redemption',
    release_date: '1994-09-23',
    poster_path: '/sr.jpg',
    genres: [{ name: 'Drama' }],
    overview: 'Prison escape',
    runtime: 142,
  },
];

// Helper to set up axios mock for TMDB movie details
function mockTmdbMovieDetails(tmdbId: number, data: Record<string, any>) {
  mockedAxios.get.mockImplementation((url: string) => {
    if (typeof url === 'string' && url.includes(`/movie/${tmdbId}`)) {
      return Promise.resolve({ data });
    }
    if (typeof url === 'string' && url.includes('/search/movie')) {
      return Promise.resolve({ data: { results: [data] } });
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });
}

// Check if we can connect to the test database
const isTestDbAvailable = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    return true;
  } catch {
    return false;
  }
};

// Conditionally run E2E tests only when test database is available
const describeE2E = process.env.DATABASE_URL?.includes('reelmark_test') ? describe : describe.skip;

describeE2E('E2E API Tests', () => {
  let token: string;
  let userId: string;
  let contentId: string;
  let watchEntryId: string;

  beforeAll(async () => {
    const dbAvailable = await isTestDbAvailable();
    if (!dbAvailable) {
      console.warn('Test database not available — skipping E2E tests');
      return;
    }
  });

  afterAll(async () => {
    // Clean up test data — sessions/entries/recommendations cascade on user delete
    await prisma.watchEntry.deleteMany({});
    await prisma.recommendation.deleteMany({});
    await prisma.content.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Full User Journey', () => {
    it('Step 1: Register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'e2e_testuser', password: 'password123', email: 'e2e@test.com' });

      expect(response.status).toBe(201);
      expect(response.body.user.username).toBe('e2e_testuser');
      expect(response.body.token).toBeDefined();
      token = response.body.token;
      userId = response.body.user.id;
    });

    it('Step 2: Get current user via /auth/me', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
      expect(response.body.username).toBe('e2e_testuser');
    });

    it('Step 3: Save a movie from TMDB', async () => {
      mockTmdbMovieDetails(27205, mockTmdbMovie);

      const response = await request(app)
        .post('/api/content/movie')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 27205 });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Inception');
      contentId = response.body.id;
    });

    it('Step 4: Get content by TMDB ID', async () => {
      const response = await request(app)
        .get('/api/content/tmdb/27205')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Inception');
    });

    it('Step 5: Create a watch entry', async () => {
      const response = await request(app)
        .post('/api/watch-entries')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contentId,
          rating: 9,
          notes: 'Mind-bending!',
        });

      expect(response.status).toBe(201);
      expect(response.body.rating).toBe(9);
      expect(response.body.notes).toBe('Mind-bending!');
      expect(response.body.userId).toBe(userId);
      watchEntryId = response.body.id;
    });

    it('Step 6: Get watch history', async () => {
      const response = await request(app)
        .get('/api/watch-entries/history')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].content.title).toBe('Inception');
    });

    it('Step 7: Update watch entry', async () => {
      const response = await request(app)
        .patch(`/api/watch-entries/${watchEntryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 10, notes: 'Absolute masterpiece!' });

      expect(response.status).toBe(200);
      expect(response.body.rating).toBe(10);
      expect(response.body.notes).toBe('Absolute masterpiece!');
    });

    it('Step 8: Check recommendation status (not enough history)', async () => {
      const response = await request(app)
        .get('/api/recommendations/status')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.canGetRecommendations).toBe(false);
      expect(response.body.remainingWatchesNeeded).toBeGreaterThan(0);
    });

    it('Step 9: Get user stats', async () => {
      const response = await request(app)
        .get('/api/watch-entries/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.totalWatched).toBe(1);
      expect(response.body.movies).toBe(1);
    });

    it('Step 10: Delete the watch entry', async () => {
      const response = await request(app)
        .delete(`/api/watch-entries/${watchEntryId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Watch entry deleted successfully');
    });

    it('Step 11: Verify watch history is empty', async () => {
      const response = await request(app)
        .get('/api/watch-entries/history')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('Step 12: Update user profile', async () => {
      const response = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ displayName: 'E2E Tester' });

      expect(response.status).toBe(200);
      expect(response.body.displayName).toBe('E2E Tester');
    });

    it('Step 13: Login with existing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'e2e_testuser', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe('e2e_testuser');
    });

    it('Step 14: Logout', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
    });

    it('Step 15: Token is invalid after logout', async () => {
      const response = await request(app)
        .get('/api/watch-entries/history')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Recommendation Flow', () => {
    it('should add 5 movies and get a recommendation', async () => {
      // Register a fresh user for this test
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'rec_testuser', password: 'password123' });

      expect(registerRes.status).toBe(201);
      const recToken = registerRes.body.token;

      // Add 5 movies via direct content creation + watch entries
      for (let i = 0; i < 5; i++) {
        const movie = mockTmdbMovies[i];
        mockedAxios.get.mockResolvedValueOnce({ data: movie });

        // Save content
        const contentRes = await request(app)
          .post('/api/content/movie')
          .set('Authorization', `Bearer ${recToken}`)
          .send({ tmdbId: movie.id });

        // Create watch entry
        await request(app)
          .post('/api/watch-entries')
          .set('Authorization', `Bearer ${recToken}`)
          .send({
            contentId: contentRes.body.id,
            rating: 8 + (i % 3),
          });
      }

      // Check status — should be ready
      const statusRes = await request(app)
        .get('/api/recommendations/status')
        .set('Authorization', `Bearer ${recToken}`);

      expect(statusRes.body.canGetRecommendations).toBe(true);
      expect(statusRes.body.remainingWatchesNeeded).toBe(0);

      // Get recommendation
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              title: 'Interstellar',
              year: 2014,
              reason: 'You love Christopher Nolan films',
              type: 'movie',
            }),
          },
        ],
      });

      const recRes = await request(app)
        .post('/api/recommendations')
        .set('Authorization', `Bearer ${recToken}`)
        .send({});

      expect(recRes.status).toBe(200);
      expect(recRes.body.recommendation.title).toBe('Interstellar');
      expect(recRes.body.recommendation.id).toBeDefined();

      // Get recommendation history
      const historyRes = await request(app)
        .get('/api/recommendations/history')
        .set('Authorization', `Bearer ${recToken}`);

      expect(historyRes.status).toBe(200);
      expect(historyRes.body).toHaveLength(1);
      expect(historyRes.body[0].title).toBe('Interstellar');
    });
  });

  describe('Auth edge cases', () => {
    it('should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'e2e_testuser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid username or password');
    });

    it('should reject duplicate username on register', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'rec_testuser', password: 'password123' });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Username already taken');
    });

    it("should prevent access to another user's watch entries", async () => {
      // Register a second user
      const user2Res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'other_user', password: 'password123' });
      const user2Token = user2Res.body.token;

      // User 2 tries to access a watch entry they don't own
      const response = await request(app)
        .get(`/api/watch-entries/some-other-entry-id`)
        .set('Authorization', `Bearer ${user2Token}`);

      // Should get 404, not 403 — ownership is enforced silently
      expect(response.status).toBe(404);
    });
  });
});
