const mongoose = require("mongoose");

const MediaCoverageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    url: { type: String, required: true },
    coverImageUrl: { type: String, default: "" },
    type: { 
      type: String, 
      enum: ["newspaper", "video", "magazine", "news-portal", "other"], 
      default: "other" 
    },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MediaCoverage", MediaCoverageSchema);
