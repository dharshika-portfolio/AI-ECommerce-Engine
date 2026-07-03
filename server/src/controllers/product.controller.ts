import { Request, Response } from 'express';
import { Product, IProduct } from '../models/Product.model';
import { getCached, setCache, invalidateCache } from '../services/cache.service';
import { generateEmbedding } from '../services/vector.service';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const cacheKey = `products:all:page:${page}:limit:${limit}`;
    const cached = await getCached<any>(cacheKey);
    
    if (cached) {
      res.json(cached);
      return;
    }

    const totalCount = await Product.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalCount / limit);

    const rawProducts = await Product.find({ isActive: true })
      .select('-embedding')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Map _id to id since .lean() skips Mongoose toJSON transform
    const products = rawProducts.map(({ _id, __v, ...rest }) => ({ id: _id, ...rest }));

    const result = { source: 'database', data: products, totalPages, page };
    await setCache(cacheKey, result, 300);

    res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const cacheKey = `products:${id}`;

    const cached = await getCached<any>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const raw = await Product.findById(id).select('-embedding').lean();
    if (!raw) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const { _id, __v, ...rest } = raw;
    const product = { id: _id, ...rest };

    const result = { source: 'database', data: product };
    await setCache(cacheKey, result, 300);
    res.json(result);
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
    const cached = await getCached<any>(cacheKey);

    if (cached) {
      res.json(cached);
      return;
    }

    // Generate embedding vector from user query
    const embedding = await generateEmbedding(query);

    // Run $vectorSearch aggregation pipeline
    const rawResults = await Product.aggregate([
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

    // Map _id to id for frontend compatibility
    const results = rawResults.map(({ _id, ...rest }) => ({ id: _id, ...rest }));

    // Cache search results with 120s TTL
    const response = { source: 'database', data: results };
    await setCache(cacheKey, response, 120);

    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
};
