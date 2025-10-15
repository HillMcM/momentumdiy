import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../../src/middleware/auth';

// Mock dependencies
jest.mock('../../src/config/supabase', () => ({
  supabasePublic: {
    auth: {
      getUser: jest.fn()
    }
  }
}));

jest.mock('../../src/config/admin', () => ({
  isAdmin: jest.fn()
}));

jest.mock('../../src/utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn()
  }
}));

import { supabasePublic } from '../../src/config/supabase';
import { isAdmin } from '../../src/config/admin';

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should fail when no authorization header is provided', async () => {
      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required - No valid token provided'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail when authorization header does not start with Bearer', async () => {
      mockRequest.headers = { authorization: 'InvalidToken' };

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail when token is invalid', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      (supabasePublic.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired authentication token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should succeed with valid token and attach user to request', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequest.headers = { authorization: 'Bearer valid-token' };
      (supabasePublic.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect((mockRequest as any).user).toEqual(mockUser);
      expect((mockRequest as any).token).toBe('valid-token');
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    beforeEach(() => {
      (mockRequest as any).user = {
        id: 'user-123',
        email: 'test@example.com'
      };
    });

    it('should fail when no user is attached to request', async () => {
      delete (mockRequest as any).user;

      await requireAdmin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail when user is not an admin', async () => {
      (isAdmin as jest.Mock).mockReturnValue(false);

      await requireAdmin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Admin privileges required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should succeed when user is an admin', async () => {
      (isAdmin as jest.Mock).mockReturnValue(true);

      await requireAdmin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});



