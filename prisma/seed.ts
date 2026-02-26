/**
 * Seed script: creates sample products and optional admin user.
 * Prices in Philippine pesos (PHP). Run: npm run prisma:seed (after prisma generate and migrate)
 */

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Optional: create admin user for testing
  const adminEmail = 'admin@willowprints.test';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        passwordHash,
        role: Role.admin,
      },
    });
    console.log('Created admin user:', adminEmail);
  }

  // Initial products – images in WP-FE public/products/ (paths relative to FE origin). Prices in PHP.
  const products = [
    {
      name: 'Willow.Prints Logo Tote Bag',
      description:
        'Cream canvas tote with the Willow.Prints Arts & Crafts logo. Sturdy, natural fabric with black printed design. Perfect for daily use or gifting.',
      price: 449,
      images: ['/products/tote-willowprints.jpg'],
    },
    {
      name: 'Themed Design Tote Bag',
      description:
        'Cream canvas tote with a bold graphic design. Statement piece for fans of music and style. Durable construction, roomy interior.',
      price: 499,
      images: ['/products/tote-themed.jpg'],
    },
    {
      name: 'Personalized Burlap Tote',
      description:
        'Natural burlap tote with white canvas pocket. Custom name printed in elegant script (example: Ethel). White rope handles and button closure.',
      price: 549,
      images: ['/products/tote-personalized.jpg'],
    },
    {
      name: 'Happy Mother\'s Day Glass Mug',
      description:
        'Clear glass mug with "Happy Mother\'s Day" in decorative script. Copper/bronze finish. Dishwasher-safe, perfect for a thoughtful gift.',
      price: 349,
      images: ['/products/mug-mothers-day.jpg'],
    },
    {
      name: 'Personalized Acrylic Keychains',
      description:
        'Clear acrylic keychains with custom names and floral designs. Multiple styles: oval or round, various text and background colors. Includes keyring and optional tassel.',
      price: 199,
      images: ['/products/keychains-acrylic.jpg'],
    },
    {
      name: 'Personalized Glass Mugs',
      description:
        'Clear glass mugs with your name in elegant black script. Ideal for home, office, or as a gift. Simple and timeless.',
      price: 349,
      images: ['/products/mugs-personalized.jpg'],
    },
    {
      name: 'Name Tag Keychains',
      description:
        'Cream tag keychains with your name in bold neon pink. Gold lobster clasp, colorful ball chain, and heart-shaped carabiner. Fun and customizable.',
      price: 249,
      images: ['/products/keychains-name-tags.jpg'],
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          description: p.description,
          price: p.price,
          images: p.images,
        },
      });
    } else {
      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          images: p.images,
        },
      });
    }
  }
  console.log('Seeded', products.length, 'products (prices in PHP)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
