// routes/v1/auth.js
const router = require("express").Router();
const ctrl = require("../../controllers/authController");
//middleware JWT
const auth = require("../../middleware/authmiddleware");
// AUTH BASIC
router.post("/register", ctrl.register);
// “Route menerima request dan meneruskan ke controller”
router.post("/login", ctrl.login);
router.post("/refresh", ctrl.refreshToken);
router.post("/logout", ctrl.logout);
router.get("/verify", auth, ctrl.verifyAuth);
// OTP
router.post("/send-otp", ctrl.sendOtp);
router.post("/verify-otp", ctrl.verifyOtp);

// ✅ NEW: CAPTCHA
router.get("/captcha", ctrl.getCaptcha);

module.exports = router;