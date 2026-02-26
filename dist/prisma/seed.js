"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminEmail = 'admin@willowprints.test';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
        const passwordHash = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'Admin',
                passwordHash,
                role: client_1.Role.admin,
            },
        });
        console.log('Created admin user:', adminEmail);
    }
    const products = [
        {
            name: 'Botanical No. 1',
            description: 'A delicate botanical print on archival paper. Perfect for a calm corner or above your desk.',
            price: 28.0,
            images: [
                'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80',
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
            ],
        },
        {
            name: 'Dawn Landscape',
            description: 'Soft gradient landscape print. Brings a quiet, morning mood to any room.',
            price: 32.0,
            images: [
                'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&q=80',
                'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80',
            ],
        },
        {
            name: 'Abstract Blush',
            description: 'Minimal abstract print in blush and cream. Fits seamlessly into pastel interiors.',
            price: 26.0,
            images: [
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
                'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&q=80',
            ],
        },
        {
            name: 'Muted Florals',
            description: 'Gentle floral composition with muted tones. Printed on sustainable paper.',
            price: 30.0,
            images: [
                'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80',
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
            ],
        },
        {
            name: 'Soft Geometry',
            description: 'Clean geometric shapes in soft pastels. Ideal for modern, minimal spaces.',
            price: 24.0,
            images: [
                'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80',
                'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&q=80',
            ],
        },
        {
            name: 'Meadow Study',
            description: 'Inspired by quiet meadows. A restful addition to bedrooms or reading nooks.',
            price: 29.0,
            images: [
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
                'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80',
            ],
        },
    ];
    for (const p of products) {
        const existing = await prisma.product.findFirst({ where: { name: p.name } });
        if (!existing) {
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
    console.log('Seeded', products.length, 'products');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map