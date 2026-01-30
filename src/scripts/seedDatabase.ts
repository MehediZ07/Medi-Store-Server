import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data in correct order (respecting foreign key constraints)
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.medicine.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();

    console.log('🗑️ Cleared existing data');

    // Create Categories
    const categories = await Promise.all([
      prisma.category.create({
        data: { name: 'Pain Relief', description: 'Analgesics, Anti-inflammatory drugs, Pain management' }
      }),
      prisma.category.create({
        data: { name: 'Antibiotics', description: 'Bacterial infection treatments, Antimicrobial drugs' }
      }),
      prisma.category.create({
        data: { name: 'Vitamins', description: 'Nutritional supplements, Multivitamins, Minerals' }
      }),
      prisma.category.create({
        data: { name: 'Cold & Flu', description: 'Cough, cold, flu medications, Decongestants' }
      }),
      prisma.category.create({
        data: { name: 'Digestive Health', description: 'Antacids, digestive aids, Probiotics' }
      }),
      prisma.category.create({
        data: { name: 'Heart Health', description: 'Cardiovascular medications, Blood pressure' }
      }),
      prisma.category.create({
        data: { name: 'Diabetes Care', description: 'Blood sugar management, Insulin' }
      }),
      prisma.category.create({
        data: { name: 'Skin Care', description: 'Topical treatments, Ointments, Creams' }
      })
    ]);

    console.log('✅ Created categories');

    // Create Customers
    const customers = [];
    const customerData = [
      { email: 'john.customer@email.com', name: 'John Smith', password: 'customer123' },
      { email: 'sarah.jones@email.com', name: 'Sarah Jones', password: 'customer123' },
      { email: 'mike.wilson@email.com', name: 'Mike Wilson', password: 'customer123' },
      { email: 'emma.davis@email.com', name: 'Emma Davis', password: 'customer123' },
      { email: 'alex.brown@email.com', name: 'Alex Brown', password: 'customer123' }
    ];

    for (const data of customerData) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const customer = await prisma.user.create({
        data: {
          id: randomUUID(),
          email: data.email,
          name: data.name,
          role: 'CUSTOMER',
          status: 'ACTIVE',
          emailVerified: true,
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        }
      });

      await prisma.account.create({
        data: {
          id: randomUUID(),
          userId: customer.id,
          accountId: customer.id,
          providerId: 'credential',
          password: hashedPassword
        }
      });

      customers.push(customer);
    }

    // Create Sellers
    const sellers = [];
    const sellerData = [
      { email: 'pharma.one@email.com', name: 'Pharma One', password: 'seller123' },
      { email: 'medplus.store@email.com', name: 'MedPlus Store', password: 'seller123' },
      { email: 'apollo.pharmacy@email.com', name: 'Apollo Pharmacy', password: 'seller123' },
      { email: 'wellness.mart@email.com', name: 'Wellness Mart', password: 'seller123' },
      { email: 'health.hub@email.com', name: 'Health Hub', password: 'seller123' }
    ];

    for (const data of sellerData) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const seller = await prisma.user.create({
        data: {
          id: randomUUID(),
          email: data.email,
          name: data.name,
          role: 'SELLER',
          status: 'ACTIVE',
          emailVerified: true,
          image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
        }
      });

      await prisma.account.create({
        data: {
          id: randomUUID(),
          userId: seller.id,
          accountId: seller.id,
          providerId: 'credential',
          password: hashedPassword
        }
      });

      sellers.push(seller);
    }

    console.log('✅ Created users');

    // Create Medicines
    const medicines = await Promise.all([
      prisma.medicine.create({
        data: {
          name: 'Paracetamol 500mg',
          description: 'Effective pain relief and fever reducer. Safe for adults and children.',
          price: 25.50,
          stock: 100,
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop',
          sellerId: sellers[0].id,
          categoryId: categories[0].id,
          status: 'ACTIVE'
        }
      }),
      prisma.medicine.create({
        data: {
          name: 'Amoxicillin 250mg',
          description: 'Broad-spectrum antibiotic for bacterial infections. Prescription required.',
          price: 45.00,
          stock: 75,
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop',
          sellerId: sellers[1].id,
          categoryId: categories[1].id,
          status: 'ACTIVE'
        }
      }),
      prisma.medicine.create({
        data: {
          name: 'Multivitamin Complex',
          description: 'Complete daily vitamin and mineral supplement for overall health.',
          price: 35.75,
          stock: 120,
          image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop',
          sellerId: sellers[2].id,
          categoryId: categories[2].id,
          status: 'ACTIVE'
        }
      }),
      prisma.medicine.create({
        data: {
          name: 'Cough Syrup 100ml',
          description: 'Effective relief from dry and wet cough. Suitable for adults.',
          price: 18.25,
          stock: 90,
          image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=300&fit=crop',
          sellerId: sellers[3].id,
          categoryId: categories[3].id,
          status: 'ACTIVE'
        }
      }),
      prisma.medicine.create({
        data: {
          name: 'Antacid Tablets',
          description: 'Fast relief from heartburn, acid indigestion, and upset stomach.',
          price: 12.50,
          stock: 150,
          image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300&h=300&fit=crop',
          sellerId: sellers[4].id,
          categoryId: categories[4].id,
          status: 'ACTIVE'
        }
      }),
      prisma.medicine.create({
        data: {
          name: 'Blood Pressure Monitor',
          description: 'Digital blood pressure monitor for home use. Easy to read display.',
          price: 85.00,
          stock: 25,
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop',
          sellerId: sellers[0].id,
          categoryId: categories[5].id,
          status: 'ACTIVE'
        }
      }),
      prisma.medicine.create({
        data: {
          name: 'Glucose Test Strips',
          description: 'Accurate blood glucose test strips for diabetes monitoring.',
          price: 28.75,
          stock: 80,
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop',
          sellerId: sellers[1].id,
          categoryId: categories[6].id,
          status: 'ACTIVE'
        }
      }),
      prisma.medicine.create({
        data: {
          name: 'Antiseptic Cream',
          description: 'Topical antiseptic cream for cuts, wounds, and minor skin infections.',
          price: 15.25,
          stock: 110,
          image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop',
          sellerId: sellers[2].id,
          categoryId: categories[7].id,
          status: 'ACTIVE'
        }
      })
    ]);

    console.log('✅ Created medicines');

    // Create Orders
    const orders = await Promise.all([
      prisma.order.create({
        data: {
          customerId: customers[0].id,
          totalAmount: 71.00,
          status: 'DELIVERED',
          fullName: 'John Smith',
          address: '123 Main Street',
          city: 'New York',
          zipCode: '10001',
          phone: '+1-555-0123',
          orderItems: {
            create: [
              { medicineId: medicines[0].id, quantity: 2, price: 25.50 },
              { medicineId: medicines[3].id, quantity: 1, price: 18.25 }
            ]
          }
        }
      }),
      prisma.order.create({
        data: {
          customerId: customers[1].id,
          totalAmount: 80.75,
          status: 'SHIPPED',
          fullName: 'Sarah Jones',
          address: '456 Oak Avenue',
          city: 'Los Angeles',
          zipCode: '90210',
          phone: '+1-555-0456',
          orderItems: {
            create: [
              { medicineId: medicines[1].id, quantity: 1, price: 45.00 },
              { medicineId: medicines[2].id, quantity: 1, price: 35.75 }
            ]
          }
        }
      }),
      prisma.order.create({
        data: {
          customerId: customers[2].id,
          totalAmount: 113.75,
          status: 'PROCESSING',
          fullName: 'Mike Wilson',
          address: '789 Pine Road',
          city: 'Chicago',
          zipCode: '60601',
          phone: '+1-555-0789',
          orderItems: {
            create: [
              { medicineId: medicines[5].id, quantity: 1, price: 85.00 },
              { medicineId: medicines[6].id, quantity: 1, price: 28.75 }
            ]
          }
        }
      }),
      prisma.order.create({
        data: {
          customerId: customers[3].id,
          totalAmount: 43.75,
          status: 'PLACED',
          fullName: 'Emma Davis',
          address: '321 Elm Street',
          city: 'Miami',
          zipCode: '33101',
          phone: '+1-555-0321',
          orderItems: {
            create: [
              { medicineId: medicines[2].id, quantity: 1, price: 35.75 },
              { medicineId: medicines[7].id, quantity: 1, price: 15.25 }
            ]
          }
        }
      })
    ]);

    console.log('✅ Created orders');

    // Create Reviews
    await Promise.all([
      prisma.review.create({
        data: {
          customerId: customers[0].id,
          medicineId: medicines[0].id,
          rating: 5,
          comment: 'Excellent pain relief medication. Works quickly and effectively.'
        }
      }),
      prisma.review.create({
        data: {
          customerId: customers[1].id,
          medicineId: medicines[1].id,
          rating: 4,
          comment: 'Good antibiotic, helped clear my infection. Fast delivery.'
        }
      }),
      prisma.review.create({
        data: {
          customerId: customers[2].id,
          medicineId: medicines[2].id,
          rating: 5,
          comment: 'Great multivitamin supplement. Feel more energetic since taking it.'
        }
      }),
      prisma.review.create({
        data: {
          customerId: customers[3].id,
          medicineId: medicines[3].id,
          rating: 4,
          comment: 'Effective cough syrup. Taste is okay and works well.'
        }
      }),
      prisma.review.create({
        data: {
          customerId: customers[4].id,
          medicineId: medicines[4].id,
          rating: 5,
          comment: 'Perfect for acid reflux. Quick relief and good value for money.'
        }
      })
    ]);

    console.log('✅ Created reviews');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   • 5 Customer users`);
    console.log(`   • 5 Seller users`);
    console.log(`   • 8 Categories`);
    console.log(`   • 8 Medicines`);
    console.log(`   • 4 Orders`);
    console.log(`   • 5 Reviews`);
    console.log(`\n🔑 Login Credentials:`);
    console.log(`   Customer: john.customer@email.com / customer123`);
    console.log(`   Seller: pharma.one@email.com / seller123`);
    console.log(`\n📝 Note: Run 'npm run seed:admin' to create admin user`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();