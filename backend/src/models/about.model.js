const mongoose = require("mongoose");

const StatSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    value: { type: String, default: "" },
  },
  { _id: false }
);

const AboutSchema = new mongoose.Schema(
  {
    heading: { type: String, default: "About" },
    subheading: { type: String, default: "" },
    bio: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    profileImageUrl: { type: String, default: "" },
    profileName: { type: String, default: "Dipendra Dhakal" },
    profileTitle: { type: String, default: "International Taekwondo Referee" },

    highlights: [{ type: String }],

    stats: [StatSchema],

    ctaPrimaryText: { type: String, default: "Contact" },
    ctaPrimaryLink: { type: String, default: "/contact" },

    ctaSecondaryText: { type: String, default: "View Certifications" },
    ctaSecondaryLink: { type: String, default: "/certifications" },

    profileStatusTitle: { type: String, default: "PROFESSIONAL STATUS" },
    profileStatusItems: [{ type: String }],

    taekwondoTrainingsTitle: { type: String, default: "TAEKWONDO TRAININGS" },
    taekwondoTrainingsItems: [{ type: String }],

    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ Single About document in DB
AboutSchema.index({ createdAt: 1 });

module.exports = mongoose.model("About", AboutSchema);
