const mongoose = require("mongoose");

const AwardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issuer: { type: String, default: "", trim: true }, // e.g., "Nepal Olympic Committee"
    awardDate: { type: Date, required: true },
    imageUrl: { type: String, default: "" }, // Certificate/award image
    description: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Award", AwardSchema);
