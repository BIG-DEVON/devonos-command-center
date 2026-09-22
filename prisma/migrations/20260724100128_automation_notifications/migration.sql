-- CreateTable
CREATE TABLE "NotificationRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'System',
    "severity" TEXT NOT NULL DEFAULT 'info',
    "href" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Unread',
    "sourceType" TEXT NOT NULL DEFAULT '',
    "sourceId" TEXT NOT NULL DEFAULT '',
    "dedupeKey" TEXT,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AutomationSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "cadence" TEXT NOT NULL DEFAULT 'Daily',
    "time" TEXT NOT NULL DEFAULT '07:30',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Lagos',
    "channels" TEXT NOT NULL DEFAULT '["in-app"]',
    "lastRunAt" DATETIME,
    "lastStatus" TEXT NOT NULL DEFAULT 'Never run',
    "lastSummary" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AutomationRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scheduleKey" TEXT NOT NULL,
    "trigger" TEXT NOT NULL DEFAULT 'Manual',
    "status" TEXT NOT NULL DEFAULT 'Running',
    "summary" TEXT NOT NULL DEFAULT '',
    "outputHref" TEXT NOT NULL DEFAULT '',
    "recordsCreated" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT NOT NULL DEFAULT '',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRecord_dedupeKey_key" ON "NotificationRecord"("dedupeKey");

-- CreateIndex
CREATE INDEX "NotificationRecord_status_createdAt_idx" ON "NotificationRecord"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AutomationSchedule_key_key" ON "AutomationSchedule"("key");

-- CreateIndex
CREATE INDEX "AutomationRun_scheduleKey_startedAt_idx" ON "AutomationRun"("scheduleKey", "startedAt");
