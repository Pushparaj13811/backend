export default (_req, _res, next) =>
    next({ status: 404, message: 'Route not found' });

export const notFound = (req, res, next) => {
    next(createError.NotFound('Not found - ' + req.originalUrl));
};
