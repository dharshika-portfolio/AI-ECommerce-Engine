import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import { Product } from '../models/Product.model';
import { User } from '../models/User.model';
import { generateEmbedding } from '../services/vector.service';
import bcrypt from 'bcrypt';

dotenv.config();

const SEED_COUNT = 500; // Smaller count with realistic data is much more useful than 5000 random ones
const BATCH_SIZE = 50;

// Realistic product templates per category
const PRODUCT_TEMPLATES: Record<string, { names: string[]; descriptions: string[] }> = {
  Apparel: {
    names: [
      'Winter Puffer Jacket', 'Fleece Hoodie', 'Slim Fit Chinos', 'Formal Dress Shirt',
      'Wool Overcoat', 'Denim Jacket', 'Thermal Base Layer', 'Sports T-Shirt',
      'Linen Summer Shirt', 'Leather Biker Jacket', 'Cargo Shorts', 'Knit Sweater',
      'Rain Jacket', 'Polo Shirt', 'V-Neck Pullover', 'Track Pants', 'Windbreaker',
      'Graphic Tee', 'Bomber Jacket', 'Corduroy Trousers',
    ],
    descriptions: [
      'Stay warm and stylish with this premium winter jacket featuring water-resistant shell.',
      'Cozy fleece hoodie perfect for casual wear and outdoor activities.',
      'Versatile slim fit chinos suitable for both office and casual outings.',
      'Classic formal shirt crafted from breathable 100% cotton fabric.',
      'Elegant wool overcoat for a sophisticated look in cold weather.',
    ],
  },
  Footwear: {
    names: [
      'Running Shoes', 'Leather Oxford Shoes', 'Trail Hiking Boots', 'Canvas Sneakers',
      'Slip-On Loafers', 'Basketball Shoes', 'Ankle Boots', 'Flip Flops',
      'Formal Derby Shoes', 'Waterproof Trekking Boots', 'Sports Sandals', 'Gym Trainers',
      'Chelsea Boots', 'Platform Sneakers', 'Moccasins', 'Steel-Toe Work Boots',
      'Dance Shoes', 'Cycling Shoes', 'Boat Shoes', 'Suede Brogues',
    ],
    descriptions: [
      'Lightweight running shoes with responsive cushioning for long-distance comfort.',
      'Handcrafted leather oxfords with premium finish, ideal for formal occasions.',
      'Rugged trail boots with ankle support and slip-resistant outsoles.',
      'Classic canvas sneakers with rubber sole, great for everyday casual wear.',
      'Easy slip-on loafers in soft leather, perfect for work and weekend.',
    ],
  },
  Electronics: {
    names: [
      'Wireless Bluetooth Earbuds', 'Noise Cancelling Headphones', 'Smart Watch',
      'Portable Power Bank', 'USB-C Fast Charger', 'Mechanical Keyboard',
      'Gaming Mouse', 'Webcam HD 1080p', 'Portable Speaker', 'LED Desk Lamp',
      'Phone Stand', 'Wireless Charging Pad', 'Screen Protector', 'Laptop Sleeve',
      'Cable Management Kit', 'Smart Home Hub', 'Digital Camera', 'E-Reader',
      'Action Camera', 'Tablet Stand',
    ],
    descriptions: [
      'True wireless earbuds with active noise cancellation and 24-hour battery life.',
      'Premium over-ear headphones with studio-quality sound and 30-hour playtime.',
      'Smart watch with health tracking, GPS, and 7-day battery life.',
      'High-capacity power bank with fast charging for all your devices.',
      '65W USB-C charger compatible with laptops, phones, and tablets.',
    ],
  },
  Home: {
    names: [
      'Bamboo Cutting Board', 'Stainless Steel Cookware Set', 'Cotton Bed Sheets',
      'Memory Foam Pillow', 'Scented Candle Set', 'Storage Organiser Box',
      'Ceramic Coffee Mug', 'Wooden Wall Clock', 'Indoor Plant Pot', 'Door Mat',
      'Kitchen Knife Set', 'Vacuum Flask', 'Laundry Basket', 'Bathroom Towel Set',
      'Reading Lamp', 'Throw Blanket', 'Spice Rack', 'Fruit Bowl', 'Mirror',
      'Curtain Panels',
    ],
    descriptions: [
      'Eco-friendly bamboo cutting board with juice grooves and built-in handle.',
      'Premium stainless steel cookware set including pots, pans and lids.',
      'Ultra-soft 100% cotton bed sheets with 400 thread count for luxury comfort.',
      'Ergonomic memory foam pillow designed for neck and shoulder support.',
      'Set of 3 hand-poured scented candles with soy wax and cotton wicks.',
    ],
  },
  Sports: {
    names: [
      'Yoga Mat', 'Resistance Band Set', 'Dumbbell Set', 'Jump Rope',
      'Water Bottle 1L', 'Gym Bag', 'Foam Roller', 'Knee Support Brace',
      'Cycling Helmet', 'Swimming Goggles', 'Tennis Racket', 'Football',
      'Badminton Set', 'Pull-Up Bar', 'Skipping Rope', 'Exercise Gloves',
      'Ankle Weights', 'Protein Shaker', 'Sports Headband', 'Compression Socks',
    ],
    descriptions: [
      'Non-slip yoga mat with alignment lines, suitable for all yoga styles.',
      'Set of 5 resistance bands for strength training and physiotherapy exercises.',
      'Adjustable dumbbell set ranging from 2kg to 20kg for home gym workouts.',
      'Speed jump rope with ball-bearing handles for smooth, fast rotation.',
      'BPA-free insulated water bottle that keeps drinks cold for 24 hours.',
    ],
  },
};

async function seed() {
  await connectDB();
  await Product.deleteMany({});

  const categories = Object.keys(PRODUCT_TEMPLATES) as Array<keyof typeof PRODUCT_TEMPLATES>;
  let totalInserted = 0;

  for (let batch = 0; batch < SEED_COUNT / BATCH_SIZE; batch++) {
    const products = await Promise.all(
      Array.from({ length: BATCH_SIZE }, () => {
        const category = faker.helpers.arrayElement(categories);
        const template = PRODUCT_TEMPLATES[category];
        // Pick a realistic name and add a variant prefix so we have variety
        const baseName = faker.helpers.arrayElement(template.names);
        const prefix = faker.helpers.arrayElement(['', 'Premium ', 'Classic ', 'Pro ', 'Deluxe ', 'Lite ']);
        const name = prefix + baseName;
        const description = faker.helpers.arrayElement(template.descriptions);

        const text = `${name} ${description} ${category}`;
        return generateEmbedding(text).then(embedding => ({
          name,
          description,
          price: parseFloat(faker.commerce.price({ min: 199, max: 9999 })),
          category,
          stock: faker.number.int({ min: 1, max: 500 }),
          isActive: true,
          embedding,
        }));
      })
    );

    await Product.insertMany(products, { ordered: false });
    totalInserted += products.length;
    console.log(`  → Inserted batch ${batch + 1} (${totalInserted}/${SEED_COUNT})`);
  }

  console.log(`✅ Seeded ${totalInserted} realistic products`);

  // Seed Admin User
  await User.deleteMany({ email: 'admin@example.com' });
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  await User.create({ name: 'Admin User', email: 'admin@example.com', password: hashedPassword, role: 'admin' });
  console.log(`✅ Seeded Admin User (admin@example.com / admin123)`);

  process.exit(0);
}

seed().catch(console.error);

