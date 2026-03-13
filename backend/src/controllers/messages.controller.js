const Message = require("../models/Message");
const ContactInfo = require("../models/ContactInfo");

async function getOrCreateContactInfo() {
  let doc = await ContactInfo.findOne();
  if (!doc) doc = await ContactInfo.create({});
  return doc;
}

// public
exports.send = async (req, res, next) => {
  try {
    const { name, email, subject="", message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: "All required fields missing" });

    const created = await Message.create({ name, email, subject, message });
    res.status(201).json({ ok: true, id: created._id });
  } catch (e) { next(e); }
};

exports.getContactInfoPublic = async (req, res, next) => {
  try {
    const doc = await getOrCreateContactInfo();
    if (!doc.isPublished) {
      return res.json({ email: "", phone: "", location: "", isPublished: false });
    }
    res.json({
      email: doc.email || "",
      phone: doc.phone || "",
      location: doc.location || "",
      isPublished: !!doc.isPublished,
    });
  } catch (e) { next(e); }
};

// admin
exports.listAll = async (req, res, next) => {
  try {
    const items = await Message.find({}).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (e) { next(e); }
};

exports.markRead = async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Not found" });
    msg.isRead = true;
    await msg.save();
    res.json({ ok: true });
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
};

exports.getContactInfoAdmin = async (req, res, next) => {
  try {
    const doc = await getOrCreateContactInfo();
    res.json({
      email: doc.email || "",
      phone: doc.phone || "",
      location: doc.location || "",
      isPublished: !!doc.isPublished,
    });
  } catch (e) { next(e); }
};

exports.upsertContactInfoAdmin = async (req, res, next) => {
  try {
    const doc = await getOrCreateContactInfo();

    if (typeof req.body.email === "string") doc.email = req.body.email.trim();
    if (typeof req.body.phone === "string") doc.phone = req.body.phone.trim();
    if (typeof req.body.location === "string") doc.location = req.body.location.trim();
    if (typeof req.body.isPublished === "boolean") doc.isPublished = req.body.isPublished;

    await doc.save();
    res.json({
      email: doc.email || "",
      phone: doc.phone || "",
      location: doc.location || "",
      isPublished: !!doc.isPublished,
    });
  } catch (e) { next(e); }
};
