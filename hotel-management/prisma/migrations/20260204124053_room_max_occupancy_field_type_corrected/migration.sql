/*
  Warnings:

  - Changed the type of `maxOccupancy` on the `Room` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "maxOccupancy",
ADD COLUMN     "maxOccupancy" INTEGER NOT NULL;
