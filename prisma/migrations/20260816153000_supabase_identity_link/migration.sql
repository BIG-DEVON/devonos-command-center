ALTER TABLE "MorrowUser" ADD COLUMN "supabaseUserId" TEXT;

CREATE UNIQUE INDEX "MorrowUser_supabaseUserId_key" ON "MorrowUser"("supabaseUserId");
