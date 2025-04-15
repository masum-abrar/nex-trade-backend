-- AlterTable
ALTER TABLE "brokerusers" ADD COLUMN     "idxNSE_commission" INTEGER,
ADD COLUMN     "idxNSE_commissionType" TEXT,
ADD COLUMN     "idxNSE_holding" INTEGER,
ADD COLUMN     "idxNSE_intraday" INTEGER,
ADD COLUMN     "idxNSE_limitPercentage" INTEGER,
ADD COLUMN     "idxNSE_maxLots" INTEGER,
ADD COLUMN     "idxNSE_orderLots" INTEGER,
ADD COLUMN     "nse_maxExchLots" INTEGER;
