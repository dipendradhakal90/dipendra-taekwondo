const router = require("express").Router();
const c = require("../controllers/media-coverage.controller");
const { requireAdmin } = require("../middleware/auth.middleware");

// public
router.get("/", c.listPublished);
router.get("/latest", c.getLatest);

// admin
router.get("/admin/all", requireAdmin, c.listAllAdmin);
router.post("/", requireAdmin, c.create);
router.put("/:id", requireAdmin, c.update);
router.delete("/:id", requireAdmin, c.deleteMedia);

module.exports = router;
