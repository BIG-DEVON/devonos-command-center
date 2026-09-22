-- CreateTable
CREATE TABLE "ApprovalRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ApprovalActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "approvalId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor" TEXT NOT NULL DEFAULT 'Big Devon',
    "detail" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApprovalActivity_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES "ApprovalRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ApprovalRequest_status_dueDate_idx" ON "ApprovalRequest"("status", "dueDate");

-- CreateIndex
CREATE INDEX "ApprovalActivity_approvalId_createdAt_idx" ON "ApprovalActivity"("approvalId", "createdAt");
