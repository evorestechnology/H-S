import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

let dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hs_monolith_db';

// Auto-encode special characters like '@' in PostgreSQL password if unencoded
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

