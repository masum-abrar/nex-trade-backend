-- CreateTable
CREATE TABLE "Deposit" (
    "id" SERIAL NOT NULL,
    "depositAmount" DOUBLE PRECISION NOT NULL,
    "depositImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);
