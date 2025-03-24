// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the full error stack

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Default to 500 if no status code set
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Send stack trace in development only
  });
};

export default errorHandler;