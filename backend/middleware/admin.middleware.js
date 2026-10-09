export const adminRoute = (req, res, next) => {
  const roleUpper = (req.user?.role || '').toUpperCase();
  if (req.user && (roleUpper === 'ADMIN' || roleUpper === 'ADMINISTRATOR')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
      code: 'FORBIDDEN'
    });
  }
};

