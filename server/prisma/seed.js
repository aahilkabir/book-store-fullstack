import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // 1. Create Admin User
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password_hash: passwordHash,
            role: 'ADMIN',
        },
    });
    console.log({ admin });

    // 2. Create Categories
    const categories = ['Fiction', 'Technology', 'Science', 'Business'];
    for (const name of categories) {
        await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }

    // 3. Create Sample Books
    const techCategory = await prisma.category.findUnique({ where: { name: 'Technology' } });

    if (techCategory) {
        await prisma.book.createMany({
            data: [
                {
                    title: 'Clean Code',
                    author: 'Robert C. Martin',
                    description: 'A Handbook of Agile Software Craftsmanship',
                    price: 30.00,
                    stock: 10,
                    image_url: 'https://images-na.ssl-images-amazon.com/images/I/41jEbK-jG+L._SX258_BO1,204,203,200_.jpg',
                    category_id: techCategory.id
                },
                {
                    title: 'The Pragmatic Programmer',
                    author: 'Andrew Hunt',
                    description: 'Your Journey to Mastery',
                    price: 35.50,
                    stock: 5,
                    image_url: 'https://images-na.ssl-images-amazon.com/images/I/41as+WafrFL._SX258_BO1,204,203,200_.jpg',
                    category_id: techCategory.id
                }
            ],
            skipDuplicates: true,
        });
    }

    console.log('Seeding completed.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
