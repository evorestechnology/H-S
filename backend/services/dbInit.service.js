import { prisma } from '../lib/prisma.js';

let initialized = false;
let initPromise = null;

export const initCustomTables = async () => {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Quick check: if Category table already exists, skip running 21 DDL statements
      try {
        const check = await prisma.$queryRawUnsafe(`SELECT 1 FROM "Category" LIMIT 1`);
        if (check && Array.isArray(check)) {
          initialized = true;
          return;
        }
      } catch (checkErr) {
        // Table doesn't exist yet, proceed with DDL creation
      }

      const ddlStatements = [
        `CREATE TABLE IF NOT EXISTS "Coupon" (
          "id" TEXT PRIMARY KEY,
          "code" TEXT UNIQUE NOT NULL,
          "type" TEXT DEFAULT 'Public',
          "discountValue" DOUBLE PRECISION DEFAULT 10,
          "discountType" TEXT DEFAULT 'Percentage',
          "minSpend" DOUBLE PRECISION DEFAULT 0,
          "usageLimit" INTEGER DEFAULT 0,
          "usageCount" INTEGER DEFAULT 0,
          "expiryDate" TEXT DEFAULT '2026-12-31',
          "status" TEXT DEFAULT 'Active',
          "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS "Setting" (
          "key" TEXT PRIMARY KEY,
          "value" JSONB NOT NULL,
          "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS "Category" (
          "id" TEXT PRIMARY KEY,
          "name" TEXT UNIQUE NOT NULL,
          "description" TEXT,
          "weightPerPiece" DOUBLE PRECISION DEFAULT 0.500,
          "conversionRule" TEXT,
          "isActive" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
        )`,

        `ALTER TABLE "User" DROP COLUMN IF EXISTS "username" CASCADE`,
        `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "categoryId" TEXT`,
        `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponCode" TEXT`,
        `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponDiscount" DOUBLE PRECISION DEFAULT 0`,
        `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponApplied" BOOLEAN DEFAULT false`,

        `CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId")`,
        `CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId")`,
        `CREATE INDEX IF NOT EXISTS "Address_userId_idx" ON "Address"("userId")`,
        `CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId")`,
        `CREATE INDEX IF NOT EXISTS "Product_inStock_createdAt_idx" ON "Product"("inStock", "createdAt")`,
        `CREATE INDEX IF NOT EXISTS "Drop_isActive_status_idx" ON "Drop"("isActive", "status")`,
        `CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId")`,
        `CREATE INDEX IF NOT EXISTS "Review_userId_idx" ON "Review"("userId")`,
        `CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role")`,
        `CREATE INDEX IF NOT EXISTS "CartItem_cartId_idx" ON "CartItem"("cartId")`,
        `CREATE INDEX IF NOT EXISTS "CartItem_productId_idx" ON "CartItem"("productId")`
      ];

      for (const statement of ddlStatements) {
        try {
          await prisma.$executeRawUnsafe(statement);
        } catch (sErr) {
          // Ignore individual table/index exists errors
        }
      }

      // Seed default categories if empty
      try {
        const catCount = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "Category"`);
        if (catCount[0]?.count === 0) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO "Category" ("id", "name", "description", "weightPerPiece", "conversionRule", "isActive")
            VALUES 
            ('CAT-001', 'T-Shirts', 'Premium performance & lifestyle gym t-shirts', 0.500, '1 kg = 2 T-Shirts', true),
            ('CAT-002', 'Hoodies', 'Heavyweight cotton & fleece gym hoodies', 1.000, '1 kg = 1 Hoodie', true),
            ('CAT-003', 'Pants', 'Athletic trackpants & sweatpants', 1.000, '1 kg = 1 Pant / SP', true),
            ('CAT-004', 'Shorts', 'Breathable athletic training shorts', 0.333, '1 kg = 3 Shorts', true),
            ('CAT-005', 'Accessories', 'Caps, wristbands, gym towels & straps', 0.250, '1 kg = 4 Accessories', true),
            ('CAT-006', 'Apparel', 'General gym & workout apparel', 0.500, '1 kg = 2 Items', true)
            ON CONFLICT ("name") DO NOTHING;
          `);
        }
      } catch (seedErr) {
        // Ignore seed check errors if table created
      }

      initialized = true;
      console.log('✓ PostgreSQL Custom Database Tables & Performance Indexes initialized successfully');
    } catch (err) {
      console.error('Warning initializing custom tables:', err.message);
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
};

