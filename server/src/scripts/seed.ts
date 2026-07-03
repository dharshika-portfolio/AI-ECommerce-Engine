import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import { Product } from '../models/Product.model';
import { User } from '../models/User.model';
import bcrypt from 'bcrypt';

dotenv.config();

const SEED_COUNT = 5000;

async function seed() {
  await connectDB();
  await Product.deleteMany({});

  const products = Array.from({ length: SEED_COUNT }, () => ({
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price({ min: 199, max: 9999 })),
    category: faker.helpers.arrayElement(['Apparel', 'Footwear', 'Electronics', 'Home', 'Sports']),
    stock: faker.number.int({ min: 0, max: 500 }),
    isActive: true,
    embedding: Array.from({ length: 1536 }, () => Math.random() * 2 - 1),
  }));

  await Product.insertMany(products, { ordered: false });
  console.log(`✅ Seeded ${SEED_COUNT} products`);

  // Seed Admin User
  await User.deleteMany({ email: 'admin@example.com' });
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  
  await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin'
  });
  console.log(`✅ Seeded Admin User (admin@example.com / admin123)`);

  process.exit(0);
}

seed().catch(console.error);
