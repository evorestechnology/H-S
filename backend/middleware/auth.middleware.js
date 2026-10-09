import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export const protectRoute = async (req, res, next) => {
  try {
    let token;

    // 1. Prioritize Bearer token from headers (Frontend uses this)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // 2. Fall back to cookie if no header is provided
    if (!token && req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No authentication token provided',
        code: 'NO_TOKEN'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid or malformed token',
        code: 'TOKEN_INVALID'
      });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid token payload',
        code: 'TOKEN_INVALID'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        companyName: true,
        status: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Account not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.status === 'Blocked') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Please contact administrator.',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    // Attach full authenticated user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in protectRoute middleware: ', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal authentication server error',
      code: 'AUTH_SERVER_ERROR'
    });
  }
};
