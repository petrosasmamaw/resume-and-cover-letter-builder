import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import generateRoutes from './routes/generate.js';
import generationsRoutes from './routes/generations.js';
import { isPlaceholderDb } from './db/pool.js';
import { isPlaceholderGeminiKey } from './services/gemini.js';
import { isPlaceholderJwt } from './middleware/auth.js';
import { isHumanizerReady } from './services/humanizer/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// CORS setup supporting custom frontend domains in production
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during production testing
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    gemini_ready: !isPlaceholderGeminiKey(),
    db_ready: !isPlaceholderDb,
    jwt_ready: !isPlaceholderJwt(),
    humanizer_ready: isHumanizerReady(),
    nlp_ready: true,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/generations', generationsRoutes);

// Static frontend serving if built bundle exists
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Log unexpected errors without exiting — prevents easy crashes from one bad request
process.on('uncaughtException', (err) => {
  console.error('uncaughtException:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection:', err);
});

function startServer(attempt = 1) {
  const server = app.listen(PORT, () => {
    console.log(`ResumeForge API listening on http://localhost:${PORT}`);

    if (isPlaceholderGeminiKey()) {
      console.warn(
        '⚠️  Using placeholder GEMINI_API_KEY — replace it in .env before generating real content'
      );
    }
    if (isPlaceholderDb) {
      console.warn(
        '⚠️  Using placeholder DATABASE_URL — replace it in .env with your Neon connection string'
      );
    }
    if (isPlaceholderJwt()) {
      console.warn(
        '⚠️  Using placeholder JWT_SECRET — replace it in .env before auth will work'
      );
    }
  });

  server.keepAliveTimeout = 65_000;

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < 8) {
      console.warn(
        `Port ${PORT} still busy (attempt ${attempt}/7) — waiting for it to free…`
      );
      setTimeout(() => startServer(attempt + 1), 1200);
      return;
    }
    console.error(err);
    process.exit(1);
  });
}

startServer();
