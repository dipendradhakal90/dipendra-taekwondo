const MediaCoverage = require("../models/MediaCoverage");
const { normalizeImageFields } = require("../utils/image-url.util");
const { importImageToCloudinary } = require("../utils/image-storage.util");

// PUBLIC
exports.listPublished = async (req, res, next) => {
  try {
    const mediaCoverage = await MediaCoverage.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .lean();
    res.json(normalizeImageFields(mediaCoverage, ["coverImageUrl"]));
  } catch (e) {
    next(e);
  }
};

exports.getLatest = async (req, res, next) => {
  try {
    const limit = req.query.limit || 5;
    const mediaCoverage = await MediaCoverage.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();
    res.json(normalizeImageFields(mediaCoverage, ["coverImageUrl"]));
  } catch (e) {
    next(e);
  }
};

// ADMIN
exports.listAllAdmin = async (req, res, next) => {
  try {
    const mediaCoverage = await MediaCoverage.find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json(normalizeImageFields(mediaCoverage, ["coverImageUrl"]));
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description = "", url, coverImageUrl = "", type = "other", isPublished = true } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: "Title and URL are required" });
    }

    const created = await MediaCoverage.create({
      title,
      description,
      url,
      coverImageUrl: await importImageToCloudinary(coverImageUrl, "referee_portal/media-coverage"),
      type,
      isPublished
    });

    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const mediaCoverage = await MediaCoverage.findById(req.params.id);
    if (!mediaCoverage) {
      return res.status(404).json({ message: "Media coverage not found" });
    }

    const { title, description, url, coverImageUrl, type, isPublished } = req.body;

    if (typeof title === "string") mediaCoverage.title = title;
    if (typeof description === "string") mediaCoverage.description = description;
    if (typeof url === "string") mediaCoverage.url = url;
    if (typeof coverImageUrl === "string") {
      mediaCoverage.coverImageUrl = await importImageToCloudinary(coverImageUrl, "referee_portal/media-coverage");
    }
    if (typeof type === "string") mediaCoverage.type = type;
    if (typeof isPublished === "boolean") mediaCoverage.isPublished = isPublished;

    await mediaCoverage.save();
    res.json(mediaCoverage);
  } catch (e) {
    next(e);
  }
};

exports.deleteMedia = async (req, res, next) => {
  try {
    const deleted = await MediaCoverage.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Media coverage not found" });
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};
