-- AlterTable
ALTER TABLE "Deposit" ADD COLUMN     "depositType" TEXT NOT NULL DEFAULT 'Deposit',
ADD COLUMN     "loginUserId" TEXT,
ALTER COLUMN "depositAmount" DROP NOT NULL;
