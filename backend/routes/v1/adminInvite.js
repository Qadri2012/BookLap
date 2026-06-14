// NEW: routes/v1/adminInvite.js
const router = require("express").Router();

const auth = require("../../middleware/authmiddleware");
const superAdminOnly = require("../../middleware/superAdminMiddleware");
const adminInviteCtrl = require("../../controllers/adminInviteController");

// cek kode undangan (public)
router.post("/verify", adminInviteCtrl.verifyInviteCode);

// hanya superadmin
router.post("/", auth, superAdminOnly, adminInviteCtrl.createInvite);
router.get("/", auth, superAdminOnly, adminInviteCtrl.listInvites);
router.patch("/:id/revoke", auth, superAdminOnly, adminInviteCtrl.revokeInvite);
router.delete("/:id", auth, superAdminOnly, adminInviteCtrl.deleteInvite);

module.exports = router;