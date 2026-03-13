const Post = require("../models/Post");
const { normalizeImageFields } = require("../utils/image-url.util");
const { importImageToCloudinary } = require("../utils/image-storage.util");

function slugify(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// PUBLIC
exports.listPublished = async (req, res, next) => {
  try {
    const posts = await Post.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    res.json(normalizeImageFields(posts, ["coverImageUrl"]));
  } catch (e) { next(e); }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, isPublished: true }).lean();
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(normalizeImageFields(post, ["coverImageUrl"]));
  } catch (e) { next(e); }
};

// ADMIN
exports.listAllAdmin = async (req, res, next) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 }).lean();
    res.json(normalizeImageFields(posts, ["coverImageUrl"]));
  } catch (e) { next(e); }
};

exports.uploadCover = async (req, res, next) => {
  try {
    if (!req.file?.path) return res.status(400).json({ message: "Image required" });
    res.status(201).json({
      imageUrl: req.file.path,
      publicId: req.file.filename || ""
    });
  } catch (e) { next(e); }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, content, excerpt = "", coverImageUrl = "", isPublished = true } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title and content required" });

    const slug = slugify(title);
    const exists = await Post.findOne({ slug });
    if (exists) return res.status(409).json({ message: "Similar title already exists" });

    const created = await Post.create({
      title,
      slug,
      content,
      excerpt,
      coverImageUrl: await importImageToCloudinary(coverImageUrl, "referee_portal/posts"),
      isPublished
    });
    res.status(201).json(normalizeImageFields(created.toObject(), ["coverImageUrl"]));
  } catch (e) { next(e); }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const { title, content, excerpt, coverImageUrl, isPublished } = req.body;

    if (typeof title === "string" && title.trim() && title !== post.title) {
      post.title = title;
      post.slug = slugify(title);
    }
    if (typeof content === "string") post.content = content;
    if (typeof excerpt === "string") post.excerpt = excerpt;
    if (typeof coverImageUrl === "string") {
      post.coverImageUrl = await importImageToCloudinary(coverImageUrl, "referee_portal/posts");
    }
    if (typeof isPublished === "boolean") post.isPublished = isPublished;

    await post.save();
    res.json(normalizeImageFields(post.toObject(), ["coverImageUrl"]));
  } catch (e) { next(e); }
};

exports.deletePost = async (req, res, next) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Post not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
};
