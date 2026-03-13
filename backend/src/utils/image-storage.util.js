const cloudinary = require("../config/cloudinary");
const { normalizeImageUrl } = require("./image-url.util");

function isCloudinaryUrl(value = "") {
  try {
    const u = new URL(value);
    const host = u.hostname.toLowerCase();
    return host === "res.cloudinary.com" || host.endsWith(".res.cloudinary.com");
  } catch {
    return false;
  }
}

function isRemoteHttpUrl(value = "") {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

async function importImageToCloudinary(rawUrl = "", folder = "referee_portal/misc") {
  const normalized = normalizeImageUrl(rawUrl);
  if (!normalized) return "";
  if (normalized.startsWith("data:") || normalized.startsWith("blob:") || normalized.startsWith("/")) {
    return normalized;
  }
  if (!isRemoteHttpUrl(normalized) || isCloudinaryUrl(normalized)) return normalized;

  try {
    const uploaded = await cloudinary.uploader.upload(normalized, {
      folder,
      resource_type: "image",
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });
    return uploaded?.secure_url || normalized;
  } catch (err) {
    console.warn(`Cloudinary import skipped for ${folder}: ${err.message}`);
    return normalized;
  }
}

module.exports = { importImageToCloudinary };
