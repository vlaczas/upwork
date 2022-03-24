const jwt = require('jsonwebtoken');

/**
 * @description return a middleware to protect users from changing account without their unbeknowst
 * @param {string|null} [config] - may be professional, employer or admin
 * @param {boolean} [isStrict=true] - if user doesn't have token = error 401
 */
const protect = (config, isStrict = true) => (req, res, next) => {
  try {
    const auth = req.get('Authorization');
    const token = auth.split(' ')[1];
    req.user = jwt.verify(token, process.env.TOKEN_SECRET);
    next();
  } catch (error) {
    if (isStrict) {
      return res.status(401).json({ success: false, result: { message: 'Session Expired, please sign in!' } });
    }
    return next();
  }
};

module.exports = protect;
