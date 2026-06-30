import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../app';
import { connectDB } from '../config/db';
import redis from '../config/redis';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
  await connectDB();
  await redis.flushall();
}, 30000);

afterAll(async () => {
  await mongoose.connection.close();
  await redis.quit();
}, 30000);

describe('Product Cache Integration Tests', () => {
  it('should return source: database on first request and cache on second', async () => {
    const res1 = await request(app).get('/api/products?page=1&limit=5');
    expect(res1.status).toBe(200);
    expect(res1.body.source).toBe('database');
    expect(Array.isArray(res1.body.data)).toBeTruthy();
    
    const res2 = await request(app).get('/api/products?page=1&limit=5');
    expect(res2.status).toBe(200);
    expect(res2.body.source).toBe('cache');
    expect(Array.isArray(res2.body.data)).toBeTruthy();
  });
});
