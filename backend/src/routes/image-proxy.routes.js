const router = require("express").Router();

function isBlockedHostname(hostname = "") {
  const h = String(hostname || "").toLowerCase();
  if (!h) return true;
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h === "::1" || h === "[::1]") return true;
  if (/^127\./.test(h) || h === "0.0.0.0") return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  return false;
}

function isHttpUrl(value) {
  try {
    const u = new URL(value);
    if (!(u.protocol === "http:" || u.protocol === "https:")) return false;
    return !isBlockedHostname(u.hostname);
  } catch {
    return false;
  }
}

router.get("/", async (req, res) => {
  const raw = (req.query.url || "").toString().trim();
  try {
    if (!raw || !isHttpUrl(raw)) {
      return res.status(400).json({ message: "Valid image url is required" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const resp = await fetch(raw, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RefereePortalImageProxy/1.0)",
        Accept: "image/*,*/*;q=0.8",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!resp.ok) {
      return res.redirect(raw);
    }

    const ct = resp.headers.get("content-type") || "";
    const contentLength = Number(resp.headers.get("content-length") || 0);

    if (contentLength && contentLength > 10 * 1024 * 1024) {
      return res.redirect(raw);
    }

    if (!ct.startsWith("image/")) {
      return res.redirect(raw);
    }

    const buf = Buffer.from(await resp.arrayBuffer());
    res.setHeader("Content-Type", ct);
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).send(buf);
  } catch (err) {
    if (raw && isHttpUrl(raw)) return res.redirect(raw);
    return res.status(500).json({ message: "Unable to proxy image" });
  }
});

module.exports = router;
