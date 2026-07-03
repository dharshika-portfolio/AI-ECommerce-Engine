import { Request, Response } from 'express';
import { Product, IProduct } from '../models/Product.model';
import { getCached, setCache, invalidateCache } from '../services/cache.service';
import { generateEmbedding } from '../services/vector.service';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const cacheKey = `products:all:page:${page}:limit:${limit}`;
    const cached = await getCached<IProduct[]>(cacheKey);
    
    if (cached) {
      res.json({ source: 'cache', data: cached });
      return;
    }

    const products = await Product.find({ isActive: true })
      .select('-embedding')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    await setCache(cacheKey, products, 300);

    res.json({ source: 'database', data: products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
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

    const product = await Product.findById(id).select('-embedding').lean();
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    await setCache(cacheKey, product, 300);
    res.json({ source: 'database', data: product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.create(req.body);
    
    await invalidateCache('products:all*');
    
    res.status(201).json({ source: 'database', data: product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
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

    await invalidateCache(`products:${id}`, 'products:all*');

    res.json({ source: 'database', data: product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
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

    await invalidateCache(`products:${id}`, 'products:all*');

    res.json({ source: 'database', message: 'Product deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
};

/**
 * Semantic search using MongoDB Atlas Vector Search.
 * Generates an embedding from the user query, runs $vectorSearch,
 * and returns the top 10 results ranked by cosine similarity.
 */
export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;

    if (!query) {
      res.status(400).json({ message: 'Query parameter "q" is required' });
      return;
    }

    // Build cache key from base64-encoded query
    const cacheKey = `search:${Buffer.from(query).toString('base64')}`;
    const cached = await getCached<IProduct[]>(cacheKey);

    if (cached) {
      res.json({ source: 'cache', data: cached });
      return;
    }

    // Generate embedding vector from user query
    const embedding = await generateEmbedding(query);

    // Run $vectorSearch aggregation pipeline
    const results = await Product.aggregate([
      {
        $vectorSearch: {
          index: 'product_vector_index',
          path: 'embedding',
          queryVector: embedding,
          numCandidates: 100,
          limit: 10,
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          category: 1,
          stock: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);

    // Cache search results with 120s TTL
    await setCache(cacheKey, results, 120);

    res.json({ source: 'database', data: results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
};
