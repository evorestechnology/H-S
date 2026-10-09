import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

let dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hs_monolith_db';

if (dbUrl.includes('pooler.supabase.com') || dbUrl.includes('pgbouncer=true')) {
  if (!dbUrl.includes('connection_limit')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connection_limit=10&pool_timeout=10';
  }
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
});

