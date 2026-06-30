import { Schema, model, Document } from 'mongoose';

export interface IDiscount {
  code: string;            // e.g. "WINTER20"
  type: 'percentage' | 'flat';
  value: number;           // 20 = 20% or ₹20 flat off
  minOrderValue: number;
  isActive: boolean;
  expiresAt: Date;
}

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
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

DiscountSchema.index({ code: 1, isActive: 1 });

export const Discount = model<IDiscountDocument>('Discount', DiscountSchema);
