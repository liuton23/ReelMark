import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Reads from mobile/.env → EXPO_PUBLIC_API_URL=http://10.0.0.121:3000/api
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const TOKEN_KEY = 'reelmark_auth_token';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Token Management ────────────────────────────────────────────

export const saveToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | undefined> => {
  return (await SecureStore.getItemAsync(TOKEN_KEY)) ?? undefined;
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

// ─── Axios Interceptor (auto-attach Bearer token) ───────────────

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Session expiry event — AuthContext listens for this
type SessionListener = () => void;
let sessionExpiredListener: SessionListener | undefined = undefined;

export const onSessionExpired = (listener: SessionListener) => {
  sessionExpiredListener = listener;
};

// Auto-logout on 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Skip 401s from login/register (those are just wrong credentials)
    const isAuthRoute =
      error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthRoute) {
      await removeToken();
      sessionExpiredListener?.();
    }
    return Promise.reject(error);
  },
);

// ─── Types ───────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  email: string | undefined;
  displayName: string | undefined;
  avatarUrl: string | undefined;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

export interface Content {
  id: string;
  tmdbId: number;
  type: 'MOVIE' | 'TV_SHOW';
  title: string;
  releaseYear: number | undefined;
  posterPath: string | undefined;
  genres: string[];
  overview: string | undefined;
  runtime: number | undefined;
  numberOfSeasons?: number | undefined;
  numberOfEpisodes?: number | undefined;
}

export interface WatchEntry {
  id: string;
  userId: string;
  contentId: string;
  watchedAt: string;
  rating: number | undefined;
  notes: string | undefined;
  season: number | undefined;
  episode: number | undefined;
  content: Content;
}

export interface Recommendation {
  id?: string;
  title: string;
  year: number;
  reason: string;
  type: 'movie' | 'tv';
}

export interface RecommendationResponse {
  recommendation: Recommendation;
}

export interface RecommendationStatus {
  canGetRecommendations: boolean;
  remainingWatchesNeeded: number;
  message: string;
}

export interface UserStats {
  totalWatched: number;
  movies: number;
  tvShows: number;
  averageRating: number | undefined;
  thisMonth: number;
  lastMonth: number;
  favoriteGenre: string | undefined;
}

// ─── API Functions ───────────────────────────────────────────────

export const apiService = {
  // ── Auth ──────────────────────────────────────────────────────

  register: async (username: string, password: string, email?: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', {
      username,
      password,
      email,
    });
    await saveToken(response.data.token);
    return response.data;
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { username, password });
    await saveToken(response.data.token);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if server call fails, clear local token
    }
    await removeToken();
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // ── User Profile ──────────────────────────────────────────────

  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: {
    displayName?: string;
    avatarUrl?: string;
    email?: string;
  }): Promise<User> => {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },

  // ── Watch History (no more userId in URL) ─────────────────────

  getWatchHistory: async (): Promise<WatchEntry[]> => {
    const response = await api.get('/watch-entries/history');
    return response.data;
  },

  addWatchEntry: async (data: {
    tmdbId: number;
    contentType: 'movie' | 'tv';
    rating?: number;
    notes?: string;
  }) => {
    const response = await api.post('/watch-entries', data);
    return response.data;
  },

  updateWatchEntry: async (entryId: string, data: { rating?: number; notes?: string }) => {
    const response = await api.patch(`/watch-entries/${entryId}`, data);
    return response.data;
  },

  deleteWatchEntry: async (entryId: string) => {
    const response = await api.delete(`/watch-entries/${entryId}`);
    return response.data;
  },

  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get('/watch-entries/stats');
    return response.data;
  },

  // ── Content ───────────────────────────────────────────────────

  getContent: async (): Promise<Content[]> => {
    const response = await api.get('/content');
    return response.data;
  },

  // ── Search (public, no auth needed) ───────────────────────────

  searchMulti: async (query: string) => {
    const response = await api.get('/search/multi', { params: { q: query } });
    return response.data;
  },

  // ── Recommendations ───────────────────────────────────────────

  // Returns jobId immediately — use getRecommendationJob to poll
  getRecommendation: async (preferences?: string): Promise<{ jobId: string; status: string }> => {
    const response = await api.post('/recommendations', {
      preferences: preferences || undefined,
    });
    return response.data;
  },

  // Poll this until status === 'completed' or 'failed'
  getRecommendationJob: async (jobId: string): Promise<{ status: string; recommendation?: Recommendation; error?: string }> => {
    const response = await api.get(`/recommendations/job/${jobId}`);
    return response.data;
  },

  getRecommendationStatus: async (): Promise<RecommendationStatus> => {
    const response = await api.get('/recommendations/status');
    return response.data;
  },

  getRecommendationHistory: async (): Promise<Recommendation[]> => {
    const response = await api.get('/recommendations/history');
    return response.data;
  },
};

// Helper to get TMDB poster URL
export const getTMDBPosterUrl = (
  posterPath: string | undefined,
  size: 'w185' | 'w342' | 'w500' = 'w342',
) => {
  if (!posterPath) return undefined;
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
};

export default api;
