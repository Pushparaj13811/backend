import express from 'express';
import cors          from 'cors';
import cookieParser  from 'cookie-parser';
import morgan        from 'morgan';

import routes         from '../routes/index.js';
import notFound       from '../middlewares/not-found.js';

export const createApp = () => {
  const app = express();

  /* --- global middleware --------------------------------- */
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
  app.use(express.json({ limit: '20kb' }));
  app.use(express.urlencoded({ extended: true, limit: '20kb' }));
  app.use(cookieParser());
  if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
  app.use(express.static('public'));

  /* --- routes -------------------------------------------- */
  app.use('/api/v1', routes);

  /* --- error pipeline ------------------------------------ */
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
