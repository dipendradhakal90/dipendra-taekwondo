const router = require("express").Router();
const Gallery = require("../models/Gallery");
const Event = require("../models/Event");
const Certification = require("../models/Certification");

// Home featured content API
router.get("/featured", async (req, res) => {
  try {
    const featuredGallery = await Gallery.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(12);
    const featuredAchievements = await Event.find({ isFeatured: true }).sort({ date: -1 }).limit(6);
    const featuredCerts = await Certification.find({ isFeatured: true }).sort({ issueDate: -1 }).limit(6);

    res.json({
      gallery: featuredGallery,
      achievements: featuredAchievements,
      certifications: featuredCerts,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load featured content" });
  }
});

module.exports = router;
