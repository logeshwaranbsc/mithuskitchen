import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRouter from './routes';
import { errorHandler } from './middleware/error.middleware';
import { config } from './config/env';

const app = express();

const allowedOrigins = [
  'https://mithuskitchen-ac58.vercel.app',
  config.frontendUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server, Render health checks)
    if (!origin) return callback(null, true);

    // Allow configured origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview or production deployments for mithuskitchen
    if (/^https:\/\/mithuskitchen.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Security Middleware - Allow cross-origin resources
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Middleware must be registered BEFORE all API routes and auth middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'HOME KITCHEN API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes:
// Mount at /api/v1 (versioned standard), /api, and root / (unversioned for frontend clients calling /auth/...)
// This ensures routes like POST /auth/admin-login AND POST /api/v1/auth/admin-login are both served without duplicating route handlers.
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);
app.use('/', apiRouter);

// 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling
app.use(errorHandler);

export default app;
