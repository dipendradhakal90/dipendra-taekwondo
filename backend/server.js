require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");

// Routes
const authRoutes = require("./src/routes/auth.routes");
const postsRoutes = require("./src/routes/posts.routes");
const achievementsRoutes = require("./src/routes/achievements.routes");
const certificationsRoutes = require("./src/routes/certifications.routes");
const galleryRoutes = require("./src/routes/gallery.routes");
const messagesRoutes = require("./src/routes/messages.routes");
const homeRoutes = require("./src/routes/home");
const aboutRoutes = require("./src/routes/about.routes");
const countriesRoutes = require("./src/routes/countries.routes");
const awardsRoutes = require("./src/routes/awards.routes");
const testimonialsRoutes = require("./src/routes/testimonials.routes");
const mediaCoverageRoutes = require("./src/routes/media-coverage.routes");
const imageProxyRoutes = require("./src/routes/image-proxy.routes");

const app = express();
app.disable("x-powered-by");

/* =========================
   MIDDLEWARE
========================= */
const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (corsOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked"));
    },
    credentials: true,
  })
);

// Basic security headers without extra dependencies
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(express.json({ limit: "1mb" }));

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/achievements", achievementsRoutes);
app.use("/api/certifications", certificationsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/countries", countriesRoutes);
app.use("/api/awards", awardsRoutes);
app.use("/api/testimonials", testimonialsRoutes);
app.use("/api/media-coverage", mediaCoverageRoutes);
app.use("/api/image-proxy", imageProxyRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString()
  });
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
  });
});
