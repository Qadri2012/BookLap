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

// NEW: route khusus mitra
router.post("/register-mitra", ctrl.registerMitra);
router.post("/login-mitra", ctrl.loginMitra);

// NEW: route khusus admin
router.post("/register-admin", ctrl.registerAdmin);
router.post("/check-admin-identity", ctrl.checkAdminIdentity);

// NEW: verifikasi OTP email admin
router.post("/verify-admin-otp", ctrl.verifyAdminOtp);
router.post("/request-admin-login-otp", ctrl.requestAdminLoginOtp);
router.post("/verify-admin-login-otp", ctrl.verifyAdminLoginOtp);
module.exports = router;