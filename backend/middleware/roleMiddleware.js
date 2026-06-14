// NEW: middleware/roleMiddleware.js
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          message: "Unauthorized",
          msg: "Unauthorized",
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          message: "Akses ditolak",
          msg: "Akses ditolak",
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        message: "Role middleware error",
        msg: "Role middleware error",
        error: err.message,
      });
    }
  };
};