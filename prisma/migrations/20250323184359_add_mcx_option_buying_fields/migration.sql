-- AlterTable
ALTER TABLE "brokerusers" ADD COLUMN     "mcxOPTBUY_allow" TEXT,
ADD COLUMN     "mcxOPTBUY_commission" INTEGER,
ADD COLUMN     "mcxOPTBUY_commissionType" TEXT,
ADD COLUMN     "mcxOPTBUY_strike" INTEGER;
