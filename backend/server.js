const express = require("express");
const cors = require("cors");
const shortid = require("shortid");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// File to store URLs persistently
const dbFile = path.join(__dirname, "urlDatabase.json");

// Load URLs from file if exists
let urlDatabase = {};
if (fs.existsSync(dbFile)) {
  urlDatabase = JSON.parse(fs.readFileSync(dbFile, "utf-8"));
}

// Helper to save database
const saveDatabase = () => {
  fs.writeFileSync(dbFile, JSON.stringify(urlDatabase, null, 2));
};

// Shorten URL
app.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl) return res.status(400).json({ error: "URL required" });

  const shortCode = shortid.generate();
  const shortUrl = `${req.protocol}://${req.get("host")}/${shortCode}`;

  urlDatabase[shortCode] = longUrl;
  saveDatabase(); // Save persistently

  const qrCode = await QRCode.toDataURL(shortUrl);
  res.json({ shortUrl, qrCode });
});

// Redirect
app.get("/:code", (req, res) => {
  const revealed = urlDatabase[req.params.code];
  if (revealed) res.redirect(revealed);
  else res.status(404).send("Not Found");
});

// Use Render's port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
