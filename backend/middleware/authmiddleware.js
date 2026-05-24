const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const cookieToken =
      req.cookies?.accessToken ||
      req.cookies?.token ||
      req.cookies?.authToken;

    const authHeader = req.headers.authorization;
    const headerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({
        message: "Token tidak ditemukan",
        msg: "Token tidak ditemukan",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id || !decoded?.role) {
      return res.status(401).json({
        message: "Token tidak valid",
        msg: "Token tidak valid",
      });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Token expired atau tidak valid",
      msg: "Token expired atau tidak valid",
      error: err.message,
    });
  }
};