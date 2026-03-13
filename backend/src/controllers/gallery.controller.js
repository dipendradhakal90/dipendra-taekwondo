const Gallery = require("../models/Gallery");
const cloudinary = require("../config/cloudinary");
const { normalizeImageFields } = require("../utils/image-url.util");
const { importImageToCloudinary } = require("../utils/image-storage.util");

// public
exports.listPublished = async (req, res, next) => {
  try {
    const items = await Gallery.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    res.json(normalizeImageFields(items, ["imageUrl"]));
  } catch (e) { next(e); }
};

// admin
exports.listAllAdmin = async (req, res, next) => {
  try {
    const items = await Gallery.find({}).sort({ createdAt: -1 }).lean();
    res.json(normalizeImageFields(items, ["imageUrl"]));
  } catch (e) { next(e); }
};

exports.upload = async (req, res, next) => {
  try {
    const { title = "", album = "General", isPublished = true } = req.body;

    if (!req.file) return res.status(400).json({ message: "Image required" });

    const created = await Gallery.create({
      title,
      album,
      imageUrl: req.file.path,
      publicId: req.file.filename,
      isPublished,
    });

    res.status(201).json(normalizeImageFields(created.toObject(), ["imageUrl"]));
  } catch (e) { next(e); }
};

exports.createFromUrl = async (req, res, next) => {
  try {
    const { title = "", album = "General", imageUrl = "", isPublished = true } = req.body;
    if (!String(imageUrl).trim()) return res.status(400).json({ message: "Image URL required" });

    const created = await Gallery.create({
      title,
      album,
      imageUrl: await importImageToCloudinary(String(imageUrl).trim(), "referee_portal/gallery"),
      publicId: "",
      isPublished,
    });

    res.status(201).json(normalizeImageFields(created.toObject(), ["imageUrl"]));
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Image not found" });

    const {
      title,
      album,
      imageUrl,
      isPublished,
    } = req.body || {};

    if (typeof title === "string") item.title = title;
    if (typeof album === "string" && album.trim()) item.album = album;
    if (typeof imageUrl === "string" && imageUrl.trim()) {
      item.imageUrl = await importImageToCloudinary(imageUrl.trim(), "referee_portal/gallery");
      // keep publicId empty for URL-based replacement; do not destroy existing asset here
      if (!item.publicId) item.publicId = "";
    }
    if (typeof isPublished === "boolean") item.isPublished = isPublished;

    await item.save();
    res.json(normalizeImageFields(item.toObject(), ["imageUrl"]));
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Image not found" });

    if (item.publicId) {
      await cloudinary.uploader.destroy(item.publicId);
    }
    await item.deleteOne();

    res.json({ ok: true });
  } catch (e) { next(e); }
};
