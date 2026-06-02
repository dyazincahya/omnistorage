# <i class="ri-lightbulb-flash-line"></i> Contoh Kasus Lanjutan

Halaman ini menyediakan pola implementasi mendetail untuk kebutuhan aplikasi yang kompleks menggunakan `OmniStorage`.

## <i class="ri-user-settings-line"></i> 1. Alur Autentikasi Aman
Mengelola sesi pengguna dengan pembersihan otomatis dan penggunaan namespace.

```javascript
import store from "@x-labs-myid/omnistorage";

// Konfigurasi penyimpanan sesi khusus untuk auth
const auth = store.config("session").namespace("v1/auth");

/**
 * Menangani persistensi data setelah login
 */
async function handleLogin(token, userProfile) {
  // Simpan token dan profil secara atomik
  const tokenRes = await auth.save("jwt", token);
  const profileRes = await auth.save("me", {
    nama: "Kang Cahya",
    alamat: "Jawa Barat, Indonesia",
    email: "cahya.dev@random.com"
  });

  if (tokenRes.ok && profileRes.ok) {
    console.log("Sesi dimulai menggunakan engine:", tokenRes.engine);
  }
}

/**
 * Perpindahan tema reaktif berdasarkan preferensi tersimpan
 */
const settings = store.namespace("app/settings");
settings.watch("theme", (themeBaru) => {
  document.documentElement.setAttribute("data-theme", themeBaru);
});
```

---

## <i class="ri-refresh-line"></i> 2. Sinkronisasi Real-time Antar Tab
Sinkronisasi state di beberapa tab browser secara bersamaan menggunakan sistem watcher bawaan.

```javascript
const sharedState = store.namespace("cloud/sync");

// Kode ini berjalan di semua tab yang terbuka
sharedState.watch("aktivitas_terakhir", (data) => {
  console.log("Aktivitas terdeteksi di tab lain:", data.aksi);
  updateUI(data.payload);
});

// Pemicu sinkronisasi dari tab mana pun
async function broadcastAction(namaAksi, data) {
  await sharedState.save("aktivitas_terakhir", {
    aksi: namaAksi,
    payload: data,
    timestamp: Date.now()
  });
}
```

---

## <i class="ri-shopping-cart-2-line"></i> 3. Keranjang Belanja Offline-First
Menggunakan `indexeddb` untuk dataset besar dan persisten yang tetap bekerja tanpa koneksi internet.

```javascript
const cart = store.config("indexeddb").namespace("shop/cart");

async function syncCartWithServer() {
  const itemsRes = await cart.findAll();
  
  if (itemsRes.data.length > 0) {
    const success = await api.post("/sync", itemsRes.data);
    if (success) {
      // Kosongkan keranjang lokal setelah berhasil sinkron ke server
      await cart.truncate();
    }
  }
}

// Tambah item dengan validasi
async function addItem(produk) {
  const current = await cart.find("items", { defaultValue: [] });
  const updated = [...current.data, produk];
  
  const res = await cart.save("items", updated);
  console.log(`Berhasil menyimpan ${updated.length} item ke ${res.engine}`);
}
```

---

## <i class="ri-speed-mini-line"></i> 4. Caching API Performa Tinggi
Mengimplementasikan pola Time-To-Live (TTL) menggunakan engine `memory` untuk respon yang sangat cepat.

```javascript
const cache = store.config("memory").namespace("api/v2");

async function fetchWithCache(endpoint) {
  // 1. Cek memori lokal terlebih dahulu
  const cached = await cache.find(endpoint);
  
  // 2. Kembalikan jika data masih segar (logika kustom)
  if (cached.ok && (Date.now() - cached.timestamp < 60000)) {
    return cached.data;
  }

  // 3. Ambil dari jaringan jika tidak ada di cache
  const response = await fetch(endpoint);
  const freshData = await response.json();

  // 4. Perbarui cache
  await cache.save(endpoint, freshData);
  return freshData;
}
```
