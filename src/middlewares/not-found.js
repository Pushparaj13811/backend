import createError from 'http-errors';

export const notFound = (req, res, next) => {
    next(createError.NotFound('Not found - ' + req.originalUrl));
};
