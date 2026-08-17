import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Startup hook for Vercel SQLite hosting
if (process.env.VERCEL === '1') {
  const destDbPath = '/tmp/dev.db';
  const srcDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

  if (!fs.existsSync(destDbPath)) {
    try {
      console.log('Vercel environment detected. Copying SQLite database to /tmp...');
      // Ensure destination directory exists (though /tmp always does)
      const destDir = path.dirname(destDbPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(srcDbPath, destDbPath);
      console.log('Database copied successfully to', destDbPath);
    } catch (e) {
      console.error('Error copying SQLite database to /tmp:', e);
    }
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
