import express from 'express';
import emailRoutes from './routes/email.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { logger } from './utils/logger.js';

const app = express();

app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.use('/api/v1/email', emailRoutes);

// Centralized error handler (must be last)
app.use(errorMiddleware);

export default app;
