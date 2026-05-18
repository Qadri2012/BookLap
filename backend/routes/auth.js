// auth.js

const router = require("express").Router();
const ctrl = require("../controllers/authController");
router.get("/captcha", ctrl.getCaptcha);
router.post("/register", ctrl.register);
router.post("/send-otp", ctrl.sendOtp);
router.post("/verify-otp", ctrl.verifyOtp);
router.post("/login", ctrl.login);

module.exports = router;

