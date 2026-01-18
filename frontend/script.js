async function shorten() {
  const input = document.getElementById("urlInput").value.trim();
  if (!input) return alert("Please enter a URL");

  // ✅ Your Render backend URL
  const API_URL = "https://link-shortern.onrender.com"; // <-- Replace with your Render URL

  try {
    const res = await fetch(`${API_URL}/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ longUrl: input }),
    });

    if (!res.ok) throw new Error("Failed to shorten URL");

    const data = await res.json();

    // Show shortened link
    document.getElementById("result").innerHTML =
      `<a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a>`;

    // Show QR code
    const qrImg = document.getElementById("qrImage");
    qrImg.src = data.qrCode;
    qrImg.style.display = "block";
    document.getElementById("downloadBtn").disabled = false;

  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
  }
}

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
