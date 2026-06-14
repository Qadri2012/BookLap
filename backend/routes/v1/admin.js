const router = require("express").Router();

const auth = require("../../middleware/authmiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const superAdminOnly = require("../../middleware/superAdminMiddleware");
const adminCtrl = require("../../controllers/adminDashboardController");
const adminUserCtrl = require("../../controllers/adminUserController");
const uploadProfile = require("../../middleware/uploadProfile");
const adminProfileCtrl = require("../../controllers/adminProfileController");

router.get("/dashboard", auth, roleMiddleware("admin"), adminCtrl.getDashboardSummary);
router.get("/lapangan", auth, roleMiddleware("admin"), adminCtrl.listLapangan);
router.get("/booking", auth, roleMiddleware("admin"), adminCtrl.listBooking);
router.get("/laporan", auth, roleMiddleware("admin"), adminCtrl.getLaporanSummary);

router.get("/users", auth, roleMiddleware("admin"), adminUserCtrl.listUsers);
router.get("/users/pending", auth, roleMiddleware("admin"), adminUserCtrl.listPendingAdmins);
router.patch("/users/:id/approve", auth, superAdminOnly, adminUserCtrl.approveAdmin);
router.patch("/users/:id/reject", auth, superAdminOnly, adminUserCtrl.rejectAdmin);

router.get(
  "/profile",
  auth,
  roleMiddleware("admin"),
  adminProfileCtrl.getProfile
);

router.post(
  "/profile/photo",
  auth,
  roleMiddleware("admin"),
  uploadProfile.single("photo"),
  adminProfileCtrl.uploadProfilePhoto
);

router.delete(
  "/profile/photo",
  auth,
  roleMiddleware("admin"),
  adminProfileCtrl.deleteProfilePhoto
);
module.exports = router;