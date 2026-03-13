const router = require("express").Router();
const c = require("../controllers/gallery.controller");
const { requireAdmin } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const Gallery = require("../models/Gallery");
const auth = require("../middleware/auth.middleware");


// public
router.get("/", c.listPublished);

// admin
router.get("/admin/all", requireAdmin, c.listAllAdmin);
router.post("/admin", requireAdmin, c.createFromUrl);
router.post("/upload", requireAdmin, upload.single("image"), c.upload);
router.put("/:id", requireAdmin, c.update);
router.delete("/:id", requireAdmin, c.remove);
// ⭐ Toggle featured for a gallery image (admin only)
router.patch("/:id/featured", requireAdmin, async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Gallery item not found" });

    item.isFeatured = !item.isFeatured;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle featured" });
  }
});


module.exports = router;
