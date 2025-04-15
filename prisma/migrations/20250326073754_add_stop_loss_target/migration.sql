-- CreateTable
CREATE TABLE "TradeOrder" (
    "id" TEXT NOT NULL,
    "scriptName" TEXT,
    "ltp" DOUBLE PRECISION,
    "bidPrice" DOUBLE PRECISION,
    "askPrice" DOUBLE PRECISION,
    "ltq" DOUBLE PRECISION,
    "orderType" TEXT NOT NULL,
    "lotSize" INTEGER,
    "orderLots" INTEGER,
    "quantity" INTEGER,
    "priceType" TEXT,
    "isStopLossTarget" BOOLEAN,
    "stopLoss" DOUBLE PRECISION,
    "target" DOUBLE PRECISION,
    "margin" DOUBLE PRECISION,
    "carry" DOUBLE PRECISION,
    "marginLimit" DOUBLE PRECISION,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradeOrder_pkey" PRIMARY KEY ("id")
);
