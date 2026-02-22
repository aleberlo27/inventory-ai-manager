import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../src/middleware/auth.middleware';
import * as authService from '../src/services/auth.service';

jest.mock('../src/services/auth.service');
jest.mock('../src/lib/prisma', () => ({
  prisma: { user: { findUnique: jest.fn() } },
}));

const mockValidateToken = jest.mocked(authService.validateToken);

const mockUser = {
  id: 'uuid-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  createdAt: new Date(),
};

describe('authMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if Authorization header is missing', async () => {
    await authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect((res.json as jest.Mock).mock.calls[0][0]).toMatchObject({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is malformed', async () => {
    req.headers = { authorization: 'Bearer invalid.token' };
    mockValidateToken.mockRejectedValue(new Error('Invalid token'));

    await authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() and set req.user if token is valid', async () => {
    req.headers = { authorization: 'Bearer valid.token.here' };
    mockValidateToken.mockResolvedValue(mockUser);

    await authMiddleware(req as Request, res as Response, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
