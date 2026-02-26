/**
 * Seed script: creates sample products and optional admin user.
 * Prices in Philippine pesos (PHP), two decimals. Run: npm run prisma:seed (after prisma generate and migrate)
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

  // Initial products – images in WP-FE public/products/. Prices in PHP (with decimals).
  const products = [
    {
      name: 'Willow.Prints Logo Tote Bag',
      description:
        'Our signature cream canvas tote features the Willow.Prints Arts & Crafts logo in crisp black print. Made from sturdy, natural fabric that holds up to daily use, this bag is roomy enough for groceries, books, or a day out. The classic design works for gifting or keeping for yourself. Pair it with any outfit for a touch of handmade charm.',
      price: 449.95,
      images: ['/products/tote-willowprints.jpg'],
    },
    {
      name: 'Themed Design Tote Bag',
      description:
        'Stand out with this cream canvas tote featuring a bold, graphic design. Perfect for expressing your style, it combines durable construction with a roomy interior. The high-quality print stays vivid wash after wash. Ideal for concerts, travel, or everyday carry—a statement piece that’s also practical.',
      price: 499.95,
      images: ['/products/tote-themed.jpg'],
    },
    {
      name: 'Personalized Burlap Tote',
      description:
        'A natural burlap tote with a white canvas pocket personalised with a name in elegant script. White rope handles and a button closure give it a rustic, handmade feel. Choose a name and we’ll print it for you—great for gifts, events, or a unique everyday bag. Sturdy and distinctive.',
      price: 549.5,
      images: ['/products/tote-personalized.jpg'],
    },
    {
      name: 'Happy Mother\'s Day Glass Mug',
      description:
        'A clear glass mug with "Happy Mother\'s Day" in decorative script and a subtle copper or bronze finish. Dishwasher-safe and perfect for coffee, tea, or hot chocolate. A thoughtful, lasting gift that she’ll use every morning. Simple, elegant, and made to be enjoyed year after year.',
      price: 349.99,
      images: ['/products/mug-mothers-day.jpg'],
    },
    {
      name: 'Personalized Acrylic Keychains',
      description:
        'Clear acrylic keychains with your choice of name and floral or patterned designs. Available in oval or round shapes, with various text and background colours. Each comes with a keyring and an optional tassel. Perfect as favours, gifts, or a little treat for yourself. Lightweight and durable.',
      price: 199.99,
      images: ['/products/keychains-acrylic.jpg'],
    },
    {
      name: 'Personalized Glass Mugs',
      description:
        'Clear glass mugs personalised with a name in elegant black script. Ideal for the office, home, or as a thoughtful gift. The design is understated and timeless—great for anyone who appreciates a personal touch. Dishwasher-safe and built for everyday use.',
      price: 349.99,
      images: ['/products/mugs-personalized.jpg'],
    },
    {
      name: 'Name Tag Keychains',
      description:
        'Cream-coloured tag keychains with your name in bold neon pink. Gold lobster clasp, colourful ball chain, and a heart-shaped carabiner make these fun and easy to spot. Perfect for bags, keys, or as event giveaways. Cheerful, customizable, and made to last.',
      price: 249.95,
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
