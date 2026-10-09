import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding H&S authoritative database...');

  const hashedPassword = await bcrypt.hash('Admin@123456', 10);
  const mfgPassword = await bcrypt.hash('Mfg@123456', 10);
  const userPassword = await bcrypt.hash('User@123456', 10);

  // 1. Seed Default Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hiandshi.shop' },
    update: { role: 'ADMIN' },
    create: {
      fullName: 'Master Administrator',
      email: 'admin@hiandshi.shop',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'Active',
      companyName: 'H&S Head Office'
    }
  });
  console.log('Admin user created/verified:', admin.email);

  // 2. Seed Default Manufacturer User
  const manufacturer = await prisma.user.upsert({
    where: { email: 'manufacturer@hiandshi.shop' },
    update: { role: 'MANUFACTURER' },
    create: {
      fullName: 'Apex Apparel Manufacturing',
      email: 'manufacturer@hiandshi.shop',
      password: mfgPassword,
      role: 'MANUFACTURER',
      status: 'Active',
      companyName: 'Apex Textiles Pvt Ltd',
      mobile: '+919876543210',
      country: 'India'
    }
  });
  console.log('Manufacturer user created/verified:', manufacturer.email);

  // 3. Seed Default Customer User
  const customer = await prisma.user.upsert({
    where: { email: 'customer@hiandshi.shop' },
    update: {},
    create: {
      fullName: 'Demo Customer',
      email: 'customer@hiandshi.shop',
      password: userPassword,
      role: 'USER',
      status: 'Active',
      country: 'India'
    }
  });
  console.log('Customer user created/verified:', customer.email);

  // 4. Seed Categories
  const categories = ['T-Shirts', 'Hoodies', 'Sweatshirts', 'Pants', 'Accessories'];
  for (const catName of categories) {
    await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: {
        name: catName,
        description: `Premium street culture ${catName}`,
        weightPerPiece: catName === 'Hoodies' ? 0.8 : 0.4
      }
    });
  }

  // 5. Seed Initial Tax & Shipping Settings
  await prisma.setting.upsert({
    where: { key: 'taxSettings' },
    update: {},
    create: {
      key: 'taxSettings',
      value: {
        enableGst: true,
        indianThreshold: 2500,
        indianLowRate: 5,
        indianHighRate: 18,
        nonIndianRate: 0
      }
    }
  });

  await prisma.setting.upsert({
    where: { key: 'shippingSettings' },
    update: {},
    create: {
      key: 'shippingSettings',
      value: {
        blockStepKg: 5,
        ratePerBlock: 5000,
        domesticFlatRate: 0,
        currency: 'INR (₹)'
      }
    }
  });

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
