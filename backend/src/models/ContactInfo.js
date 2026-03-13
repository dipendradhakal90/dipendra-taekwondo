const mongoose = require("mongoose");

const ContactInfoSchema = new mongoose.Schema(
  {
    email: { type: String, default: "kabinegi@gmail.com", trim: true },
    phone: { type: String, default: "+977 9851312929", trim: true },
    location: { type: String, default: "Nepal", trim: true },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ContactInfoSchema.index({ createdAt: 1 });

module.exports = mongoose.model("ContactInfo", ContactInfoSchema);
