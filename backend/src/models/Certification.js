const mongoose = require("mongoose");

const CertificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issuer: { type: String, default: "", trim: true }, // WTF/ATF/etc.
    issueDate: { type: Date, required: true },
    credentialId: { type: String, default: "", trim: true },
    credentialUrl: { type: String, default: "", trim: true }, // PDF/image/link
    description: { type: String, default: "" },
    isPublished: { type: Boolean, default: true },
    isFeatured: {
  type: Boolean,
  default: false,
},

  },
  { timestamps: true }
);

module.exports = mongoose.model("Certification", CertificationSchema);
