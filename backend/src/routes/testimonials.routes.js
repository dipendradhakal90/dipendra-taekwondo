// backend/src/routes/testimonials.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/testimonials.controller");
const { requireAdmin } = require("../middleware/auth.middleware");

// Public routes
router.get("/published", controller.getPublished);
router.get("/featured", controller.getFeatured);

// Protected admin routes
router.get("/", requireAdmin, controller.getAll);
router.post("/", requireAdmin, controller.create);
router.get("/:id", requireAdmin, controller.getById);
router.put("/:id", requireAdmin, controller.update);
router.delete("/:id", requireAdmin, controller.deleteTestimonial);
router.patch("/:id/toggle-featured", requireAdmin, controller.toggleFeatured);
router.patch("/:id/toggle-published", requireAdmin, controller.togglePublished);

module.exports = router;
