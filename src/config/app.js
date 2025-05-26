import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';

import routes from '../routes/index.js';
import { errorHandler } from '../middlewares/error-handler.js';
import { notFound } from '../middlewares/not-found.js';
import { cleanupRateLimiter } from '../utils/rate-limiter.js';
import { swaggerDocs, swaggerSetup } from '../middlewares/swagger.js';
import env from './env.js';

export const createApp = () => {
  const app = express();

  // Security Middleware
  app.use(helmet()); // Set security HTTP headers
  app.use(mongoSanitize()); // Sanitize data
  app.use(xss()); // Prevent XSS attacks
  app.use(hpp()); // Prevent parameter pollution

  // Rate limiting
  const limiter = rateLimit({
    max: 100, // Limit each IP to 100 requests per windowMs
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again in an hour!',
  });
  app.use('/api', limiter);

  // Body parser
  app.use(express.json({ limit: '20kb' }));
  app.use(express.urlencoded({ extended: true, limit: '20kb' }));
  app.use(cookieParser());

  // CORS
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  // Compression
  app.use(compression());

  // Logging
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Static files
  app.use(express.static('public'));

  // Swagger Documentation
  if (env.NODE_ENV !== 'production') {
    app.use('/api-docs', swaggerDocs, swaggerSetup);
  }

  // Routes
  app.use('/api/v1', routes);

  // Error handling
  app.use(notFound);
  app.use(errorHandler);

  // Handle cleanup on app shutdown
  const cleanup = async () => {
    try {
      await cleanupRateLimiter();
      console.log('Rate limiter resources cleaned up successfully');
    } catch (error) {
      console.error('Error cleaning up rate limiter resources:', error);
    }
  };

  // Handle process termination
  process.on('SIGTERM', cleanup);

  return app;
};
