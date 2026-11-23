/**
 * Administrator Role Guard Middleware
 * Strictly validates user role is 'admin'
 */
const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in as an administrator.'
    });
  }

  if (req.session.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required.'
    });
  }

  req.user = req.session.user;
  return next();
};

module.exports = requireAdmin;
