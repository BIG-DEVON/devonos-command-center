-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "MorrowUser" (
    "id" TEXT NOT NULL,
    "supabaseUserId" TEXT,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT,
    "phone" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "onboardingCompletedAt" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MorrowUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MorrowAuthSession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MorrowAuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MorrowAccessRequest" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "organization" TEXT NOT NULL DEFAULT '',
    "reason" TEXT NOT NULL DEFAULT '',
    "requestedRole" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MorrowAccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MorrowAuthChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "purpose" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "codeHash" TEXT NOT NULL DEFAULT '',
    "providerReference" TEXT NOT NULL DEFAULT '',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MorrowAuthChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HallOfFameMemberRecord" (
    "id" TEXT NOT NULL,
    "photoNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL DEFAULT '',
    "organization" TEXT NOT NULL DEFAULT '',
    "group" TEXT NOT NULL DEFAULT 'State Revenue',
    "status" TEXT NOT NULL DEFAULT 'verified',
    "photoUrl" TEXT NOT NULL DEFAULT '',
    "photoData" BYTEA,
    "photoMimeType" TEXT NOT NULL DEFAULT '',
    "birthdayCategory" TEXT NOT NULL DEFAULT 'Stakeholder',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HallOfFameMemberRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceSettings" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL,
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
    "publishedAt" TIMESTAMP(3),
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsSourceState" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "homepage" TEXT NOT NULL,
    "feedUrl" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'RSS',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "lastCheckedAt" TIMESTAMP(3),
    "lastSuccessfulAt" TIMESTAMP(3),
    "lastStatus" TEXT NOT NULL DEFAULT 'Ready',
    "lastError" TEXT NOT NULL DEFAULT '',
    "itemsSeen" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsSourceState_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "NewsMonitorRun" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Running',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "sourcesChecked" INTEGER NOT NULL DEFAULT 0,
    "sourcesSucceeded" INTEGER NOT NULL DEFAULT 0,
    "articlesFetched" INTEGER NOT NULL DEFAULT 0,
    "articlesRelevant" INTEGER NOT NULL DEFAULT 0,
    "articlesCreated" INTEGER NOT NULL DEFAULT 0,
    "duplicatesSkipped" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT NOT NULL DEFAULT '[]',

    CONSTRAINT "NewsMonitorRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsDigest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "content" TEXT NOT NULL,
    "itemIds" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsDigest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationRecord" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'System',
    "severity" TEXT NOT NULL DEFAULT 'info',
    "href" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Unread',
    "sourceType" TEXT NOT NULL DEFAULT '',
    "sourceId" TEXT NOT NULL DEFAULT '',
    "dedupeKey" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDelivery" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "destination" TEXT NOT NULL DEFAULT '',
    "provider" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Queued',
    "providerMessageId" TEXT NOT NULL DEFAULT '',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "lastError" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscriptionRecord" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL DEFAULT '',
    "deviceLabel" TEXT NOT NULL DEFAULT 'Browser device',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscriptionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationSchedule" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "cadence" TEXT NOT NULL DEFAULT 'Daily',
    "time" TEXT NOT NULL DEFAULT '07:30',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Lagos',
    "channels" TEXT NOT NULL DEFAULT '["in-app"]',
    "lastRunAt" TIMESTAMP(3),
    "lastStatus" TEXT NOT NULL DEFAULT 'Never run',
    "lastSummary" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRun" (
    "id" TEXT NOT NULL,
    "scheduleKey" TEXT NOT NULL,
    "trigger" TEXT NOT NULL DEFAULT 'Manual',
    "status" TEXT NOT NULL DEFAULT 'Running',
    "summary" TEXT NOT NULL DEFAULT '',
    "outputHref" TEXT NOT NULL DEFAULT '',
    "recordsCreated" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT NOT NULL DEFAULT '',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AutomationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "module" TEXT NOT NULL DEFAULT 'General',
    "sourceId" TEXT NOT NULL DEFAULT '',
    "sourceLabel" TEXT NOT NULL DEFAULT '',
    "sourceHref" TEXT NOT NULL DEFAULT '',
    "requestedBy" TEXT NOT NULL DEFAULT 'Big Devon',
    "approver" TEXT NOT NULL DEFAULT 'Big Devon',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "dueDate" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "decisionNote" TEXT NOT NULL DEFAULT '',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalActivity" (
    "id" TEXT NOT NULL,
    "approvalId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor" TEXT NOT NULL DEFAULT 'Big Devon',
    "detail" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpiItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "owner" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Not Started',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "dueDate" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "outcome" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KpiItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialDraft" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "campaign" TEXT NOT NULL DEFAULT '',
    "platform" TEXT NOT NULL DEFAULT 'Instagram',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "scheduledDate" TEXT NOT NULL DEFAULT '',
    "caption" TEXT NOT NULL DEFAULT '',
    "visualDirection" TEXT NOT NULL DEFAULT '',
    "hashtags" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetRecord" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Document',
    "project" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Raw',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "link" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'Global Observance',
    "relevance" TEXT NOT NULL DEFAULT 'Medium',
    "status" TEXT NOT NULL DEFAULT 'Idea',
    "contentAngle" TEXT NOT NULL DEFAULT '',
    "visualDirection" TEXT NOT NULL DEFAULT '',
    "captionDraft" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BirthdayProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "month" INTEGER NOT NULL DEFAULT 1,
    "day" INTEGER NOT NULL DEFAULT 1,
    "photoUrl" TEXT NOT NULL DEFAULT '',
    "hallMemberId" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "preferredTone" TEXT NOT NULL DEFAULT 'Warm',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BirthdayProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiDraft" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Caption',
    "tone" TEXT NOT NULL DEFAULT 'Premium',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "instruction" TEXT NOT NULL DEFAULT '',
    "sourceText" TEXT NOT NULL DEFAULT '',
    "output" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectRecord" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Planning',
    "priority" TEXT NOT NULL DEFAULT 'High',
    "startDate" TEXT NOT NULL DEFAULT '',
    "dueDate" TEXT NOT NULL DEFAULT '',
    "objective" TEXT NOT NULL DEFAULT '',
    "deliverables" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutopilotTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "module" TEXT NOT NULL DEFAULT '',
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'Open',
    "dueDate" TEXT NOT NULL DEFAULT '',
    "detail" TEXT NOT NULL DEFAULT '',
    "action" TEXT NOT NULL DEFAULT '',
    "href" TEXT NOT NULL DEFAULT '',
    "sourceSignalId" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutopilotTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutiveReportSnapshot" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "range" TEXT NOT NULL DEFAULT '30d',
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "signal" TEXT NOT NULL DEFAULT 'Steady',
    "summary" TEXT NOT NULL,
    "metricsJson" TEXT NOT NULL,
    "dimensionsJson" TEXT NOT NULL,
    "evidenceJson" TEXT NOT NULL,
    "recommendationsJson" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'Morrow Owner',
    "sourceVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutiveReportSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MorrowUser_supabaseUserId_key" ON "MorrowUser"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "MorrowUser_email_key" ON "MorrowUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MorrowAuthSession_tokenHash_key" ON "MorrowAuthSession"("tokenHash");

-- CreateIndex
CREATE INDEX "MorrowAuthSession_userId_expiresAt_idx" ON "MorrowAuthSession"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "MorrowAuthSession_expiresAt_idx" ON "MorrowAuthSession"("expiresAt");

-- CreateIndex
CREATE INDEX "MorrowAccessRequest_status_createdAt_idx" ON "MorrowAccessRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "MorrowAccessRequest_email_status_idx" ON "MorrowAccessRequest"("email", "status");

-- CreateIndex
CREATE INDEX "MorrowAuthChallenge_email_purpose_expiresAt_idx" ON "MorrowAuthChallenge"("email", "purpose", "expiresAt");

-- CreateIndex
CREATE INDEX "MorrowAuthChallenge_userId_createdAt_idx" ON "MorrowAuthChallenge"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HallOfFameMemberRecord_photoNumber_key" ON "HallOfFameMemberRecord"("photoNumber");

-- CreateIndex
CREATE INDEX "HallOfFameMemberRecord_group_photoNumber_idx" ON "HallOfFameMemberRecord"("group", "photoNumber");

-- CreateIndex
CREATE UNIQUE INDEX "NewsItem_fingerprint_key" ON "NewsItem"("fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRecord_dedupeKey_key" ON "NotificationRecord"("dedupeKey");

-- CreateIndex
CREATE INDEX "NotificationRecord_status_createdAt_idx" ON "NotificationRecord"("status", "createdAt");

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

-- CreateIndex
CREATE UNIQUE INDEX "AutomationSchedule_key_key" ON "AutomationSchedule"("key");

-- CreateIndex
CREATE INDEX "AutomationRun_scheduleKey_startedAt_idx" ON "AutomationRun"("scheduleKey", "startedAt");

-- CreateIndex
CREATE INDEX "ApprovalRequest_status_dueDate_idx" ON "ApprovalRequest"("status", "dueDate");

-- CreateIndex
CREATE INDEX "ApprovalActivity_approvalId_createdAt_idx" ON "ApprovalActivity"("approvalId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BirthdayProfile_hallMemberId_key" ON "BirthdayProfile"("hallMemberId");

-- CreateIndex
CREATE INDEX "ExecutiveReportSnapshot_createdAt_idx" ON "ExecutiveReportSnapshot"("createdAt");

-- AddForeignKey
ALTER TABLE "MorrowAuthSession" ADD CONSTRAINT "MorrowAuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "MorrowUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MorrowAccessRequest" ADD CONSTRAINT "MorrowAccessRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "MorrowUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MorrowAuthChallenge" ADD CONSTRAINT "MorrowAuthChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "MorrowUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "NotificationRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalActivity" ADD CONSTRAINT "ApprovalActivity_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES "ApprovalRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirthdayProfile" ADD CONSTRAINT "BirthdayProfile_hallMemberId_fkey" FOREIGN KEY ("hallMemberId") REFERENCES "HallOfFameMemberRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
