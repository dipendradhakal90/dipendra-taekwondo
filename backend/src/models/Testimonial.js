// backend/src/models/Testimonial.js
const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: [true, "Testimonial author is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Author role is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Testimonial content is required"],
      minlength: [10, "Testimonial must be at least 10 characters"],
      maxlength: [1000, "Testimonial must not exceed 1000 characters"],
    },
    image: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
