-- CreateTable
CREATE TABLE "WorkspaceSettings" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "headline" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "relevance" TEXT NOT NULL DEFAULT 'Medium',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KpiItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "owner" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Not Started',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "dueDate" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "outcome" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SocialDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "campaign" TEXT NOT NULL DEFAULT '',
    "platform" TEXT NOT NULL DEFAULT 'Instagram',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "scheduledDate" TEXT NOT NULL DEFAULT '',
    "caption" TEXT NOT NULL DEFAULT '',
    "visualDirection" TEXT NOT NULL DEFAULT '',
    "hashtags" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AssetRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Document',
    "project" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Raw',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "link" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GlobalEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'Global Observance',
    "relevance" TEXT NOT NULL DEFAULT 'Medium',
    "status" TEXT NOT NULL DEFAULT 'Idea',
    "contentAngle" TEXT NOT NULL DEFAULT '',
    "visualDirection" TEXT NOT NULL DEFAULT '',
    "captionDraft" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BirthdayProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "month" INTEGER NOT NULL DEFAULT 1,
    "day" INTEGER NOT NULL DEFAULT 1,
    "photoUrl" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "preferredTone" TEXT NOT NULL DEFAULT 'Warm',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AiDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Caption',
    "tone" TEXT NOT NULL DEFAULT 'Premium',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "instruction" TEXT NOT NULL DEFAULT '',
    "sourceText" TEXT NOT NULL DEFAULT '',
    "output" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
