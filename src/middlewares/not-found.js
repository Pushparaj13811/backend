export default (_req, _res, next) =>
    next({ status: 404, message: 'Route not found' });
