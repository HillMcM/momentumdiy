/**
 * Authentication Middleware
 * 
 * Provides reusable authentication and authorization middleware for routes
 */

import type { Request, Response, NextFunction } from 'express';
import { supabasePublic } from '../config/supabase';
import { isAdmin } from '../config/admin';
import { logger } from '../utils/logger';

/**
 * Extract and verify JWT token from Authorization header
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication required - No valid token provided'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabasePublic.auth.getUser(token);

    if (error || !user) {
      logger.warn('Invalid authentication token', { error: error?.message });
      res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication token'
      });
      return;
    }

    // Attach user to request for downstream handlers
    (req as any).user = user;
    (req as any).token = token;
    
    next();
  } catch (error) {
    logger.error('Authentication error', error);
    res.status(500).json({
      success: false,
      error: 'Authentication service error'
    });
  }
}

/**
 * Require admin privileges
 * Must be used after authenticate() middleware
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!isAdmin(user.email)) {
      logger.warn('Unauthorized admin access attempt', { 
        userId: user.id,
        email: user.email 
      });
      res.status(403).json({
        success: false,
        error: 'Admin privileges required'
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Admin authorization error', error);
    res.status(500).json({
      success: false,
      error: 'Authorization service error'
    });
  }
}

/**
 * Optional authentication - attach user if token is present but don't fail if not
 */
export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabasePublic.auth.getUser(token);
      
      if (user) {
        (req as any).user = user;
        (req as any).token = token;
      }
    }
    
    next();
  } catch (_error) {
    // Continue without authentication
    next();
  }
}

