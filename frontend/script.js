async function shorten() {
  const longUrl = document.getElementById("urlInput").value;
  const res = await fetch("http://localhost:5000/shorten", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ longUrl })
  });
  const data = await res.json();
  document.getElementById("result").innerHTML = `<a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a>`;
  document.getElementById("qrImage").src = data.qrCode;
}
function downloadQR(){
  const img = document.getElementById("qrImage");
  const a = document.createElement("a");
  a.href = img.src;
  a.download = "qr-code.png";
  a.click();
}
