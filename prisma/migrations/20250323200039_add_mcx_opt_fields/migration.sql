-- AlterTable
ALTER TABLE "brokerusers" ADD COLUMN     "mcxOPT_holding" INTEGER,
ADD COLUMN     "mcxOPT_intraday" INTEGER,
ADD COLUMN     "mcxOPT_limitPercentage" INTEGER,
ADD COLUMN     "mcxOPT_maxLots" INTEGER,
ADD COLUMN     "mcxOPT_orderLots" INTEGER,
ADD COLUMN     "mcxOPT_sellingOvernight" TEXT;
