import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Product } from '../models/Product.model';
import { Discount } from '../models/Discount.model';

export const calculateCartTotal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, discountCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Cart items are required' });
      return;
    }

    // Convert keys to ObjectIds and build mapping of productId to quantity
    const productObjectIds = items.map(item => new Types.ObjectId(item.productId as string));
    const itemsArray = items.map(item => ({
      productId: new Types.ObjectId(item.productId as string),
      qty: item.qty
    }));

    const pipeline = [
      {
        $match: {
          _id: { $in: productObjectIds },
          isActive: true,
        },
      },
      {
        $addFields: {
          requestedQty: {
            $arrayElemAt: [
              {
                $filter: {
                  input: itemsArray,
                  as: 'item',
                  cond: { $eq: ['$$item.productId', '$_id'] }
                }
              },
              0
            ]
          }
        }
      },
      {
        $project: {
          name: 1,
          price: 1,
          stock: 1,
          qty: '$requestedQty.qty',
          lineTotal: { $multiply: ['$price', '$requestedQty.qty'] },
        }
      },
      {
        $group: {
          _id: null,
          subtotal: { $sum: '$lineTotal' },
          items: { $push: '$$ROOT' },
        }
      },
    ];

    const aggregationResult = await Product.aggregate(pipeline);

    if (aggregationResult.length === 0) {
      res.status(400).json({ message: 'No valid active products found in the cart' });
      return;
    }

    const { subtotal, items: resolvedItems } = aggregationResult[0];

    // Check for stock issues
    const stockErrors = (resolvedItems as Array<{ stock: number; qty: number; name: string }>)
      .filter((item) => item.stock < item.qty)
      .map((item) => `Product ${item.name} only has ${item.stock} items in stock`);

    if (stockErrors.length > 0) {
      res.status(400).json({ message: 'Insufficient stock', errors: stockErrors });
      return;
    }

    let discountAmount = 0;
    let appliedDiscount = null;

    if (discountCode) {
      const discount = await Discount.findOne({
        code: discountCode.toUpperCase(),
        isActive: true,
        expiresAt: { $gt: new Date() }
      });

      if (!discount) {
        res.status(400).json({ message: 'Invalid or expired discount code' });
        return;
      }

      if (subtotal < discount.minOrderValue) {
        res.status(400).json({
          message: `Minimum order value for code ${discount.code} is ${discount.minOrderValue}`
        });
        return;
      }

      if (discount.type === 'percentage') {
        discountAmount = (subtotal * discount.value) / 100;
      } else if (discount.type === 'flat') {
        discountAmount = discount.value;
      }

      // Ensure discount doesn't exceed subtotal
      discountAmount = Math.min(discountAmount, subtotal);
      appliedDiscount = discount;
    }

    const total = subtotal - discountAmount;

    res.json({
      subtotal,
      discount: discountAmount,
      total,
      discountCode: appliedDiscount?.code || null,
      items: resolvedItems
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
};
