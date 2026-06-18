import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { User } from '../models/User.model';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ source: 'database', data: user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ message: 'Server error', error: 'JWT_SECRET not configured' });
      return;
    }

    const secret: Secret = process.env.JWT_SECRET;
    const signOptions: SignOptions = { expiresIn: 604800 }; // 7 days in seconds
    const token = jwt.sign({ id: user._id, role: user.role }, secret, signOptions);

    res.json({ source: 'database', data: { user, token } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
};
