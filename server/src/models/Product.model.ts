import mongoose from 'mongoose';

export interface IProduct extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  isActive: boolean;
  embedding: number[];
}

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  isActive: { type: Boolean, default: true },
  embedding: { type: [Number], required: true }
}, { timestamps: true });

productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
