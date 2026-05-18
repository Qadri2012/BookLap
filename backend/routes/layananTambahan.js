const router = require("express").Router();
const ctrl = require("../controllers/layananTambahanController");

router.get("/", ctrl.getAllLayananTambahan);
router.get("/:id", ctrl.getLayananTambahanById);
router.post("/", ctrl.createLayananTambahan);
router.put("/:id", ctrl.updateLayananTambahan);
router.delete("/:id", ctrl.deleteLayananTambahan);

module.exports = router;