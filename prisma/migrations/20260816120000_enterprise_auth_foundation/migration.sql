-- CreateTable
CREATE TABLE "MorrowAccessRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "organization" TEXT NOT NULL DEFAULT '',
    "reason" TEXT NOT NULL DEFAULT '',
    "requestedRole" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MorrowAccessRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "MorrowUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MorrowAuthChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "purpose" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "codeHash" TEXT NOT NULL DEFAULT '',
    "providerReference" TEXT NOT NULL DEFAULT '',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "expiresAt" DATETIME NOT NULL,
    "consumedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MorrowAuthChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "MorrowUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MorrowUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT,
    "phone" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "lastLoginAt" DATETIME,
    "onboardingCompletedAt" DATETIME,
    "passwordChangedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_MorrowUser" ("createdAt", "displayName", "email", "failedLoginCount", "id", "lastLoginAt", "lockedUntil", "passwordChangedAt", "passwordHash", "role", "updatedAt") SELECT "createdAt", "displayName", "email", "failedLoginCount", "id", "lastLoginAt", "lockedUntil", "passwordChangedAt", "passwordHash", "role", "updatedAt" FROM "MorrowUser";
DROP TABLE "MorrowUser";
ALTER TABLE "new_MorrowUser" RENAME TO "MorrowUser";
CREATE UNIQUE INDEX "MorrowUser_email_key" ON "MorrowUser"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "MorrowAccessRequest_status_createdAt_idx" ON "MorrowAccessRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "MorrowAccessRequest_email_status_idx" ON "MorrowAccessRequest"("email", "status");

-- CreateIndex
CREATE INDEX "MorrowAuthChallenge_email_purpose_expiresAt_idx" ON "MorrowAuthChallenge"("email", "purpose", "expiresAt");

-- CreateIndex
CREATE INDEX "MorrowAuthChallenge_userId_createdAt_idx" ON "MorrowAuthChallenge"("userId", "createdAt");
