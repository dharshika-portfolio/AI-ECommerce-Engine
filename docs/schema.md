# Schema Document — High-Performance E-Commerce Engine with AI Vector Search

**Project:** Infotact Internship — Project 2
**ODM:** Mongoose 8.x on MongoDB 7.x (Atlas)

---

## 1. Overview

| Collection | Model File | Purpose |
|------------|-----------|---------|
| `users` | `User.model.ts` | Authentication, roles |
| `products` | `Product.model.ts` | Catalog, embeddings, inventory |
| `orders` | `Order.model.ts` | Purchase records |
| `discounts` | `Discount.model.ts` | Discount code validation |

---

## 2. TypeScript Interfaces

```typescript
// server/src/types/index.d.ts

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;        // bcrypt hash — never returned in API responses
  role: 'customer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  isActive: boolean;       // soft delete flag
  embedding: number[];     // 1536-dim vector (OpenAI) or 768-dim (mock)
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  product: string;         // ref to Product._id
  quantity: number;
  priceAtPurchase: number; // snapshot price at time of order
}

export interface IOrder {
  _id: string;
  user: string;            // ref to User._id
  items: IOrderItem[];
  discountCode?: string;
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface IDiscount {
  _id: string;
  code: string;            // e.g. "WINTER20"
  type: 'percentage' | 'flat';
  value: number;           // 20 = 20% or ₹20 flat off
  minOrderValue: number;
  isActive: boolean;
  expiresAt: Date;
}
```

---

## 3. Mongoose Schemas

### 3.1 User Schema

```typescript
// server/src/models/User.model.ts
import { Schema, model, Document } from 'mongoose';
import { IUser } from '../types';

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,     // Never returned in queries by default
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;  // Extra safety — never expose password
        return ret;
      },
    },
  }
);

export const User = model<IUserDocument>('User', UserSchema);
```

---

### 3.2 Product Schema

```typescript
// server/src/models/Product.model.ts
import { Schema, model, Document } from 'mongoose';
import { IProduct } from '../types';

export interface IProductDocument extends IProduct, Document {}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price must be non-negative'],
    },
    category: {
      type: String,
      required: true,
      enum: ['Apparel', 'Footwear', 'Electronics', 'Home', 'Sports', 'Beauty', 'Other'],
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    embedding: {
      type: [Number],
      required: true,
      // 1536 dimensions for OpenAI text-embedding-3-small
      // 768 dimensions for mock/local embeddings
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.embedding; // Never expose raw vectors to client
        return ret;
      },
    },
  }
);

// Text index for fallback keyword search
ProductSchema.index({ name: 'text', description: 'text' });

// Compound index for category + price range queries
ProductSchema.index({ category: 1, price: 1 });

export const Product = model<IProductDocument>('Product', ProductSchema);
```

**MongoDB Atlas Vector Search Index (create via Atlas UI or CLI):**
```json
{
  "name": "product_vector_index",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 1536,
        "similarity": "cosine"
      }
    ]
  }
}
```

---

### 3.3 Order Schema

```typescript
// server/src/models/Order.model.ts
import { Schema, model, Document, Types } from 'mongoose';
import { IOrder } from '../types';

export interface IOrderDocument extends IOrder, Document {}

const OrderItemSchema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    priceAtPurchase: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(v: unknown[]) => v.length > 0, 'Order must have at least one item'],
    },
    discountCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total:    { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Order = model<IOrderDocument>('Order', OrderSchema);
```

---

### 3.4 Discount Schema

```typescript
// server/src/models/Discount.model.ts
import { Schema, model, Document } from 'mongoose';
import { IDiscount } from '../types';

export interface IDiscountDocument extends IDiscount, Document {}

const DiscountSchema = new Schema<IDiscountDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

DiscountSchema.index({ code: 1, isActive: 1 });

export const Discount = model<IDiscountDocument>('Discount', DiscountSchema);
```

---

## 4. Redis Key Schema

| Key Pattern | Type | TTL | Content |
|------------|------|-----|---------|
| `products:all` | String (JSON) | 300s | Serialized product array |
| `products:<mongoId>` | String (JSON) | 600s | Single serialized product |
| `search:<md5_query>` | String (JSON) | 120s | Vector search results array |

**Key naming rules:**
- All lowercase
- Colon (`:`) as namespace separator
- No spaces
- IDs use full MongoDB ObjectId string

---

## 5. Aggregation Pipeline — Cart Total

```typescript
// server/src/controllers/cart.controller.ts
const pipeline = [
  // Stage 1: Filter to only the requested products
  {
    $match: {
      _id: { $in: productObjectIds },
      isActive: true,
    },
  },
  // Stage 2: Add requested quantity from request body
  {
    $addFields: {
      requestedQty: {
        $arrayElemAt: [
          { $filter: {
            input: itemsArray,
            as: 'item',
            cond: { $eq: ['$$item.productId', '$_id'] }
          }},
          0
        ]
      }
    }
  },
  // Stage 3: Calculate line total
  {
    $project: {
      name: 1,
      price: 1,
      stock: 1,
      qty: '$requestedQty.qty',
      lineTotal: { $multiply: ['$price', '$requestedQty.qty'] },
    }
  },
  // Stage 4: Sum to subtotal
  {
    $group: {
      _id: null,
      subtotal: { $sum: '$lineTotal' },
      items: { $push: '$$ROOT' },
    }
  },
];
```

---

## 6. Seeder Data Shape

```typescript
// server/src/scripts/seed.ts — data shape per product
{
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  price: parseFloat(faker.commerce.price({ min: 199, max: 9999 })),
  category: faker.helpers.arrayElement([
    'Apparel', 'Footwear', 'Electronics', 'Home', 'Sports', 'Beauty'
  ]),
  stock: faker.number.int({ min: 0, max: 500 }),
  isActive: true,
  embedding: Array.from({ length: 1536 }, () => Math.random() * 2 - 1),
  // ^ Mock embedding: replace with real OpenAI call in production
}
```
