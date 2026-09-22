-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WorkspaceSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL DEFAULT 'Big Devon',
    "roleTitle" TEXT NOT NULL DEFAULT 'Communications Intelligence Lead',
    "organization" TEXT NOT NULL DEFAULT 'DevonOS',
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
INSERT INTO "new_WorkspaceSettings" ("brandDirection", "createdAt", "defaultMode", "defaultTone", "designRules", "displayName", "id", "organization", "postingRules", "roleTitle", "signature", "systemNotes", "updatedAt", "writingRules") SELECT "brandDirection", "createdAt", "defaultMode", "defaultTone", "designRules", "displayName", "id", "organization", "postingRules", "roleTitle", "signature", "systemNotes", "updatedAt", "writingRules" FROM "WorkspaceSettings";
DROP TABLE "WorkspaceSettings";
ALTER TABLE "new_WorkspaceSettings" RENAME TO "WorkspaceSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
