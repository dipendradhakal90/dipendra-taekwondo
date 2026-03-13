const router = require("express").Router();
const c = require("../controllers/messages.controller");
const { requireAdmin } = require("../middleware/auth.middleware");

// public
router.post("/", c.send);
router.get("/contact-info", c.getContactInfoPublic);

// admin
router.get("/admin/all", requireAdmin, c.listAll);
router.put("/admin/read/:id", requireAdmin, c.markRead);
router.delete("/admin/:id", requireAdmin, c.remove);
router.get("/admin/contact-info", requireAdmin, c.getContactInfoAdmin);
router.put("/admin/contact-info", requireAdmin, c.upsertContactInfoAdmin);

module.exports = router;
