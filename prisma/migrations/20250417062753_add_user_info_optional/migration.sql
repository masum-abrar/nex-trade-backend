/*
  Warnings:

  - The `mcx_holding` column on the `brokerusers` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "brokerusers" DROP COLUMN "mcx_holding",
ADD COLUMN     "mcx_holding" INTEGER;
