export function errorHandler(error, _req, res, _next) {
  console.error('--- Backend Error ---');
  console.error(error);
  console.error('----------------------');

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    errors: error.details || undefined,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
  });
}
