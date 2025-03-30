/*
  Warnings:

  - You are about to drop the column `type` on the `License` table. All the data in the column will be lost.
  - You are about to drop the column `licenseType` on the `OrderItem` table. All the data in the column will be lost.
  - Added the required column `licenseTypeId` to the `License` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licenseTypeId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/

-- Alter the existing enum to a temporary name to avoid conflicts
ALTER TYPE "LicenseType" RENAME TO "LicenseType_old";

-- Create LicenseType table
CREATE TABLE "LicenseType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseType_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "LicenseType_name_key" ON "LicenseType"("name");
CREATE UNIQUE INDEX "LicenseType_slug_key" ON "LicenseType"("slug");

-- Insert default license types
INSERT INTO "LicenseType" ("id", "name", "slug", "description", "createdAt", "updatedAt")
VALUES 
('clty1', 'Basic', 'basic', 'Basic license with limited usage rights', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clty2', 'Premium', 'premium', 'Premium license with extended usage rights', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clty3', 'Exclusive', 'exclusive', 'Exclusive rights with full ownership transfer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add the licenseTypeId column to License table
ALTER TABLE "License" ADD COLUMN "licenseTypeId" TEXT;

-- Update existing licenses with the appropriate licenseTypeId based on the enum value
UPDATE "License" SET "licenseTypeId" = 'clty1' WHERE "type" = 'basic';
UPDATE "License" SET "licenseTypeId" = 'clty2' WHERE "type" = 'premium';
UPDATE "License" SET "licenseTypeId" = 'clty3' WHERE "type" = 'exclusive';

-- Now make the column not nullable
ALTER TABLE "License" ALTER COLUMN "licenseTypeId" SET NOT NULL;

-- Add the licenseTypeId column to OrderItem table 
ALTER TABLE "OrderItem" ADD COLUMN "licenseTypeId" TEXT;

-- Update existing OrderItems with the appropriate licenseTypeId based on the enum value
UPDATE "OrderItem" SET "licenseTypeId" = 'clty1' WHERE "licenseType" = 'basic';
UPDATE "OrderItem" SET "licenseTypeId" = 'clty2' WHERE "licenseType" = 'premium';
UPDATE "OrderItem" SET "licenseTypeId" = 'clty3' WHERE "licenseType" = 'exclusive';

-- Now make the column not nullable
ALTER TABLE "OrderItem" ALTER COLUMN "licenseTypeId" SET NOT NULL;

-- Drop the original columns
ALTER TABLE "License" DROP COLUMN "type";
ALTER TABLE "OrderItem" DROP COLUMN "licenseType";

-- Drop the enum
DROP TYPE "LicenseType_old";

-- Add foreign key constraints
ALTER TABLE "License" ADD CONSTRAINT "License_licenseTypeId_fkey" FOREIGN KEY ("licenseTypeId") REFERENCES "LicenseType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_licenseTypeId_fkey" FOREIGN KEY ("licenseTypeId") REFERENCES "LicenseType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
