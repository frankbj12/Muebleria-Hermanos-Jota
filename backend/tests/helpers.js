import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

export const mockUserId = '507f1f77bcf86cd799439011';
export const mockAdminId = '507f1f77bcf86cd799439012';
export const mockProductId = '507f1f77bcf86cd799439021';
export const mockProductId2 = '507f1f77bcf86cd799439022';

export const generateTestToken = (payload = {}, expiresIn = '1h') => {
  const secret =
    process.env.JWT_SECRET || 'test-jwt-secret-key-32-chars-long!!';
  return jwt.sign(
    {
      id: payload.id || mockUserId,
      role: payload.role || 'user',
      ...payload,
    },
    secret,
    { expiresIn }
  );
};

export const createMockSession = () => ({
  withTransaction: jest.fn(async (cb) => cb()),
  endSession: jest.fn().mockResolvedValue(undefined),
});
