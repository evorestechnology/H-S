import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../lib/prisma.js';

// Ensure .env is loaded from Backend root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function createAdmin() {
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];
  const fullName = args[2] || 'System Administrator';

  if (!email || !password) {
    console.error('\n❌ Error: Missing email or password.');
    console.log('\nUsage:');
    console.log('  npm run create-admin <email> <password> [fullName]');
    console.log('\nExample:');
    console.log('  npm run create-admin admin@example.com AdminPass123 "Admin User"\n');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('\n❌ Error: Password must be at least 6 characters long.\n');
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    console.log(`\nConnecting to database and hashing password for: ${normalizedEmail}...`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        fullName: fullName.trim(),
        password: hashedPassword,
        role: 'ADMIN',
        status: 'Active',
      },
      create: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'Active',
      },
    });

    console.log('\n✅ Admin Account Ready!');
    console.log('-------------------------------------------');
    console.log(`ID:       ${user.id}`);
    console.log(`Name:     ${user.fullName}`);
    console.log(`Email:    ${user.email}`);
    console.log(`Role:     ${user.role}`);
    console.log(`Status:   ${user.status}`);
    console.log('-------------------------------------------');
    console.log('You can now log in at /login/admin in your frontend.\n');
  } catch (error) {
    console.error('\n❌ Failed to create/update admin user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
