// In-memory rate limiting middleware for sensitive endpoints (Auth, Login, Register)

const rateLimitMap = new Map();

/**
 * Creates an in-memory rate limiter middleware.
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default 5 min)
 * @param {number} options.max - Max requests per IP in the window (default 15)
 * @param {string} options.message - Error message when rate limit exceeded
 */
export const createRateLimiter = ({
  windowMs = 5 * 60 * 1000,
  max = 15,
  message = 'Too many requests. Please try again after a few minutes.'
} = {}) => {
  // Periodic cleanup of expired entries
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now - value.startTime > windowMs) {
        rateLimitMap.delete(key);
      }
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = rateLimitMap.get(ip);

    if (!record) {
      rateLimitMap.set(ip, { count: 1, startTime: now });
      return next();
    }

    if (now - record.startTime > windowMs) {
      rateLimitMap.set(ip, { count: 1, startTime: now });
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      res.setHeader('Retry-After', Math.ceil((windowMs - (now - record.startTime)) / 1000));
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: Math.ceil((windowMs - (now - record.startTime)) / 1000)
      });
    }

    next();
  };
};

export const authRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 15,
  message: 'Too many authentication attempts. Please wait 5 minutes before trying again.'
});
