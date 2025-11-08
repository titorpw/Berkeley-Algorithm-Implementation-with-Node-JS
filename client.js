const net = require("net");

const SERVER_HOST = "localhost"; // alamat server
const SERVER_PORT = 8001; // port TCP dari server.js

// Membuat koneksi ke server
const client = new net.Socket();

client.connect(SERVER_PORT, SERVER_HOST, () => {
  console.log(`Terhubung ke server di ${SERVER_HOST}:${SERVER_PORT}`);
});

client.on("data", (data) => {
  const message = data.toString().trim();

  if (message === "REQ_TIME") {
    // Jika server meminta waktu lokal
    const localTime = Date.now(); // waktu lokal (Unix time ms)
    console.log(`[CLIENT] Server meminta waktu, mengirim: ${localTime}`);
    client.write(localTime.toString());
  } else {
    // Jika server mengirim offset sinkronisasi
    const offset = parseFloat(message);
    const adjustedTime = Date.now() + offset;

    console.log(`[CLIENT] Offset diterima: ${offset} ms`);
    console.log(`[CLIENT] Waktu lokal sebelum: ${Date.now()}`);
    console.log(`[CLIENT] Waktu setelah disinkronisasi: ${adjustedTime}\n`);
  }
});

// Event jika koneksi ditutup
client.on("close", () => {
  console.log("Koneksi ke server ditutup");
});

// Event jika terjadi error
client.on("error", (err) => {
  console.error("Terjadi kesalahan:", err.message);
});
