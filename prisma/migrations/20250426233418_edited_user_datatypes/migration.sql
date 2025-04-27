/*
  Warnings:

  - You are about to alter the column `firstName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(55)`.
  - You are about to alter the column `lastName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(55)`.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(55),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(55),
ALTER COLUMN "email" SET DATA TYPE TEXT;
