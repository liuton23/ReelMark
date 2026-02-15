export interface Recommendation {
  id: string;
  userId: string;
  contentId: string | null;
  title: string;
  reason: string;
  tmdbId: number | null;
  createdAt: Date;
}