import { Request, Response } from 'express';
import { Product, IProduct } from '../models/Product.model';
import { getCached, setCache, invalidateCache } from '../services/cache.service';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    // Include page and limit to prevent cache collisions
    const cacheKey = `products:all:page:${page}:limit:${limit}`;
    const cached = await getCached<IProduct[]>(cacheKey);
    
    if (cached) {
      res.json({ source: 'cache', data: cached });
      return;
    }

    const products = await Product.find({ isActive: true })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    await setCache(cacheKey, products, 300);

    res.json({ source: 'database', data: products });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const cacheKey = `products:${id}`;

    const cached = await getCached<IProduct>(cacheKey);
    if (cached) {
      res.json({ source: 'cache', data: cached });
      return;
    }

    const product = await Product.findById(id).lean();
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    await setCache(cacheKey, product, 300);
    res.json({ source: 'database', data: product });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.create(req.body);
    
    // Invalidate all paginated product caches
    await invalidateCache('products:all*');
    
    res.status(201).json({ source: 'database', data: product });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Invalidate individual product cache and all paginated caches
    await invalidateCache(`products:${id}`, 'products:all*');

    res.json({ source: 'database', data: product });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Invalidate individual product cache and all paginated caches
    await invalidateCache(`products:${id}`, 'products:all*');

    res.json({ source: 'database', message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
