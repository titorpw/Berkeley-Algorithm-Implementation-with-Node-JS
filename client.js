const net = require("net");
const fs = require("fs");

const SERVER_HOST = "localhost";
const SERVER_PORT = 8001;

// ID klien diambil dari argumen command line
const CLIENT_ID = process.argv[2] ? process.argv[2] : Math.floor(Math.random() * 100);

// Lokasi penyimpanan hasil sinkronisasi
const LOG_FILE = `sync_client_${CLIENT_ID}.json`;

const client = new net.Socket();

client.connect(SERVER_PORT, SERVER_HOST, () => {
  console.log(`[${CLIENT_ID}] Terhubung ke server di ${SERVER_HOST}:${SERVER_PORT}`);
  console.log(`[${CLIENT_ID}] Waktu lokal awal: ${new Date().toLocaleString()}`);
});

client.on("data", (data) => {
  const message = data.toString().trim();

  if (message === "REQ_TIME") {
    const localTime = Date.now();
    console.log(`[${CLIENT_ID}] Server meminta waktu, mengirim: ${localTime}`);
    client.write(localTime.toString());
  } else {
    const offset = parseFloat(message);
    if (isNaN(offset)) {
      console.log(`[${CLIENT_ID}] Pesan tidak dikenali dari server: ${message}`);
      return;
    }

    const adjustedTime = Date.now() + offset;

    console.log(`[${CLIENT_ID}] Offset diterima: ${offset} ms`);
    console.log(`[${CLIENT_ID}] Waktu sebelum sinkronisasi: ${new Date().toLocaleString()}`);
    console.log(`[${CLIENT_ID}] Waktu setelah sinkronisasi: ${new Date(adjustedTime).toLocaleString()}\n`);

    // Simpan hasil sinkronisasi ke file
    const syncData = {
      client_id: CLIENT_ID,
      local_time_before: new Date().toISOString(),
      offset_ms: offset,
      adjusted_time: new Date(adjustedTime).toISOString(),
      server: SERVER_HOST,
    };

    fs.writeFileSync(LOG_FILE, JSON.stringify(syncData, null, 2));
  }
});

client.on("close", () => {
  console.log(`[${CLIENT_ID}] Koneksi ke server ditutup`);
});

client.on("error", (err) => {
  console.error(`[${CLIENT_ID}] Terjadi kesalahan:`, err.message);
});
