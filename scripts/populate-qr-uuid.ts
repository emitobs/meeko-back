/**
 * Script para poblar qrUuid en mascotas existentes
 */
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Poblando qrUuid para mascotas existentes...');

    // Buscar mascotas sin qrUuid
    const petsWithoutQrUuid = await prisma.pet.findMany({
        where: {
            qrUuid: null,
        },
        select: {
            id: true,
            nombre: true,
            slug: true,
        },
    });

    if (petsWithoutQrUuid.length === 0) {
        console.log('✅ Todas las mascotas ya tienen qrUuid');
        return;
    }

    console.log(`📝 Encontradas ${petsWithoutQrUuid.length} mascotas sin qrUuid`);

    // Actualizar cada mascota con un qrUuid único
    for (const pet of petsWithoutQrUuid) {
        const qrUuid = uuidv4();
        await prisma.pet.update({
            where: { id: pet.id },
            data: { qrUuid },
        });
        console.log(`  ✓ ${pet.nombre} (${pet.slug}) → ${qrUuid}`);
    }

    console.log('✅ qrUuid poblado exitosamente para todas las mascotas');
}

main()
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
