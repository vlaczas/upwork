const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  console.log(err);
  /**
   * !MONGO duplicate KEY
   */
  if (err.code === 11000) {
    const [field] = Object.values(err.keyValue);
    error.message = `Already exists - ${field}`;
    error.statusCode = 400;
  }

  /**
   * !MONGO VALIDATION error
   */
  if (err.code === 121) {
    error.message = 'Validation error';
    error.statusCode = 400;
  }

  if (res.finished) {
    return
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, result: { message: error.message || err.message || 'Server Error' } });
};

module.exports = errorHandler;
