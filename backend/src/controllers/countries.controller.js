const CountryVisit = require("../models/CountryVisit");
const { normalizeImageFields } = require("../utils/image-url.util");
const { importImageToCloudinary } = require("../utils/image-storage.util");

// public - list all published countries
exports.listPublished = async (req, res, next) => {
  try {
    const items = await CountryVisit.find({ isPublished: true }).sort({ visitDate: -1 }).lean();
    res.json(normalizeImageFields(items, ["flagUrl"]));
  } catch (e) { next(e); }
};

// admin - all countries
exports.listAllAdmin = async (req, res, next) => {
  try {
    const items = await CountryVisit.find({}).sort({ visitDate: -1 }).lean();
    res.json(normalizeImageFields(items, ["flagUrl"]));
  } catch (e) { next(e); }
};

// admin - create
exports.create = async (req, res, next) => {
  try {
    const { countryName, countryCode, flagUrl = "", flagEmoji = "", visitDate = new Date(), description = "", isPublished = true } = req.body;
    
    if (!countryName || !countryCode) 
      return res.status(400).json({ message: "countryName and countryCode required" });

    const exists = await CountryVisit.findOne({ countryCode: countryCode.toUpperCase() });
    if (exists) return res.status(409).json({ message: "Country already exists" });

    const created = await CountryVisit.create({ 
      countryName, 
      countryCode: countryCode.toUpperCase(), 
      flagUrl: await importImageToCloudinary(flagUrl, "referee_portal/countries"),
      flagEmoji, 
      visitDate, 
      description,
      isPublished 
    });
    
    res.status(201).json(normalizeImageFields(created.toObject(), ["flagUrl"]));
  } catch (e) { next(e); }
};

// admin - update
exports.update = async (req, res, next) => {
  try {
    const item = await CountryVisit.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Country not found" });

    const fields = ["countryName", "countryCode", "flagEmoji", "visitDate", "description", "isPublished"];
    fields.forEach((k) => {
      if (typeof req.body[k] !== "undefined") {
        if (k === "countryCode") item[k] = req.body[k].toUpperCase();
        else item[k] = req.body[k];
      }
    });
    if (typeof req.body.flagUrl === "string") {
      item.flagUrl = await importImageToCloudinary(req.body.flagUrl, "referee_portal/countries");
    }

    await item.save();
    res.json(normalizeImageFields(item.toObject(), ["flagUrl"]));
  } catch (e) { next(e); }
};

// admin - delete
exports.remove = async (req, res, next) => {
  try {
    const deleted = await CountryVisit.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Country not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
};
