-- AlterTable
ALTER TABLE "brokerusers" ADD COLUMN     "mcx_commission" INTEGER,
ADD COLUMN     "mcx_commissionType" TEXT,
ADD COLUMN     "mcx_holding" TEXT,
ADD COLUMN     "mcx_intraday" INTEGER,
ADD COLUMN     "mcx_limitPercentage" INTEGER,
ADD COLUMN     "mcx_maxExchLots" INTEGER,
ADD COLUMN     "mcx_maxLots" INTEGER,
ADD COLUMN     "mcx_orderLots" INTEGER;
