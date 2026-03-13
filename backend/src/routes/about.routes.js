const router = require("express").Router();

const {
  getAboutPublic,
  getAboutAdmin,
  upsertAboutAdmin,
} = require("../controllers/about.controller");

const { requireAdmin } = require("../middleware/auth.middleware");

// Public
router.get("/public", getAboutPublic);

// Admin (protected)
router.get("/admin", requireAdmin, getAboutAdmin);
router.put("/admin", requireAdmin, upsertAboutAdmin);

module.exports = router;