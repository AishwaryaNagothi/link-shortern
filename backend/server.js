// server.js
const express = require("express");
const cors = require("cors");
const shortid = require("shortid");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// ✅ CORS Setup
app.use(cors({
  origin: "https://stately-heliotrope-0f42ea.netlify.app", // your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests automatically
app.options('*', cors());

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

// Use your Render public URL
const BASE_URL = "https://link-shortern.onrender.com"; // replace with deployed URL

// POST /shorten → shorten URL & generate QR code
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

  try {
    const qrCode = await QRCode.toDataURL(shortUrl); // Base64 QR code
    res.json({ shortUrl, qrCode });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

// Redirect short URL
app.get("/:code", (req, res) => {
  const longUrl = urlDatabase[req.params.code];
  if (longUrl) res.redirect(longUrl);
  else res.status(404).send("Not Found");
});

// Root route
app.get("/", (req, res) => res.send("Link Shortener API is running!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
