-- CreateTable
CREATE TABLE "NotificationDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notificationId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "destination" TEXT NOT NULL DEFAULT '',
    "provider" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Queued',
    "providerMessageId" TEXT NOT NULL DEFAULT '',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" DATETIME,
    "lastAttemptAt" DATETIME,
    "sentAt" DATETIME,
    "lastError" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NotificationDelivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "NotificationRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PushSubscriptionRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL DEFAULT '',
    "deviceLabel" TEXT NOT NULL DEFAULT 'Browser device',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WorkspaceSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL DEFAULT 'Big Devon',
    "roleTitle" TEXT NOT NULL DEFAULT 'Communications Intelligence Lead',
    "organization" TEXT NOT NULL DEFAULT 'Morrow',
    "defaultTone" TEXT NOT NULL DEFAULT 'Premium',
    "defaultMode" TEXT NOT NULL DEFAULT 'Work',
    "signature" TEXT NOT NULL DEFAULT 'Big Devon',
    "brandDirection" TEXT NOT NULL DEFAULT '',
    "designRules" TEXT NOT NULL DEFAULT '',
    "writingRules" TEXT NOT NULL DEFAULT '',
    "postingRules" TEXT NOT NULL DEFAULT '',
    "systemNotes" TEXT NOT NULL DEFAULT '',
    "theme" TEXT NOT NULL DEFAULT 'system',
    "density" TEXT NOT NULL DEFAULT 'comfortable',
    "motion" TEXT NOT NULL DEFAULT 'system',
    "interfaceSounds" BOOLEAN NOT NULL DEFAULT true,
    "soundVolume" INTEGER NOT NULL DEFAULT 35,
    "inAppNotifications" BOOLEAN NOT NULL DEFAULT true,
    "browserNotifications" BOOLEAN NOT NULL DEFAULT false,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT false,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "notificationEmail" TEXT NOT NULL DEFAULT '',
    "notificationPhone" TEXT NOT NULL DEFAULT '',
    "externalMinimumSeverity" TEXT NOT NULL DEFAULT 'warning',
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursStart" TEXT NOT NULL DEFAULT '22:00',
    "quietHoursEnd" TEXT NOT NULL DEFAULT '07:00',
    "dailyBriefTime" TEXT NOT NULL DEFAULT '07:30',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Lagos',
    "weekStartsOn" TEXT NOT NULL DEFAULT 'monday',
    "confirmDestructiveTasks" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_WorkspaceSettings" ("brandDirection", "browserNotifications", "confirmDestructiveTasks", "createdAt", "dailyBriefTime", "defaultMode", "defaultTone", "density", "designRules", "displayName", "emailNotifications", "id", "inAppNotifications", "interfaceSounds", "motion", "organization", "postingRules", "quietHoursEnabled", "quietHoursEnd", "quietHoursStart", "roleTitle", "signature", "soundVolume", "systemNotes", "theme", "timezone", "updatedAt", "weekStartsOn", "writingRules") SELECT "brandDirection", "browserNotifications", "confirmDestructiveTasks", "createdAt", "dailyBriefTime", "defaultMode", "defaultTone", "density", "designRules", "displayName", "emailNotifications", "id", "inAppNotifications", "interfaceSounds", "motion", "organization", "postingRules", "quietHoursEnabled", "quietHoursEnd", "quietHoursStart", "roleTitle", "signature", "soundVolume", "systemNotes", "theme", "timezone", "updatedAt", "weekStartsOn", "writingRules" FROM "WorkspaceSettings";
DROP TABLE "WorkspaceSettings";
ALTER TABLE "new_WorkspaceSettings" RENAME TO "WorkspaceSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "NotificationDelivery_status_nextAttemptAt_idx" ON "NotificationDelivery"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "NotificationDelivery_channel_createdAt_idx" ON "NotificationDelivery"("channel", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDelivery_notificationId_channel_destination_key" ON "NotificationDelivery"("notificationId", "channel", "destination");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscriptionRecord_endpoint_key" ON "PushSubscriptionRecord"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscriptionRecord_enabled_lastSeenAt_idx" ON "PushSubscriptionRecord"("enabled", "lastSeenAt");
