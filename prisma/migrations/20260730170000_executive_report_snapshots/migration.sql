-- CreateTable
CREATE TABLE "ExecutiveReportSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "range" TEXT NOT NULL DEFAULT '30d',
    "periodStart" DATETIME,
    "periodEnd" DATETIME NOT NULL,
    "score" INTEGER NOT NULL,
    "signal" TEXT NOT NULL DEFAULT 'Steady',
    "summary" TEXT NOT NULL,
    "metricsJson" TEXT NOT NULL,
    "dimensionsJson" TEXT NOT NULL,
    "evidenceJson" TEXT NOT NULL,
    "recommendationsJson" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'Morrow Owner',
    "sourceVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ExecutiveReportSnapshot_createdAt_idx" ON "ExecutiveReportSnapshot"("createdAt");
