/*
  Warnings:

  - The primary key for the `brokerusers` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "brokerusers" DROP CONSTRAINT "brokerusers_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "brokerusers_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "brokerusers_id_seq";
