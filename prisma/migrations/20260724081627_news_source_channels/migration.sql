-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NewsItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "headline" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT '',
    "sourceKey" TEXT NOT NULL DEFAULT '',
    "sourceDomain" TEXT NOT NULL DEFAULT '',
    "channel" TEXT NOT NULL DEFAULT 'Newspaper',
    "contentType" TEXT NOT NULL DEFAULT 'Article',
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
INSERT INTO "new_NewsItem" ("author", "collectedAt", "createdAt", "fingerprint", "headline", "id", "notes", "publishedAt", "relevance", "score", "source", "sourceDomain", "sourceKey", "status", "summary", "topic", "updatedAt", "url") SELECT "author", "collectedAt", "createdAt", "fingerprint", "headline", "id", "notes", "publishedAt", "relevance", "score", "source", "sourceDomain", "sourceKey", "status", "summary", "topic", "updatedAt", "url" FROM "NewsItem";
DROP TABLE "NewsItem";
ALTER TABLE "new_NewsItem" RENAME TO "NewsItem";
UPDATE "NewsItem"
SET "channel" = 'Official', "contentType" = 'Press release'
WHERE "sourceKey" LIKE '%-official';
UPDATE "NewsItem"
SET "channel" = 'Manual', "contentType" = 'Manual signal'
WHERE "sourceKey" = 'manual';
CREATE UNIQUE INDEX "NewsItem_fingerprint_key" ON "NewsItem"("fingerprint");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
