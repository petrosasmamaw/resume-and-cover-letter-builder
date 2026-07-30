import path from 'path';
import { fileURLToPath } from 'url';
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

app.use(cors());
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
      // Wait for previous --watch process to release the port.
      // Do NOT kill processes here — that races with the watcher and stops the server.
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
