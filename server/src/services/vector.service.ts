import OpenAI from 'openai';
import crypto from 'crypto';

let openai: OpenAI | null = null;

const getOpenAI = () => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not defined in the environment variables');
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

/**
 * Generate a deterministic pseudo-embedding from text for development.
 * Uses a sliding-window SHA-256 hash to produce a stable 1536-d vector
 * where similar text produces similar vectors via shared n-gram substrings.
 * This gives meaningful (though not production-quality) semantic search
 * results without an OpenAI API key.
 */
function devEmbedding(text: string): number[] {
  const normalized = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const dim = 1536;
  const vec = new Float64Array(dim);

  // Decompose into character trigrams and hash each into the vector
  const grams = new Set<string>();
  for (let i = 0; i <= normalized.length - 3; i++) {
    grams.add(normalized.slice(i, i + 3));
  }
  // Also add individual words
  for (const word of normalized.split(' ')) {
    if (word.length >= 2) grams.add(word);
  }

  for (const gram of grams) {
    const hash = crypto.createHash('sha256').update(gram).digest();
    for (let i = 0; i < dim; i++) {
      // Each byte of hash contributes a signed value to a dimension
      vec[i] += (hash[i % 32] / 128.0) - 1.0;
    }
  }

  // L2-normalize so cosine similarity works correctly
  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  return Array.from(vec).map(v => v / norm);
}

/**
 * Generate a 1536-dimension embedding vector for a given text string.
 * Uses OpenAI text-embedding-3-small in production and a deterministic
 * hash-based vector in development to give meaningful search results
 * without API costs during testing.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (process.env.NODE_ENV === 'development') {
    return devEmbedding(text);
  }

  const response = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}
