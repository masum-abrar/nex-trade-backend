-- CreateTable
CREATE TABLE "brokerusers" (
    "id" SERIAL NOT NULL,
    "loginUsrid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "marginType" TEXT NOT NULL,
    "segmentAllow" TEXT NOT NULL,
    "intradaySquare" TEXT NOT NULL,
    "ledgerBalanceClose" INTEGER NOT NULL,
    "profitTradeHoldMinSec" INTEGER NOT NULL,
    "lossTradeHoldMinSec" INTEGER NOT NULL,

    CONSTRAINT "brokerusers_pkey" PRIMARY KEY ("id")
);
