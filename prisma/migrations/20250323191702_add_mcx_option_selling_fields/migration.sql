-- AlterTable
ALTER TABLE "brokerusers" ADD COLUMN     "mcxOPTSELL_allow" TEXT,
ADD COLUMN     "mcxOPTSELL_commission" INTEGER,
ADD COLUMN     "mcxOPTSELL_commissionType" TEXT,
ADD COLUMN     "mcxOPTSELL_strike" INTEGER;
