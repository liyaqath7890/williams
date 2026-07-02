import { User } from '../models/User.js';
import { verifyAccessToken } from '../helpers/token.js';

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      const error = new Error('Authentication token is required');
      error.statusCode = 401;
      throw error;
    }

    const decoded = verifyAccessToken(token);
    req.user = await User.findByPk(decoded.sub, {
      attributes: { exclude: ['passwordHash'] }
    });
    if (!req.user) {
      const error = new Error('User not found');
      error.statusCode = 401;
      throw error;
    }

    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
}

export function allowRoles(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) {
      const error = new Error('Insufficient permissions');
      error.statusCode = 403;
      return next(error);
    }

    return next();
  };
}
