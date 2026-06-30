import OpenAI from 'openai';

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
 * Generate a 1536-dimension embedding vector for a given text string.
 * Uses OpenAI text-embedding-3-small in production and a mock
 * random vector in development to avoid API costs during testing.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (process.env.NODE_ENV === 'development') {
    // Mock embedding for local dev (no OpenAI cost)
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  }

  const response = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}
