# <i class="ri-cpu-line"></i> Engine Penyimpanan

`OmniStorage` mendukung berbagai engine penyimpanan yang dapat disesuaikan dengan kebutuhan aplikasi Anda. Setiap engine dioptimalkan untuk kasus penggunaan dan lingkungan tertentu.

## <i class="ri-list-settings-line"></i> Daftar Engine yang Tersedia

### <i class="ri-database-line"></i> LocalStorage
Penyimpanan web standar yang memungkinkan situs dan aplikasi JavaScript untuk menyimpan dan mengakses data langsung di browser tanpa batas waktu kedaluwarsa.

| Properti | Nilai |
| :--- | :--- |
| **Key Engine** | `local` |
| **Tipe** | Client (Browser) |
| **Dependensi** | Native Browser API |

**Cocok untuk:** Preferensi pengguna, pengaturan tema (mode gelap/terang), dan status login persisten.

---

### <i class="ri-history-line"></i> SessionStorage
Mirip dengan LocalStorage, tetapi data hanya disimpan untuk satu sesi. Data akan dihapus ketika pengguna menutup tab browser tertentu tersebut.

| Properti | Nilai |
| :--- | :--- |
| **Key Engine** | `session` |
| **Tipe** | Client (Browser) |
| **Dependensi** | Native Browser API |

**Cocok untuk:** Formulir multi-step, data sesi sementara, dan manajemen status spesifik tab.

---

### <i class="ri-hard-drive-2-line"></i> IndexedDB
API tingkat rendah untuk penyimpanan data terstruktur dalam jumlah besar di sisi klien, termasuk file/blob.

| Properti | Nilai |
| :--- | :--- |
| **Key Engine** | `indexeddb` |
| **Tipe** | Client (Browser) |
| **Dependensi** | `dexie`, `idb` |

**Cocok untuk:** Dataset besar, aplikasi offline-first, dan penyimpanan objek kompleks.

---

### <i class="ri-temp-hot-line"></i> In-Memory
Penyimpanan berkinerja tinggi yang berada di memori aplikasi (RAM). Engine ini sangat cepat tetapi bersifat volatile.

| Properti | Nilai |
| :--- | :--- |
| **Key Engine** | `memory` |
| **Tipe** | Client & Server |
| **Dependensi** | `cacheable` |

**Cocok untuk:** Caching data, pencarian cepat, dan status sementara sisi server.

---

### <i class="ri-folder-open-line"></i> File System
Engine sisi server yang menyimpan data langsung di disk lokal menggunakan kemampuan sistem file Node.js.

| Properti | Nilai |
| :--- | :--- |
| **Key Engine** | `file` |
| **Tipe** | Server (Node.js) |
| **Dependensi** | Node.js `fs` |

**Cocok untuk:** Persistensi data sisi server dan database berbasis file sederhana.

---

### <i class="ri-server-line"></i> SQLite (Node.js)
Engine database SQL fitur lengkap untuk lingkungan Node.js.

| Properti | Nilai |
| :--- | :--- |
| **Key Engine** | `sqlite-server` |
| **Tipe** | Server (Node.js) |
| **Dependensi** | `better-sqlite3` |

**Cocok untuk:** Data relasional kompleks dan pemrosesan sisi server yang berat.

---

### <i class="ri-globe-line"></i> SQLite (WASM)
Versi WebAssembly dari SQLite yang berjalan langsung di browser.

| Properti | Nilai |
| :--- | :--- |
| **Key Engine** | `sqlite-client` |
| **Tipe** | Client (Browser) |
| **Dependensi** | `@sqlite.org/sqlite-wasm` |

**Cocok untuk:** Data relasional sisi klien dan penyimpanan web berkinerja tinggi.

---

## <i class="ri-compass-3-line"></i> Cara Memilih Engine

Secara default, library akan mendeteksi lingkungan Anda:
- <i class="ri-chrome-line"></i> **Browser**: Menggunakan `local` (LocalStorage).
- <i class="ri-nodejs-line"></i> **Node.js**: Menggunakan `memory`.

Anda dapat mengganti engine secara global atau per operasi:

```javascript
// Ganti secara global
store.use("indexeddb");

// Per operasi (Chaining)
await store.config("session").save("temp_key", "value");
```
