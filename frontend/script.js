// script.js

// Shorten URL & generate QR code
async function shorten() {
  const input = document.getElementById("urlInput").value.trim();
  if (!input) return alert("Please enter a URL");

  // Optional: frontend URL validation
  const urlPattern = /^https?:\/\/.+\..+/;
  if (!urlPattern.test(input)) return alert("Please enter a valid URL starting with http:// or https://");

  const API_URL = "https://link-shortern.onrender.com"; // Your deployed Render backend URL

  const downloadBtn = document.getElementById("downloadBtn");
  const qrImg = document.getElementById("qrImage");
  qrImg.style.display = "none"; // hide previous QR
  downloadBtn.disabled = true;   // disable download until new QR is ready

  try {
    const res = await fetch(`${API_URL}/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ longUrl: input }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to shorten URL");
    }

    const data = await res.json();

    // Display shortened link
    document.getElementById("result").innerHTML =
      `<a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a>`;

    // Display QR code
    qrImg.src = data.qrCode;
    qrImg.style.display = "block";
    downloadBtn.disabled = false;

  } catch (err) {
    console.error(err);
    alert(err.message || "Something went wrong. Please try again.");
    downloadBtn.disabled = true;
  }
}

// Download QR code as PNG
function downloadQR() {
  const img = document.getElementById("qrImage");
  if (!img.src) return alert("No QR code to download!");

  const a = document.createElement("a");
  a.href = img.src;
  a.download = "qr-code.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Optional: add event listener for form submission
document.getElementById("shortenForm")?.addEventListener("submit", (e) => {
  e.preventDefault(); // prevent page reload
  shorten();
});
