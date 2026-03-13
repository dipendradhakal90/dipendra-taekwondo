const Award = require("../models/Award");
const { normalizeImageFields } = require("../utils/image-url.util");
const { importImageToCloudinary } = require("../utils/image-storage.util");

// public - list published awards
exports.listPublished = async (req, res, next) => {
  try {
    const items = await Award.find({ isPublished: true }).sort({ awardDate: -1 }).lean();
    res.json(normalizeImageFields(items, ["imageUrl"]));
  } catch (e) { next(e); }
};

// admin - all awards
exports.listAllAdmin = async (req, res, next) => {
  try {
    const items = await Award.find({}).sort({ awardDate: -1 }).lean();
    res.json(normalizeImageFields(items, ["imageUrl"]));
  } catch (e) { next(e); }
};

// admin - create
exports.create = async (req, res, next) => {
  try {
    const { title, issuer = "", awardDate, imageUrl = "", description = "", isPublished = true } = req.body;
    
    if (!title || !awardDate) 
      return res.status(400).json({ message: "title and awardDate required" });

    const created = await Award.create({ 
      title, 
      issuer, 
      awardDate, 
      imageUrl: await importImageToCloudinary(imageUrl, "referee_portal/awards"),
      description,
      isPublished 
    });
    
    res.status(201).json(normalizeImageFields(created.toObject(), ["imageUrl"]));
  } catch (e) { next(e); }
};

// admin - update
exports.update = async (req, res, next) => {
  try {
    const item = await Award.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Award not found" });

    const fields = ["title", "issuer", "awardDate", "description", "isFeatured", "isPublished"];
    fields.forEach((k) => {
      if (typeof req.body[k] === "undefined") return;
      item[k] = req.body[k];
    });
    if (typeof req.body.imageUrl === "string") {
      item.imageUrl = await importImageToCloudinary(req.body.imageUrl, "referee_portal/awards");
    }

    await item.save();
    res.json(normalizeImageFields(item.toObject(), ["imageUrl"]));
  } catch (e) { next(e); }
};

// admin - delete
exports.remove = async (req, res, next) => {
  try {
    const deleted = await Award.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Award not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
};

// ⭐ Toggle featured
exports.toggleFeatured = async (req, res, next) => {
  try {
    const item = await Award.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Award not found" });

    item.isFeatured = !item.isFeatured;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle featured" });
  }
};
