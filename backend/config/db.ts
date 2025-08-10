import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test the connection
prisma.$connect()
  .then(() => {
    console.log('PostgreSQL connected successfully via Prisma');
  })
  .catch((err: Error) => {
    console.error('PostgreSQL connection error:', err);
  });

export default prisma;