// backend/src/controllers/testimonials.controller.js
const Testimonial = require("../models/Testimonial");
const { normalizeImageFields } = require("../utils/image-url.util");
const { importImageToCloudinary } = require("../utils/image-storage.util");

// Get all testimonials (admin - includes unpublished)
exports.getAll = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(normalizeImageFields(testimonials.map((x) => x.toObject()), ["image"]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get published testimonials
exports.getPublished = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ published: true }).sort({
      featured: -1,
      createdAt: -1,
    });
    res.json(normalizeImageFields(testimonials.map((x) => x.toObject()), ["image"]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get featured testimonials (for home page)
exports.getFeatured = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({
      published: true,
      featured: true,
    })
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(normalizeImageFields(testimonials.map((x) => x.toObject()), ["image"]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single testimonial
exports.getById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }
    res.json(normalizeImageFields(testimonial.toObject(), ["image"]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create testimonial
exports.create = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (typeof payload.image === "string") {
      payload.image = await importImageToCloudinary(payload.image, "referee_portal/testimonials");
    }
    const testimonial = new Testimonial(payload);
    await testimonial.save();
    res.status(201).json(normalizeImageFields(testimonial.toObject(), ["image"]));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update testimonial
exports.update = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (typeof payload.image === "string") {
      payload.image = await importImageToCloudinary(payload.image, "referee_portal/testimonials");
    }
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );
    if (!testimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }
    res.json(normalizeImageFields(testimonial.toObject(), ["image"]));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }
    res.json({ message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle featured
exports.toggleFeatured = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }
    testimonial.featured = !testimonial.featured;
    await testimonial.save();
    res.json(normalizeImageFields(testimonial.toObject(), ["image"]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle published
exports.togglePublished = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }
    testimonial.published = !testimonial.published;
    await testimonial.save();
    res.json(normalizeImageFields(testimonial.toObject(), ["image"]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
