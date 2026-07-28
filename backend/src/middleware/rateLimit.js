import rateLimit from 'express-rate-limit';

export const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Rate limit exceeded. Maximum 20 generate calls per hour.',
  },
});
