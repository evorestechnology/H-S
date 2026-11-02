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

  // Convert Direct Supabase URL (db.ref.supabase.co:5432, which is IPv6-only)
  // to Supabase IPv4 Pooler URL (aws-0-region.pooler.supabase.com) for platforms like Render
  if (dbUrl.includes('.supabase.co')) {
    const supabaseMatch = dbUrl.match(/^postgres(?:ql)?:\/\/([^:]+):([^@]+)@db\.([a-z0-9]+)\.supabase\.co(?::\d+)?\/(.+)$/i);
    if (supabaseMatch) {
      const [, user, pass, ref, path] = supabaseMatch;
      const poolerUser = user.includes('.') ? user : `${user}.${ref}`;
      const region = process.env.SUPABASE_REGION || 'ap-south-1';
      const poolerHost = process.env.SUPABASE_POOLER_HOST || `aws-0-${region}.pooler.supabase.com`;
      const poolerPort = process.env.SUPABASE_POOLER_PORT || '5432';
      const cleanPath = path.replace(/[?&]pgbouncer=true/, '');
      dbUrl = `postgresql://${poolerUser}:${pass}@${poolerHost}:${poolerPort}/${cleanPath}`;
      console.log(`[Database] Transformed direct Supabase IPv6 URL to IPv4 connection pooler (${poolerHost}:${poolerPort})`);
    }
  }

  // Ensure SSL mode for Supabase connections if not specified
  if ((dbUrl.includes('supabase.co') || dbUrl.includes('supabase.com')) && !dbUrl.includes('sslmode')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'sslmode=require';
  }

  // Enforce a safe connection limit strictly below the PostgreSQL provider's 15-connection ceiling.
  // Using 10 connections allows Prisma to queue queries internally while preserving a 5-connection buffer
  // for handshakes, graceful recycling, background tasks, and health checks.
  const maxPoolConnections = parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10) || 10;
  if (dbUrl.includes('connection_limit=')) {
    dbUrl = dbUrl.replace(/connection_limit=\d+/, `connection_limit=${maxPoolConnections}`);
  } else {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + `connection_limit=${maxPoolConnections}`;
  }

  if (dbUrl.includes('pool_timeout=')) {
    dbUrl = dbUrl.replace(/pool_timeout=\d+/, 'pool_timeout=60');
  } else {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pool_timeout=60';
  }

  if (!dbUrl.includes('connect_timeout=')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=30';
  }
}

// Preserve a single shared PrismaClient across the process lifecycle (including hot-reloads)
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.__hsPrismaInstance || new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
});

globalForPrisma.__hsPrismaInstance = prisma;


