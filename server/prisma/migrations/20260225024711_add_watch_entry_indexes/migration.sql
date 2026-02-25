-- CreateIndex
CREATE INDEX "WatchEntry_userId_idx" ON "WatchEntry"("userId");

-- CreateIndex
CREATE INDEX "WatchEntry_userId_watchedAt_idx" ON "WatchEntry"("userId", "watchedAt");

-- CreateIndex
CREATE INDEX "WatchEntry_contentId_idx" ON "WatchEntry"("contentId");
