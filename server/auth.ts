import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { storage } from './storage';
import type { Request, Response, NextFunction } from 'express';
import type { User } from '@shared/schema';

// Extend express session
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: User;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
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
  const userId = req.session?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  req.userId = userId;
  next();
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (req.userId) {
      const user = await storage.getUserById(req.userId);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    console.error('Error fetching current user:', error);
    next();
  }
}

export class AuthService {
  private readonly saltRounds = 12;

  generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return { success: false, error: 'Username already taken' };
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return { success: false, error: 'Email already registered' };
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Create user
      const user = await storage.createUser({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        senderEmail: data.email, // Default sender email to user's email
      });

      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // Find user by username or email
      const user = await storage.getUserByUsernameOrEmail(credentials.usernameOrEmail);
      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Verify password
      const isValid = await comparePassword(credentials.password, user.password);
      if (!isValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return { success: true };
      }

      const token = this.generatePasswordResetToken();
      const expires = new Date(Date.now() + 3600000); // 1 hour from now

      const success = await storage.setPasswordResetToken(user.id, token, expires);
      if (!success) {
        return { success: false, error: 'Failed to generate reset token' };
      }

      return { success: true, token };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: 'Password reset request failed' };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    try {
      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      const hashedPassword = await hashPassword(newPassword);
      const updatedUser = await storage.updateUser(user.id, { password: hashedPassword });
      
      if (!updatedUser) {
        return { success: false, error: 'Failed to update password' };
      }

      // Clear the reset token
      await storage.clearPasswordResetToken(user.id);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Password reset failed' };
    }
  }
}

export const authService = new AuthService();