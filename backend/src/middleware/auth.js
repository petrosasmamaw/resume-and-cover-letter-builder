import jwt from 'jsonwebtoken';

const PLACEHOLDER_JWT = 'demo_jwt_secret_replace_me';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === PLACEHOLDER_JWT) {
    return null;
  }
  return secret;
}

export function isPlaceholderJwt() {
  return !getJwtSecret();
}

export function signToken(user) {
  const secret = getJwtSecret();
  if (!secret) {
    throw new Error('JWT_SECRET is missing. Add it to backend/.env');
  }
  return jwt.sign(
    { sub: user.id, email: user.email },
    secret,
    { expiresIn: '30d' }
  );
}

export function requireAuth(req, res, next) {
  const secret = getJwtSecret();
  if (!secret) {
    return res.status(500).json({
      error: 'JWT_SECRET is not configured on the server',
      code: 'JWT_NOT_CONFIGURED',
    });
  }

  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
  }

  try {
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' });
  }
}
