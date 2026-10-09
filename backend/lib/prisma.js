import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

let dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hs_monolith_db';

// Auto-fix & format database connection string
if (dbUrl.includes('postgresql://') || dbUrl.includes('postgres://')) {
  try {
    const matches = dbUrl.match(/^(postgres(?:ql)?:\/\/[^:]+:)(.+)(@[^@\/]+(?::\d+)?(?:\/.*)?)$/);
    if (matches) {
      const prefix = matches[1];
      const rawPassword = matches[2];
      const rest = matches[3];
      if (rawPassword.includes('@') && !rawPassword.includes('%40')) {
        dbUrl = `${prefix}${encodeURIComponent(rawPassword)}${rest}`;
      }
    }
  } catch (e) {
    // Ignore URL parse error fallback
  }

  // If connecting to Supabase direct host on port 5432, rewrite to pooler port 6543 for IPv4 compatibility
  if (dbUrl.includes('.supabase.co:5432')) {
    dbUrl = dbUrl.replace('.supabase.co:5432', '.supabase.co:6543');
    if (!dbUrl.includes('pgbouncer=true')) {
      dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
    }
  }

  if (dbUrl.includes('supabase.co') && !dbUrl.includes('sslmode')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'sslmode=require';
  }

  if (dbUrl.includes('pooler.supabase.com') || dbUrl.includes('pgbouncer=true')) {
    if (!dbUrl.includes('connection_limit')) {
      dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connection_limit=10&pool_timeout=10';
    }
  }
  if (!dbUrl.includes('connect_timeout')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=10';
  }
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
});

