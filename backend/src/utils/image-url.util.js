function extractGoogleDriveFileId(url) {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = String(url).match(pattern);
    if (match?.[1]) return match[1];
  }
  return "";
}

function normalizeImageUrl(rawUrl = "") {
  const value = String(rawUrl || "")
    .trim()
    .replace(/^[<"\s]+|[>"\s]+$/g, "")
    .replace(/[;,]+$/g, "");
  if (!value) return "";

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    const isGoogleDriveHost =
      hostname.includes("drive.google.com") || hostname.includes("docs.google.com");

    if (!isGoogleDriveHost) {
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
    }

    const fileId = extractGoogleDriveFileId(value);
    if (!fileId) return encodeURI(value);

    const resourceKey = parsed.searchParams.get("resourcekey");
    const resourceKeyPart = resourceKey ? `&resourcekey=${encodeURIComponent(resourceKey)}` : "";
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000${resourceKeyPart}`;
  } catch {
    return encodeURI(value);
  }
}

function normalizeImageFields(payload, fields = []) {
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeImageFields(item, fields));
  }

  if (!payload || typeof payload !== "object") return payload;

  const result = { ...payload };
  fields.forEach((field) => {
    if (typeof result[field] === "string") {
      result[field] = normalizeImageUrl(result[field]);
    }
  });
  return result;
}

module.exports = { normalizeImageUrl, normalizeImageFields };
