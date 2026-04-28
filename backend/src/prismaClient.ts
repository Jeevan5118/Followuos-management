import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import path from 'path';
import dotenv from 'dotenv';

// Use path.resolve to find .env correctly on localhost
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Use WebSocket for Node.js (not edge runtime)
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('[PRISMA] FATAL: DATABASE_URL is not set in environment variables!');
}

const adapter = new PrismaNeon({ connectionString: connectionString! });

export const prisma = new PrismaClient({ adapter });
