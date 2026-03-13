const router = require("express").Router();
const c = require("../controllers/countries.controller");
const { requireAdmin } = require("../middleware/auth.middleware");

// public
router.get("/", c.listPublished);

// admin
router.get("/admin/all", requireAdmin, c.listAllAdmin);
router.post("/", requireAdmin, c.create);
router.put("/:id", requireAdmin, c.update);
router.delete("/:id", requireAdmin, c.remove);

module.exports = router;
