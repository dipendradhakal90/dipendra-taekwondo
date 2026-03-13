const Certification = require("../models/Certification");
const { normalizeImageFields } = require("../utils/image-url.util");
const { importImageToCloudinary } = require("../utils/image-storage.util");

// public
exports.listPublished = async (req, res, next) => {
  try {
    const items = await Certification.find({ isPublished: true }).sort({ issueDate: -1 }).lean();
    res.json(normalizeImageFields(items, ["credentialUrl"]));
  } catch (e) { next(e); }
};

// admin
exports.listAllAdmin = async (req, res, next) => {
  try {
    const items = await Certification.find({}).sort({ issueDate: -1 }).lean();
    res.json(normalizeImageFields(items, ["credentialUrl"]));
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, issuer="", issueDate, credentialId="", credentialUrl="", description="", isPublished=true } = req.body;
    if (!title || !issueDate) return res.status(400).json({ message: "title and issueDate required" });

    const created = await Certification.create({
      title,
      issuer,
      issueDate,
      credentialId,
      credentialUrl: await importImageToCloudinary(credentialUrl, "referee_portal/certifications"),
      description,
      isPublished
    });
    res.status(201).json(normalizeImageFields(created.toObject(), ["credentialUrl"]));
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Certification.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Certification not found" });

    const fields = ["title","issuer","issueDate","credentialId","description","isPublished"];
    fields.forEach((k) => {
      if (typeof req.body[k] === "undefined") return;
      item[k] = req.body[k];
    });
    if (typeof req.body.credentialUrl === "string") {
      item.credentialUrl = await importImageToCloudinary(req.body.credentialUrl, "referee_portal/certifications");
    }

    await item.save();
    res.json(normalizeImageFields(item.toObject(), ["credentialUrl"]));
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await Certification.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Certification not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
};
