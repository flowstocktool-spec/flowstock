
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import type { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateUser(username: string, password: string): Promise<string | null> {
  const user = await storage.getUserByUsername(username);
  if (!user) return null;
  
  const isValid = await comparePassword(password, user.password);
  return isValid ? user.id : null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.headers['x-user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  req.userId = userId;
  next();
}
