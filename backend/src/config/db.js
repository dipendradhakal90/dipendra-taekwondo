// backend/src/config/db.js
const dns = require("node:dns");
const mongoose = require("mongoose");

// Optional: Fix SRV DNS issues for mongodb+srv
function applyDnsServersFromEnv() {
  const raw = process.env.DNS_SERVERS; // example: "1.1.1.1,8.8.8.8"
  if (!raw) return;

  const servers = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!servers.length) return;

  try {
    dns.setServers(servers);
    console.log("🌐 Using custom DNS servers:", servers.join(", "));
  } catch (err) {
    console.log("⚠️ Invalid DNS_SERVERS value. Skipping DNS override.");
  }
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI missing in .env");
    process.exit(1);
  }

  applyDnsServersFromEnv();

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;