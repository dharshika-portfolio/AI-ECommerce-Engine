import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import { Product } from '../models/Product.model';
import { User } from '../models/User.model';
import { generateEmbedding } from '../services/vector.service';
import bcrypt from 'bcrypt';

dotenv.config();

const SEED_COUNT = 5000;
const BATCH_SIZE = 250; // Insert in batches to avoid memory pressure

async function seed() {
  await connectDB();
  await Product.deleteMany({});

  const categories = ['Apparel', 'Footwear', 'Electronics', 'Home', 'Sports'];
  let totalInserted = 0;

  // Generate and insert products in batches
  for (let batch = 0; batch < SEED_COUNT / BATCH_SIZE; batch++) {
    const products = await Promise.all(
      Array.from({ length: BATCH_SIZE }, () => {
        const name = faker.commerce.productName();
        const description = faker.commerce.productDescription();
        const category = faker.helpers.arrayElement(categories);
        // Generate embedding from the product's text so search is meaningful
        const text = `${name} ${description} ${category}`;
        return generateEmbedding(text).then((embedding) => ({
          name,
          description,
          price: parseFloat(faker.commerce.price({ min: 199, max: 9999 })),
          category,
          stock: faker.number.int({ min: 0, max: 500 }),
          isActive: true,
          embedding,
        }));
      })
    );

    await Product.insertMany(products, { ordered: false });
    totalInserted += products.length;
    console.log(`  → Inserted batch ${batch + 1} (${totalInserted}/${SEED_COUNT})`);
  }

  console.log(`✅ Seeded ${totalInserted} products with text-based embeddings`);

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

