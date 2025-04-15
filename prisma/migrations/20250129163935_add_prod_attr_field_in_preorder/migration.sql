-- AlterTable
ALTER TABLE "Preorder" ADD COLUMN     "productAttributeId" TEXT;

-- AddForeignKey
ALTER TABLE "Preorder" ADD CONSTRAINT "Preorder_productAttributeId_fkey" FOREIGN KEY ("productAttributeId") REFERENCES "ProductAttribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
