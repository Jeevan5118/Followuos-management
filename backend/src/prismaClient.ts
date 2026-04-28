import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

// The DATABASE_URL is still used by Prisma internal engine during migrations
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Explicitly provide credentials to bypass PG parser issues with the URL
const pool = new Pool({ 
    user: 'neondb_owner',
    host: 'ep-soft-credit-ae6spt0b-pooler.c-2.us-east-2.aws.neon.tech',
    database: 'neondb',
    password: 'npg_46UsWESdaLkg',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
