// server.js
const express = require("express");
const cors = require("cors");
const shortid = require("shortid");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// ✅ CORS: Allow all origins (or replace "*" with your Netlify URL for security)
app.use(cors({
  origin: "https://stately-heliotrope-0f42ea.netlify.app/", // replace with "https://stately-heliotrope-0f42ea.netlify.app/" in production
}));

// Database file
const dbFile = path.join(__dirname, "urlDatabase.json");
let urlDatabase = {};

// Load database if exists
if (fs.existsSync(dbFile)) {
  try {
    urlDatabase = JSON.parse(fs.readFileSync(dbFile, "utf-8"));
  } catch {
    urlDatabase = {};
  }
}

// Save database function
const saveDatabase = () => fs.writeFileSync(dbFile, JSON.stringify(urlDatabase, null, 2));

// Use your Render public URL here
const BASE_URL = "https://link-shortern.onrender.com"; // <-- Replace with your Render backend URL

// POST /shorten
app.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl) return res.status(400).json({ error: "URL required" });

  // Simple URL validation
  if (!/^https?:\/\/.+\..+/.test(longUrl))
    return res.status(400).json({ error: "Invalid URL format" });

  const shortCode = shortid.generate();
  const shortUrl = `${BASE_URL}/${shortCode}`;

  urlDatabase[shortCode] = longUrl;
  saveDatabase();

  const qrCode = await QRCode.toDataURL(shortUrl); // Base64 QR code
  res.json({ shortUrl, qrCode });
});

// Redirect short URL
app.get("/:code", (req, res) => {
  const longUrl = urlDatabase[req.params.code];
  if (longUrl) res.redirect(longUrl);
  else res.status(404).send("Not Found");
});

// Optional root route
app.get("/", (req, res) => res.send("Link Shortener API is running!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
