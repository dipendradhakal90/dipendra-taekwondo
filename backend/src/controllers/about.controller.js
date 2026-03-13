const About = require("../models/about.model");
const { normalizeImageFields } = require("../utils/image-url.util");
const { importImageToCloudinary } = require("../utils/image-storage.util");

// ✅ helper: always return 1 doc (create if not exists)
async function getOrCreateAbout() {
  let doc = await About.findOne();
  if (!doc) doc = await About.create({});
  return doc;
}

// ✅ Public (only if published)
exports.getAboutPublic = async (req, res) => {
  try {
    const doc = await getOrCreateAbout();

    if (!doc.isPublished) {
      return res.status(200).json({
        heading: "About",
        subheading: "",
        bio: "",
        imageUrl: "",
        profileImageUrl: "",
        profileName: "Dipendra Dhakal",
        profileTitle: "International Taekwondo Referee",
        highlights: [],
        stats: [],
        ctaPrimaryText: "Contact",
        ctaPrimaryLink: "/contact",
        ctaSecondaryText: "View Certifications",
        ctaSecondaryLink: "/certifications",
        profileStatusTitle: "PROFESSIONAL STATUS",
        profileStatusItems: [],
        taekwondoTrainingsTitle: "TAEKWONDO TRAININGS",
        taekwondoTrainingsItems: [],
        isPublished: false,
      });
    }

    return res.json(normalizeImageFields(doc.toObject(), ["imageUrl", "profileImageUrl"]));
  } catch (e) {
    return res.status(500).json({ message: "Failed to load about" });
  }
};

// ✅ Admin (full doc)
exports.getAboutAdmin = async (req, res) => {
  try {
    const doc = await getOrCreateAbout();
    return res.json(normalizeImageFields(doc.toObject(), ["imageUrl", "profileImageUrl"]));
  } catch (e) {
    return res.status(500).json({ message: "Failed to load about (admin)" });
  }
};

// ✅ Admin update (Upsert)
exports.upsertAboutAdmin = async (req, res) => {
  try {
    const doc = await getOrCreateAbout();

    const payload = {
      heading: req.body.heading ?? doc.heading,
      subheading: req.body.subheading ?? doc.subheading,
      bio: req.body.bio ?? doc.bio,
      imageUrl:
        typeof req.body.imageUrl === "string"
          ? await importImageToCloudinary(req.body.imageUrl, "referee_portal/about")
          : doc.imageUrl,
      profileImageUrl:
        typeof req.body.profileImageUrl === "string"
          ? await importImageToCloudinary(req.body.profileImageUrl, "referee_portal/about")
          : doc.profileImageUrl,
      profileName: req.body.profileName ?? doc.profileName,
      profileTitle: req.body.profileTitle ?? doc.profileTitle,

      highlights: Array.isArray(req.body.highlights) ? req.body.highlights : doc.highlights,
      stats: Array.isArray(req.body.stats) ? req.body.stats : doc.stats,

      ctaPrimaryText: req.body.ctaPrimaryText ?? doc.ctaPrimaryText,
      ctaPrimaryLink: req.body.ctaPrimaryLink ?? doc.ctaPrimaryLink,
      ctaSecondaryText: req.body.ctaSecondaryText ?? doc.ctaSecondaryText,
      ctaSecondaryLink: req.body.ctaSecondaryLink ?? doc.ctaSecondaryLink,
      profileStatusTitle: req.body.profileStatusTitle ?? doc.profileStatusTitle,
      profileStatusItems: Array.isArray(req.body.profileStatusItems) ? req.body.profileStatusItems : doc.profileStatusItems,
      taekwondoTrainingsTitle: req.body.taekwondoTrainingsTitle ?? doc.taekwondoTrainingsTitle,
      taekwondoTrainingsItems: Array.isArray(req.body.taekwondoTrainingsItems) ? req.body.taekwondoTrainingsItems : doc.taekwondoTrainingsItems,

      isPublished: typeof req.body.isPublished === "boolean" ? req.body.isPublished : doc.isPublished,
    };

    Object.assign(doc, payload);
    await doc.save();

    return res.json(normalizeImageFields(doc.toObject(), ["imageUrl", "profileImageUrl"]));
  } catch (e) {
    return res.status(500).json({ message: "Failed to update about" });
  }
};
