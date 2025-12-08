-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "department" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profileLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "section" TEXT,
ADD COLUMN     "year" INTEGER;