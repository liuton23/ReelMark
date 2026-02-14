-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('MOVIE', 'TV_SHOW');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "type" "ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "releaseYear" INTEGER,
    "posterPath" TEXT,
    "genres" TEXT[],
    "overview" TEXT,
    "runtime" INTEGER,
    "showType" INTEGER,
    "numberOfSeasons" INTEGER,
    "numberOfEpisodes" INTEGER,
    "episodeRuntime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" INTEGER,
    "notes" TEXT,
    "season" INTEGER,
    "episode" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Content_tmdbId_key" ON "Content"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchEntry_userId_contentId_season_episode_key" ON "WatchEntry"("userId", "contentId", "season", "episode");

-- AddForeignKey
ALTER TABLE "WatchEntry" ADD CONSTRAINT "WatchEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchEntry" ADD CONSTRAINT "WatchEntry_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
