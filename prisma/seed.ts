import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear usuario de ejemplo
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'jarregui92@gmail.com' },
    update: {},
    create: {
      email: 'jarregui92@gmail.com',
      password: hashedPassword,
      nombre: 'Julian Arregui',
      telefono: '+59891261089',
      whatsapp: '+59891261089',
      instagram: 'jarregui92',
      facebook: 'julian.arregui.5',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'lucas@example.com' },
    update: {},
    create: {
      email: 'lucas@example.com',
      password: hashedPassword,
      nombre: 'Lucas Moyano',
      telefono: '+59898817029',
      whatsapp: '+59898817029',
      instagram: 'lucasguzmanmm',
    },
  });

  console.log('✅ Users created:', { user1: user1.email, user2: user2.email });

  // Crear mascotas de ejemplo
  const chloe = await prisma.pet.upsert({
    where: { slug: 'chloe' },
    update: {},
    create: {
      slug: 'chloe',
      nombre: 'Chloe',
      especie: 'Gato',
      raza: 'Naranja',
      edad: '6 años',
      descripcion: 'Gata tranquila, cariñosa y muy curiosa. No suele dejarse agarrar por desconocidos.',
      indicaciones: 'Acercarse lentamente. No intentar cargarla si está nerviosa.',
      fotoPrincipal: 'https://images.unsplash.com/photo-1702701752458-19366f87fad8?q=80&w=816&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      ubicacion: 'Montevideo, Uruguay',
      ownerId: user1.id,
      fotos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1702701752458-19366f87fad8?q=80&w=816&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            caption: 'Foto principal de Chloe',
            orden: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1593483316242-efb5420596ca?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            caption: 'Chloe',
            orden: 1,
          },
        ],
      },
    },
  });

  const paris = await prisma.pet.upsert({
    where: { slug: 'paris' },
    update: {},
    create: {
      slug: 'paris',
      nombre: 'Paris',
      especie: 'Perra',
      raza: 'Caniche',
      edad: '5 años',
      descripcion: 'Perra tranquila, cariñosa y muy curiosa. No suele dejarse agarrar por desconocidos.',
      indicaciones: 'Acercarse lentamente. No intentar cargarla si está nerviosa.',
      fotoPrincipal: '/images/pets/paris1.png',
      ubicacion: 'Montevideo, Uruguay',
      ownerId: user2.id,
      fotos: {
        create: [
          {
            url: '/images/pets/paris2.png',
            caption: 'Foto principal de Paris',
            orden: 0,
          },
          {
            url: '/images/pets/paris3.png',
            caption: 'Paris',
            orden: 1,
          },
        ],
      },
    },
  });

  console.log('✅ Pets created:', { chloe: chloe.nombre, paris: paris.nombre });

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
