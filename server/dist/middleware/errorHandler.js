/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, _next) => {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    // Don't leak error details in production
    const isDev = process.env.NODE_ENV === 'development';
    res.status(500).json({
        success: false,
        error: isDev ? err.message : 'Internal server error',
        ...(isDev && { stack: err.stack }),
    });
};
/**
 * Not found handler
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
    });
};
/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
//# sourceMappingURL=errorHandler.js.map