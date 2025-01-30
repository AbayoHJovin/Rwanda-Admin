/*
  Warnings:

  - The primary key for the `Cell` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Cell` table. All the data in the column will be lost.
  - The primary key for the `District` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `District` table. All the data in the column will be lost.
  - The primary key for the `Province` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Province` table. All the data in the column will be lost.
  - The primary key for the `Sector` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Sector` table. All the data in the column will be lost.
  - The primary key for the `Village` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Village` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Cell" DROP CONSTRAINT "Cell_sectorId_fkey";

-- DropForeignKey
ALTER TABLE "District" DROP CONSTRAINT "District_provinceId_fkey";

-- DropForeignKey
ALTER TABLE "Sector" DROP CONSTRAINT "Sector_districtId_fkey";

-- DropForeignKey
ALTER TABLE "Village" DROP CONSTRAINT "Village_cellId_fkey";

-- AlterTable
ALTER TABLE "Cell" DROP CONSTRAINT "Cell_pkey",
DROP COLUMN "id",
ADD COLUMN     "cellId" SERIAL NOT NULL,
ADD CONSTRAINT "Cell_pkey" PRIMARY KEY ("cellId");

-- AlterTable
ALTER TABLE "District" DROP CONSTRAINT "District_pkey",
DROP COLUMN "id",
ADD COLUMN     "districtId" SERIAL NOT NULL,
ADD CONSTRAINT "District_pkey" PRIMARY KEY ("districtId");

-- AlterTable
ALTER TABLE "Province" DROP CONSTRAINT "Province_pkey",
DROP COLUMN "id",
ADD COLUMN     "provinceId" SERIAL NOT NULL,
ADD CONSTRAINT "Province_pkey" PRIMARY KEY ("provinceId");

-- AlterTable
ALTER TABLE "Sector" DROP CONSTRAINT "Sector_pkey",
DROP COLUMN "id",
ADD COLUMN     "sectorId" SERIAL NOT NULL,
ADD CONSTRAINT "Sector_pkey" PRIMARY KEY ("sectorId");

-- AlterTable
ALTER TABLE "Village" DROP CONSTRAINT "Village_pkey",
DROP COLUMN "id",
ADD COLUMN     "villageId" SERIAL NOT NULL,
ADD CONSTRAINT "Village_pkey" PRIMARY KEY ("villageId");

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("provinceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sector" ADD CONSTRAINT "Sector_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("districtId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("sectorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("cellId") ON DELETE RESTRICT ON UPDATE CASCADE;
