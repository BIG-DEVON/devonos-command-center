-- CreateTable
CREATE TABLE "NewsSourceState" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "homepage" TEXT NOT NULL,
    "feedUrl" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'RSS',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "lastCheckedAt" DATETIME,
    "lastSuccessfulAt" DATETIME,
    "lastStatus" TEXT NOT NULL DEFAULT 'Ready',
    "lastError" TEXT NOT NULL DEFAULT '',
    "itemsSeen" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NewsMonitorRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'Running',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "sourcesChecked" INTEGER NOT NULL DEFAULT 0,
    "sourcesSucceeded" INTEGER NOT NULL DEFAULT 0,
    "articlesFetched" INTEGER NOT NULL DEFAULT 0,
    "articlesRelevant" INTEGER NOT NULL DEFAULT 0,
    "articlesCreated" INTEGER NOT NULL DEFAULT 0,
    "duplicatesSkipped" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT NOT NULL DEFAULT '[]'
);

-- CreateTable
CREATE TABLE "NewsDigest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "content" TEXT NOT NULL,
    "itemIds" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NewsItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "headline" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT '',
    "sourceKey" TEXT NOT NULL DEFAULT '',
    "sourceDomain" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL DEFAULT '',
    "fingerprint" TEXT,
    "author" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "relevance" TEXT NOT NULL DEFAULT 'Medium',
    "topic" TEXT NOT NULL DEFAULT 'General',
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'New',
    "notes" TEXT NOT NULL DEFAULT '',
    "publishedAt" DATETIME,
    "collectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_NewsItem" ("createdAt", "headline", "id", "notes", "relevance", "source", "summary", "updatedAt", "url") SELECT "createdAt", "headline", "id", "notes", "relevance", "source", "summary", "updatedAt", "url" FROM "NewsItem";
DROP TABLE "NewsItem";
ALTER TABLE "new_NewsItem" RENAME TO "NewsItem";
CREATE UNIQUE INDEX "NewsItem_fingerprint_key" ON "NewsItem"("fingerprint");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
