const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "", trim: true },
    organization: { type: String, default: "", trim: true }, // WTF/ATF/National, etc.
    location: { type: String, default: "", trim: true },
    role: { type: String, default: "Referee", trim: true },
    level: { type: String, default: "International", trim: true }, // International/National/State
    date: { type: Date, required: true },
    description: { type: String, default: "" },
    isPublished: { type: Boolean, default: true },
    isFeatured: {
  type: Boolean,
  default: false,
},

  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
