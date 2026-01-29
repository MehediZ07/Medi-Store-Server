import { prisma } from "../lib/prisma";
import bcrypt from 'bcryptjs';
import { randomUUID } from "crypto";

async function seedAdmin() {
    try {
        const adminData = {
            name: "MediStore Admin",
            email: "admin@medistore.com",
            role: "ADMIN",
            password: "admin123"
        };

        const existing = await prisma.user.findUnique({
            where: { email: adminData.email }
        });

        if (existing) {
            console.log('Admin user already exists');
            return;
        }

        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        
        const user = await prisma.user.create({
            data: {
                id: randomUUID(),
                name: adminData.name,
                email: adminData.email,
                role: adminData.role as any,
                status: "ACTIVE",
                emailVerified: true
            }
        });

        await prisma.account.create({
            data: {
                id: randomUUID(),
                userId: user.id,
                accountId: user.id,
                providerId: "credential",
                password: hashedPassword
            }
        });

        const categories = [
            { name: 'Pain Relief', description: 'Analgesics, Anti-inflammatory drugs, Pain management' },
            { name: 'Antibiotics', description: 'Bacterial infection treatments, Antimicrobial drugs' },
            { name: 'Skin Care', description: 'Topical treatments, Ointments, Creams' },
            { name: 'Cold & Flu', description: 'Cough, cold, flu medications, Decongestants' },
            { name: 'Vitamins', description: 'Nutritional supplements, Multivitamins, Minerals' },
            { name: 'Heart Health', description: 'Cardiovascular medications, Blood pressure' },
            { name: 'Digestive Health', description: 'Antacids, digestive aids, Probiotics' },
            { name: 'Diabetes Care', description: 'Blood sugar management, Insulin' },
        ];

        for (const category of categories) {
            await prisma.category.upsert({
                where: { name: category.name },
                update: {},
                create: category,
            });
        }

        console.log('✅ Admin user and categories created successfully');
        console.log('🔑 Admin Login: admin@medistore.com / admin123');

    } catch (error) {
        console.error("Admin seeding failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();