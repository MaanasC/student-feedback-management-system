/**
 * Production CORS Configuration
 * Restricts cross-origin requests to explicit production domains (CLIENT_URL),
 * explicitly permitted preview URLs, and local development origins in non-production.
 */

export const getAllowedOrigins = () => {
  const envRaw = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.ALLOWED_ORIGINS,
    process.env.PREVIEW_URLS,
  ]
    .filter(Boolean)
    .join(',');

  const configuredOrigins = envRaw
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const localDevOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:80',
    'http://127.0.0.1:80',
    'http://localhost',
  ];

  // In non-production environments (development, test), include standard local dev origins
  if (process.env.NODE_ENV !== 'production') {
    return Array.from(new Set([...configuredOrigins, ...localDevOrigins]));
  }

  // In production, strictly enforce configured origins
  return Array.from(new Set(configuredOrigins));
};

export const isOriginAllowed = (origin) => {
  // Allow requests with no Origin header (e.g. server-side health checks, container probes, curl, Postman).
  // Security note: Non-browser requests without origin cannot bypass endpoint authentication;
  // all protected routes still require valid JWT signature and expiration verification.
  if (!origin) return true;

  const normalizedOrigin = origin.trim().replace(/\/+$/, '');
  const allowedList = getAllowedOrigins();

  for (const allowed of allowedList) {
    // 1. Direct match with exact configured origin
    if (allowed === normalizedOrigin) {
      return true;
    }

    // 2. Explicitly configured wildcard pattern for preview deployments (e.g., https://my-app-*.vercel.app)
    // Only matches when an administrator explicitly defines a wildcard pattern for their specific project.
    if (allowed.includes('*')) {
      const escaped = allowed
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '[a-zA-Z0-9-]+');
      const regex = new RegExp(`^${escaped}$`);
      if (regex.test(normalizedOrigin)) {
        return true;
      }
    }
  }

  return false;
};

export const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Unauthorized origin rejected: ${origin}`);
      callback(new Error(`CORS error: Origin '${origin}' is not authorized.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400,
};

export default corsOptions;
