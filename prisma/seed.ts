const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const genres = [
  { name: 'Hip Hop', slug: 'hip-hop', description: 'Hip hop beats with classic boom bap patterns' },
  { name: 'Trap', slug: 'trap', description: 'Modern trap beats with heavy 808s and hi-hats' },
  { name: 'R&B', slug: 'r-and-b', description: 'Smooth R&B beats for soulful vocals' },
  { name: 'Pop', slug: 'pop', description: 'Catchy pop beats with commercial appeal' },
  { name: 'Drill', slug: 'drill', description: 'Hard-hitting drill beats with dark atmospheres' },
  { name: 'Afrobeats', slug: 'afrobeats', description: 'Afrobeats with infectious rhythms and melodies' },
  { name: 'House', slug: 'house', description: 'Electronic house beats for dance music' },
  { name: 'Lo-Fi', slug: 'lo-fi', description: 'Relaxed lo-fi beats with nostalgic textures' },
  { name: 'Reggaeton', slug: 'reggaeton', description: 'Reggaeton beats with dembow rhythm' },
  { name: 'Jazz', slug: 'jazz', description: 'Jazz-influenced beats with complex harmonies' },
];

async function main() {
  console.log('Starting seeding process...');

  // Seed genres
  console.log('Seeding genres...');
  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: {
        name: genre.name,
        slug: genre.slug,
        description: genre.description,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 