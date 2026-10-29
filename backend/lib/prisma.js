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

  if (dbUrl.includes('pooler.supabase.com') || dbUrl.includes('pgbouncer=true')) {
    if (!dbUrl.includes('connection_limit')) {
      dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connection_limit=15';
    }
    if (!dbUrl.includes('pool_timeout')) {
      dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pool_timeout=60';
    } else if (dbUrl.includes('pool_timeout=20') || dbUrl.includes('pool_timeout=10')) {
      dbUrl = dbUrl.replace(/pool_timeout=\d+/, 'pool_timeout=60');
    }
  }
  if (!dbUrl.includes('connect_timeout')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=30';
  }
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
});

