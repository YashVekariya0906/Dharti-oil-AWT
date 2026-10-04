/**
 * errorHandler middleware
 * Centralized error handling for all routes.
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
