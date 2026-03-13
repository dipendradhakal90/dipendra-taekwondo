const router = require("express").Router();
const c = require("../controllers/certifications.controller");
const { requireAdmin } = require("../middleware/auth.middleware");
const Certification = require("../models/Certification");
const auth = require("../middleware/auth.middleware");


// public
router.get("/", c.listPublished);

// admin
router.get("/admin/all", requireAdmin, c.listAllAdmin);
router.post("/", requireAdmin, c.create);
router.put("/:id", requireAdmin, c.update);
router.delete("/:id", requireAdmin, c.remove);
// ⭐ Toggle featured for a certification (admin only)
router.patch("/:id/featured", requireAdmin, async (req, res) => {
  try {
    const item = await Certification.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Certification not found" });

    item.isFeatured = !item.isFeatured;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle featured" });
  }
});


module.exports = router;
