import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.js';

// Crear instancia singleton de Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.isProduction ? ['error'] : ['query', 'error', 'warn'],
  });

if (!config.isProduction) {
  globalForPrisma.prisma = prisma;
}

// Función para cerrar conexión
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

export default prisma;
