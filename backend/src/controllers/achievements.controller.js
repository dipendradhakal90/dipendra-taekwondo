const Event = require("../models/Event");
const { importImageToCloudinary } = require("../utils/image-storage.util");
const { normalizeImageFields } = require("../utils/image-url.util");

// PUBLIC
exports.listPublished = async (req, res, next) => {
  try {
    const items = await Event.find({ isPublished: true }).sort({ date: -1 }).lean();
    res.json(normalizeImageFields(items, ["imageUrl"]));
  } catch (e) { next(e); }
};

// ADMIN
exports.listAllAdmin = async (req, res, next) => {
  try {
    const items = await Event.find({}).sort({ date: -1 }).lean();
    res.json(normalizeImageFields(items, ["imageUrl"]));
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const {
      title,
      date,
      summary = "",
      imageUrl = "",
      organization = "",
      location = "",
      role = "Referee",
      level = "International",
      description = "",
      isPublished = true,
    } = req.body;
    if (!title || !date) return res.status(400).json({ message: "title and date required" });

    const created = await Event.create({
      title,
      date,
      summary,
      imageUrl: await importImageToCloudinary(imageUrl, "referee_portal/achievements"),
      organization,
      location,
      role,
      level,
      description,
      isPublished,
    });
    res.status(201).json(normalizeImageFields(created.toObject(), ["imageUrl"]));
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Event.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Achievement not found" });

    const fields = ["title", "date", "summary", "organization", "location", "role", "level", "description", "isPublished"];
    fields.forEach((k) => {
      if (typeof req.body[k] !== "undefined") item[k] = req.body[k];
    });
    if (typeof req.body.imageUrl === "string") {
      item.imageUrl = await importImageToCloudinary(req.body.imageUrl, "referee_portal/achievements");
    }

    await item.save();
    res.json(normalizeImageFields(item.toObject(), ["imageUrl"]));
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Achievement not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
};
