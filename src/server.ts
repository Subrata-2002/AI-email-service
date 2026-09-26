import './config/env.js'; // must be first to load env vars
import { env } from './config/env.js';
import app from './app.js';
import { logger } from './utils/logger.js';

app.listen(env.port, () => {
  logger.info(`Server running on port ${env.port}`);
});
