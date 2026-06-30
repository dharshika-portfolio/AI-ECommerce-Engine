import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { Product } from '../models/Product.model';
import { Order } from '../models/Order.model';
import { Discount } from '../models/Discount.model';
import { invalidateCache } from '../services/cache.service';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, discountCode } = req.body;
    const userId = req.user?.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Order items are required' });
      await session.abortTransaction();
      session.endSession();
      return;
    }

    let subtotal = 0;
    const orderItems = [];
    const cacheKeysToInvalidate: string[] = ['products:all*'];

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        res.status(404).json({ message: `Product with ID ${item.productId} not found` });
        await session.abortTransaction();
        session.endSession();
        return;
      }

      if (!product.isActive) {
        res.status(400).json({ message: `Product ${product.name} is no longer active` });
        await session.abortTransaction();
        session.endSession();
        return;
      }

      if (product.stock < item.qty) {
        res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
        await session.abortTransaction();
        session.endSession();
        return;
      }

      // Atomically decrement stock
      product.stock -= item.qty;
      await product.save({ session });

      subtotal += product.price * item.qty;

      orderItems.push({
        product: product._id,
        quantity: item.qty,
        priceAtPurchase: product.price
      });

      cacheKeysToInvalidate.push(`products:${product._id}`);
    }

    let discountAmount = 0;
    let appliedDiscount = null;

    if (discountCode) {
      const discount = await Discount.findOne({
        code: discountCode.toUpperCase(),
        isActive: true,
        expiresAt: { $gt: new Date() }
      }).session(session);

      if (!discount) {
        res.status(400).json({ message: 'Invalid or expired discount code' });
        await session.abortTransaction();
        session.endSession();
        return;
      }

      if (subtotal < discount.minOrderValue) {
        res.status(400).json({
          message: `Minimum order value for code ${discount.code} is ${discount.minOrderValue}`
        });
        await session.abortTransaction();
        session.endSession();
        return;
      }

      if (discount.type === 'percentage') {
        discountAmount = (subtotal * discount.value) / 100;
      } else if (discount.type === 'flat') {
        discountAmount = discount.value;
      }

      discountAmount = Math.min(discountAmount, subtotal);
      appliedDiscount = discount;
    }

    const total = subtotal - discountAmount;

    const order = await Order.create([{
      user: userId,
      items: orderItems,
      discountCode: appliedDiscount?.code || null,
      subtotal,
      discount: discountAmount,
      total,
      status: 'pending'
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // Invalidate related product caches
    await invalidateCache(...cacheKeysToInvalidate);

    res.status(201).json({ source: 'database', data: order[0] });
  } catch (error: unknown) {
    await session.abortTransaction();
    session.endSession();
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
};
