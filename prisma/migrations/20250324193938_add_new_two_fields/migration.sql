-- AlterTable
ALTER TABLE "brokerusers" ADD COLUMN     "STKOPTSELL_allow" TEXT,
ADD COLUMN     "STKOPTSELL_commission" INTEGER,
ADD COLUMN     "STKOPTSELL_commissionType" TEXT,
ADD COLUMN     "STKOPTSELL_strike" INTEGER,
ADD COLUMN     "STKOPT_holding" INTEGER,
ADD COLUMN     "STKOPT_intraday" INTEGER,
ADD COLUMN     "STKOPT_limitPercentage" INTEGER,
ADD COLUMN     "STKOPT_maxLots" INTEGER,
ADD COLUMN     "STKOPT_orderLots" INTEGER,
ADD COLUMN     "STKOPT_sellingOvernight" TEXT;
