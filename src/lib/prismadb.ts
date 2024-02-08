import { PrismaClient } from '@prisma/client';

const client = global.prismadb || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  global.prismadb = client;
}

export default client;