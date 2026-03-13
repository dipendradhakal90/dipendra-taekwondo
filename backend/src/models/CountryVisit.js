const mongoose = require("mongoose");

const CountryVisitSchema = new mongoose.Schema(
  {
    countryName: { type: String, required: true, unique: true, trim: true },
    countryCode: { type: String, required: true, unique: true, uppercase: true, trim: true }, // ISO 2-letter: US, NP, etc.
    flagEmoji: { type: String, default: "" }, // Optional emoji flag
    flagUrl: { type: String, default: "" }, // SVG/PNG flag URL (optional)
    visitDate: { type: Date, default: Date.now },
    description: { type: String, default: "" }, // e.g., "Asian Games 2023"
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CountryVisit", CountryVisitSchema);
