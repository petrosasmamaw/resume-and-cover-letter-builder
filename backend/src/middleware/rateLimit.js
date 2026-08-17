import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';

let redisClient = null;
let store = undefined;

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: true,
    });
    redisClient.connect().catch((err) => {
      console.warn('⚠️  Redis connection failed for rate-limiter, using memory fallback:', err.message);
    });
    store = new RedisStore({
      // @ts-expect-error - sendCommand is supported by ioredis
      sendCommand: (...args) => redisClient.call(...args),
    });
    console.log('✓ Rate limiting connected to Redis store');
  } catch (err) {
    console.warn('⚠️  Failed to initialize Redis store for rate limit, falling back to memory:', err.message);
  }
}

function createLimiter({ windowMs, max, message, prefix }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: store ? store : undefined,
    message: { error: message },
    ...(prefix ? { prefix } : {}),
  });
}

/** Brute-force protection for login and registration (10 attempts per 15 min) */
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
  prefix: 'rl:auth:',
});

/** Rate limiting for password reset requests (5 attempts per 15 min) */
export const passwordResetLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many password reset requests. Please try again in 15 minutes.',
  prefix: 'rl:pw_reset:',
});

/** AI Generation limiter (20 per hour) */
export const generateLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Rate limit exceeded. Maximum 20 generate calls per hour.',
  prefix: 'rl:gen:',
});

/** Humanizer limiter (30 per hour) */
export const humanizeLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: 'Rate limit exceeded. Maximum 30 humanize calls per hour.',
  prefix: 'rl:humanize:',
});

/** AI Detector limiter (60 per hour) */
export const detectLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 60,
  message: 'Rate limit exceeded. Maximum 60 detect calls per hour.',
  prefix: 'rl:detect:',
});

/** Career Coach Chat limiter (60 per hour) */
export const chatLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 60,
  message: 'Rate limit exceeded. Maximum 60 chat messages per hour.',
  prefix: 'rl:chat:',
});

