const router = require("express").Router();
const { setupAdmin, login, me } = require("../controllers/auth.controller");
const { requireAdmin } = require("../middleware/auth.middleware");

/**
 * ✅ Keep old working routes (your existing ones)
 */
router.post("/admin/setup", setupAdmin);
router.post("/admin/login", login);
router.get("/admin/me", requireAdmin, me);

/**
 * ✅ Add NEW aliases to match frontend request
 * Frontend is calling: /api/auth/login
 */
router.post("/login", login);
router.get("/me", requireAdmin, me);

module.exports = router;