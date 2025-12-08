/*
  Warnings:

  - You are about to drop the column `department` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `profileCompleted` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `profileLocked` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "department",
DROP COLUMN "password",
DROP COLUMN "phone",
DROP COLUMN "profileCompleted",
DROP COLUMN "profileLocked",
DROP COLUMN "section",
DROP COLUMN "year";
