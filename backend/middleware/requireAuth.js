/**
 * Authentication Middleware
 * Validates session exists before granting access to protected routes
 */
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please sign in to continue.'
  });
};

module.exports = requireAuth;
