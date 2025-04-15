/*
  Warnings:

  - Changed the type of `intradaySquare` on the `brokerusers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "brokerusers" DROP COLUMN "intradaySquare",
ADD COLUMN     "intradaySquare" BOOLEAN NOT NULL;
