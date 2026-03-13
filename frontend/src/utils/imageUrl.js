function extractGoogleDriveFileId(url = "") {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = String(url).match(pattern);
    if (match?.[1]) return match[1];
  }
  return "";
}

export function normalizeImageUrl(rawUrl = "") {
  const value = String(rawUrl || "")
    .trim()
    .replace(/^[<"\s]+|[>"\s]+$/g, "")
    .replace(/[;,]+$/g, "");
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("blob:")) return value;

  // Keep local paths untouched except URI-safe encoding for spaces.
  if (value.startsWith("/")) return encodeURI(value);

  try {
    const parsed = new URL(value);
    // If URL was previously saved as proxy URL, unwrap it and normalize the original source URL.
    if (parsed.pathname.includes("/api/image-proxy")) {
      const original = parsed.searchParams.get("url");
      if (original) {
        try {
          return normalizeImageUrl(decodeURIComponent(original));
        } catch {
          return normalizeImageUrl(original);
        }
      }
    }

    const hostname = parsed.hostname.toLowerCase();

    if (hostname.includes("drive.google.com") || hostname.includes("docs.google.com")) {
      const fileId = extractGoogleDriveFileId(value);
      if (fileId) {
        const resourceKey = parsed.searchParams.get("resourcekey");
        const resourceKeyPart = resourceKey ? `&resourcekey=${encodeURIComponent(resourceKey)}` : "";
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000${resourceKeyPart}`;
      }
    }

    if (hostname.includes("dropbox.com")) {
      let x = value.replace("www.dropbox.com", "dl.dropboxusercontent.com");
      if (x.includes("?")) {
        x = x.replace(/([?&])dl=0/, "$1raw=1").replace(/([?&])dl=1/, "$1raw=1");
      } else {
        x += "?raw=1";
      }
      return encodeURI(x);
    }

    return encodeURI(value);
  } catch {
    return encodeURI(value);
  }
}

export function toDisplayImageUrl(rawUrl = "") {
  const normalized = normalizeImageUrl(rawUrl);
  if (!normalized) return "";
  if (normalized.startsWith("data:") || normalized.startsWith("blob:") || normalized.startsWith("/")) return normalized;
  if (normalized.includes("/api/image-proxy?url=")) return normalized;

  try {
    const u = new URL(normalized);
    const host = u.hostname.toLowerCase();
    const safeDirectHosts = [
      "drive.google.com",
      "lh3.googleusercontent.com",
      "googleusercontent.com",
      "dl.dropboxusercontent.com",
      "res.cloudinary.com",
      "images.unsplash.com",
      "i.imgur.com",
      "imgur.com",
      "cdn.discordapp.com",
      "raw.githubusercontent.com",
    ];
    if (safeDirectHosts.some((h) => host === h || host.endsWith(`.${h}`))) {
      return normalized;
    }
  } catch {
    // fallback to proxy below
  }

  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
  return `${apiBase}/image-proxy?url=${encodeURIComponent(normalized)}`;
}
