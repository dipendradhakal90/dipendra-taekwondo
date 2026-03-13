const router = require("express").Router();
const c = require("../controllers/achievements.controller");
const { requireAdmin } = require("../middleware/auth.middleware");
const Event = require("../models/Event");

// public
router.get("/", c.listPublished);

// admin
router.get("/admin/all", requireAdmin, c.listAllAdmin);
router.post("/", requireAdmin, c.create);
router.put("/:id", requireAdmin, c.update);
router.delete("/:id", requireAdmin, c.remove);
router.patch("/:id/featured", requireAdmin, async (req, res) => {
  try {
    const item = await Event.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Achievement not found" });

    item.isFeatured = !item.isFeatured;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle featured" });
  }
});

module.exports = router;
