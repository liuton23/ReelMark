import axios from "axios";

// Replace with your computer's IP address when testing on phone
// Find it by running 'ipconfig' in PowerShell, look for IPv4 Address
const API_BASE_URL = "http://10.0.0.121:3000/api"; // Replace X.X with your IP
// Or if testing on Android emulator: 'http://10.0.2.2:3000/api'
// Or if testing on iOS simulator: 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Content {
  id: string;
  tmdbId: number;
  type: "MOVIE" | "TV_SHOW";
  title: string;
  releaseYear: number | null;
  posterPath: string | null;
  genres: string[];
  overview: string | null;
  runtime: number | null;
  numberOfSeasons?: number | null;
  numberOfEpisodes?: number | null;
}

export interface WatchEntry {
  id: string;
  userId: string;
  contentId: string;
  watchedAt: string;
  rating: number | null;
  notes: string | null;
  season: number | null;
  episode: number | null;
  content: Content;
}

export interface Recommendation {
  title: string;
  year: number;
  reason: string;
  type: "movie" | "tv";
}

export interface RecommendationResponse {
  recommendation: Recommendation;
}

export interface RecommendationStatus {
  canGetRecommendations: boolean;
  remainingWatchesNeeded: number;
  message: string;
}

// API Functions
export const apiService = {
  // Get watch history for user
  getWatchHistory: async (userId: string): Promise<WatchEntry[]> => {
    const response = await api.get(`/watch-entries/user/${userId}`);
    return response.data;
  },

  // Get default user
  getDefaultUser: async () => {
    const response = await api.get("/users/default");
    return response.data;
  },

  // Search movies/shows
  searchMovies: async (query: string) => {
    const response = await api.get("/search/movies", { params: { q: query } });
    return response.data;
  },

  // Add watch entry
  addWatchEntry: async (data: {
    userId: string;
    tmdbId: number;
    contentType: "movie" | "tv";
    rating?: number;
    notes?: string;
  }) => {
    const response = await api.post("/watch-entries", data);
    return response.data;
  },

  // Update watch entry
  updateWatchEntry: async (
    entryId: string,
    data: { rating?: number; notes?: string },
  ) => {
    const response = await api.patch(`/watch-entries/${entryId}`, data);
    return response.data;
  },

  // Delete watch entry
  deleteWatchEntry: async (entryId: string) => {
    const response = await api.delete(`/watch-entries/${entryId}`);
    return response.data;
  },

  // Get recommendation
  getRecommendation: async (
    userId: string,
    preferences?: string,
  ): Promise<RecommendationResponse> => {
    console.log("API: Calling recommendation endpoint...");
    try {
      const response = await api.post("/recommendations", {
        userId,
        preferences: preferences || undefined,
      });
      console.log("API: Got response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("API: Recommendation call failed:", error.message);
      if (error.code === "ECONNABORTED") {
        console.error("API: Request timed out");
      }
      throw error;
    }
  },

  getRecommendationStatus: async (
    userId: string,
  ): Promise<RecommendationStatus> => {
    const response = await api.get(`/recommendations/status/${userId}`);
    return response.data;
  },
};

// Helper to get TMDB poster URL
export const getTMDBPosterUrl = (
  posterPath: string | null,
  size: "w185" | "w342" | "w500" = "w342",
) => {
  if (!posterPath) return null;
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
};

export default api;
