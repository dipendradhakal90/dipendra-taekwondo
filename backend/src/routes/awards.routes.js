const router = require("express").Router();
const c = require("../controllers/awards.controller");
const { requireAdmin } = require("../middleware/auth.middleware");
const Award = require("../models/Award");

// public
router.get("/", c.listPublished);

// admin
router.get("/admin/all", requireAdmin, c.listAllAdmin);
router.post("/", requireAdmin, c.create);
router.put("/:id", requireAdmin, c.update);
router.delete("/:id", requireAdmin, c.remove);

// ⭐ Toggle featured
router.patch("/:id/featured", requireAdmin, c.toggleFeatured);

module.exports = router;
