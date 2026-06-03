# <i class="ri-cpu-line"></i> Engine Penyimpanan

`OmniStorage` mendukung beberapa engine penyimpanan yang dapat dipilih berdasarkan runtime, kebutuhan persistensi, ukuran data, dan target deployment. Semua engine menggunakan API async yang sama, sehingga kode aplikasi dapat berpindah backend penyimpanan tanpa mengubah alur operasi.

## <i class="ri-list-settings-line"></i> Daftar Engine yang Tersedia

<h2 id="local"><i class="ri-database-line"></i> LocalStorage</h2>

LocalStorage menggunakan API native browser `window.localStorage`. Data disimpan per origin dan tetap tersedia setelah reload halaman, browser restart, atau tab ditutup sampai data dihapus oleh user, browser, atau aplikasi.

| Properti | Nilai |
| :--- | :--- |
| **Key Engine** | `local` |
| **Tipe** | Client (Browser) |
| **Persistensi** | Persisten sampai dihapus |
| **Limit** | Guard default 5 MB |
| **Dependensi** | [Native Browser API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) |

**Fungsi:** Menyimpan data key-value kecil langsung di browser menggunakan Web Storage berbasis string.

**Umum digunakan untuk:**

- Preferensi pengguna seperti tema, bahasa, dan pengaturan UI.
- State aplikasi kecil yang perlu bertahan setelah reload.
- Feature flag dan konfigurasi ringan sisi client.

**Catatan penting:**

- Secara native LocalStorage bersifat synchronous, tetapi OmniStorage membungkusnya dalam API async agar konsisten.
- Kapasitas terbatas, umumnya sekitar 5–10 MB tergantung browser dan kebijakan quota.
- Data dapat dibaca JavaScript pada origin yang sama, jadi hindari menyimpan secret sensitif.
- Mode private/incognito dapat menghapus atau membatasi data persisten dengan perilaku berbeda.

---

<h2 id="session"><i class="ri-history-line"></i> SessionStorage</h2>

SessionStorage menggunakan API native browser `window.sessionStorage`. Perilakunya mirip LocalStorage, tetapi data hanya berlaku untuk tab/sesi browser saat ini.

| Properti | Nilai |
| :--- | :--- |
| **Key Engine** | `session` |
| **Tipe** | Client (Browser) |
| **Persistensi** | Hanya sesi tab saat ini |
| **Limit** | Guard default 5 MB |
| **Dependensi** | [Native Browser API](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) |

**Fungsi:** Menyimpan data sementara yang seharusnya hilang ketika tab atau sesi browser berakhir.

**Umum digunakan untuk:**

- Progress form multi-step.
- State UI sementara.
- Alur checkout atau sesi yang tidak perlu tersimpan permanen.
- Data spesifik tab yang tidak perlu dibagikan ke tab lain.

**Catatan penting:**

- Data terisolasi per tab, berbeda dari LocalStorage.
- Tidak cocok untuk persistensi jangka panjang.
- Seperti LocalStorage, data dapat dibaca JavaScript pada origin yang sama.

---

<h2 id="cookie"><i class="ri-cookie-line"></i> Cookies</h2>

Cookies menyimpan data key-value kecil melalui interface browser `document.cookie`. Berbeda dari LocalStorage, cookie dapat ikut terkirim otomatis bersama request HTTP yang sesuai, tergantung pengaturan path, domain, SameSite, dan secure.

| Properti | Nilai |
| :--- | :--- |
| **Key Engine** | `cookie` |
| **Tipe** | Client (Browser) |
| **Persistensi** | Session cookie secara default pada engine saat ini |
| **Limit** | Guard default total ~80 KB; 4 KB per item cookie |
| **Dependensi** | [Native Browser API](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) |

**Fungsi:** Menyimpan nilai kecil yang dapat diakses browser sebagai HTTP cookie dengan prefix key standar OmniStorage. Engine saat ini menulis cookie yang bisa diakses browser melalui `document.cookie` dengan default `Path=/` dan `SameSite=Lax`.

**Umum digunakan untuk:**

- Flag locale/bahasa.
- Penanda consent.
- Preferensi ringan yang mungkin perlu diketahui server.
- State kecil untuk aplikasi server-rendered tradisional.

**Catatan penting:**

- Cookie berukuran kecil; batas praktis umum sekitar 4 KB per cookie.
- Engine saat ini belum menyediakan atribut cookie per penulisan, sehingga nilai menjadi session cookie kecuali engine diperluas dengan opsi expiry/max-age.
- JavaScript tidak dapat membaca atau menulis cookie `HttpOnly`.
- Data cookie dapat ikut terkirim pada request HTTP, jadi hindari menyimpan data besar atau nilai sensitif.
- Untuk autentikasi sensitif, lebih aman memakai cookie secure yang dikelola server daripada nilai yang dikelola client.

---

<h2 id="cache"><i class="ri-archive-line"></i> Cache Storage</h2>

Cache Storage menggunakan API browser `caches`. API ini umum digunakan oleh Progressive Web App dan Service Worker untuk menyimpan pasangan request/response agar aplikasi bisa bekerja offline dan mengakses data berulang dengan cepat.

| Properti | Nilai |
| :--- | :--- |
| **Key Engine** | `cache` |
| **Tipe** | Client (Browser) |
| **Persistensi** | Cache persisten best-effort, mengikuti quota/eviction browser |
| **Limit** | Soft guard 50 MB |
| **Dependensi** | [Native Browser API](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage) |

**Fungsi:** Menyimpan nilai OmniStorage sebagai response JSON di balik key request internal yang dibuat otomatis.

**Umum digunakan untuk:**

- Data cache yang ramah offline.
- Snapshot response API.
- Data PWA yang perlu tersedia tanpa koneksi jaringan.
- Cache sisi browser yang lebih besar dibanding cookies atau Web Storage.

**Catatan penting:**

- Cache Storage dirancang untuk caching request/response, bukan query relasional.
- Umumnya tersedia di browser modern dan secure context; dukungan dapat berbeda di browser lama atau lingkungan terbatas.
- Quota dan kebijakan eviction dapat berbeda antar browser, sehingga data cache sebaiknya dianggap bisa dibangun ulang.
- Paling cocok untuk data cache yang bisa di-refresh atau dibangun ulang.

---

<h2 id="indexeddb"><i class="ri-hard-drive-2-line"></i> IndexedDB</h2>

IndexedDB adalah API database browser untuk menyimpan data terstruktur. API ini mendukung dataset lebih besar daripada LocalStorage dan dirancang asynchronous agar tidak memblokir main thread.

| Properti | Nilai |
| :--- | :--- |
| **Key Engine** | `indexeddb` |
| **Tipe** | Client (Browser) |
| **Persistensi** | Persisten sampai dihapus atau terkena kebijakan eviction browser |
| **Limit** | Soft guard 500 MB |
| **Dependensi** | [`idb`](https://www.npmjs.com/package/idb) |

**Fungsi:** Menyimpan data terstruktur sisi client ke object store IndexedDB menggunakan key dan value OmniStorage.

**Umum digunakan untuk:**

- Aplikasi offline-first.
- Dataset besar di sisi client.
- Data API cache yang membutuhkan persistensi terstruktur.
- Objek kompleks, dokumen, dan record lokal aplikasi.

**Catatan penting:**

- IndexedDB bersifat asynchronous dan lebih cocok untuk data besar dibanding Web Storage.
- Dukungan browser luas, tetapi perilaku quota dapat berbeda.
- Biasanya pilihan terbaik untuk persistensi serius di browser.

---

<h2 id="memory"><i class="ri-temp-hot-line"></i> In-Memory</h2>

Engine memory menyimpan data di memori runtime JavaScript aktif. Di browser, data hidup dalam konteks halaman saat ini. Di Node.js, data hidup dalam proses yang sedang berjalan.

| Properti | Nilai |
| :--- | :--- |
| **Key Engine** | `memory` |
| **Tipe** | Runtime universal (Browser & Node.js) |
| **Persistensi** | Volatile, hilang saat runtime berakhir |
| **Limit** | Soft guard 50 MB |
| **Dependensi** | [`cacheable`](https://www.npmjs.com/package/cacheable) |

**Fungsi:** Menyediakan penyimpanan sementara yang sangat cepat tanpa menulis ke API browser atau disk.

**Umum digunakan untuk:**

- Runtime caching.
- Test dan demo.
- Data hasil komputasi sementara.
- Cache in-process sisi server.
- Fallback ketika API khusus browser tidak tersedia.

**Catatan penting:**

- Data hilang saat halaman reload atau proses Node.js restart.
- Tidak dibagikan antar tab, worker, atau instance server.
- Cocok untuk kecepatan dan state sementara, bukan penyimpanan durable.

---

<h2 id="file"><i class="ri-folder-open-line"></i> File System</h2>

Engine file menyimpan data ke disk menggunakan kemampuan file system Node.js. Pada implementasi saat ini, setiap `dbName` disimpan sebagai file JSON di dalam direktori `.storage` pada working directory proses.

| Properti | Nilai |
| :--- | :--- |
| **Key Engine** | `file` |
| **Tipe** | Server (Node.js) |
| **Persistensi** | Persisten di disk lokal |
| **Limit** | Soft guard 100 MB |
| **Dependensi** | Node.js [`fs`](https://nodejs.org/api/fs.html) |

**Fungsi:** Menyimpan data key-value ke file JSON di server atau runtime Node.js lokal.

**Umum digunakan untuk:**

- Persistensi sederhana sisi server.
- Tool development lokal.
- Utilitas CLI.
- Penyimpanan ringan tanpa menjalankan database server.

**Catatan penting:**

- Engine ini tidak tersedia di browser normal.
- Permission disk, current working directory, dan perilaku filesystem deployment perlu diperhatikan.
- Penulisan akan memperbarui file JSON, sehingga paling cocok untuk persistensi sederhana, bukan workload concurrency tinggi.
- Untuk concurrency tinggi atau data relasional, SQLite bisa lebih cocok.

---

<h2 id="sqlite-server"><i class="ri-server-line"></i> SQLite (Node.js)</h2>

SQLite Server menggunakan SQLite melalui Node.js. Di OmniStorage, engine ini menyediakan penyimpanan key-value berbasis SQLite yang durable untuk aplikasi server-side.

| Properti | Nilai |
| :--- | :--- |
| **Key Engine** | `sqlite-server` |
| **Tipe** | Server (Node.js) |
| **Persistensi** | File database SQLite persisten |
| **Limit** | Soft guard 1 GB |
| **Dependensi** | [`better-sqlite3`](https://www.npmjs.com/package/better-sqlite3) |

**Fungsi:** Menyimpan data key-value OmniStorage ke file database SQLite lokal di server.

**Umum digunakan untuk:**

- Penyimpanan key-value durable sisi server.
- Aplikasi server local-first.
- Aplikasi kecil sampai menengah yang membutuhkan reliabilitas SQLite tanpa database server terpisah.
- Persistensi untuk audit atau logging.

**Catatan penting:**

- Membutuhkan lingkungan Node.js dan dukungan dependency SQLite native.
- Cocok untuk database lokal yang durable.
- OmniStorage mengekspos engine ini sebagai key-value engine, bukan API query SQL penuh.
- Untuk deployment multi-server terdistribusi, pertimbangkan bagaimana file SQLite dibagikan atau direplikasi.

---

<h2 id="sqlite-client"><i class="ri-globe-line"></i> SQLite (WASM)</h2>

SQLite Client menggunakan SQLite yang dikompilasi ke WebAssembly, sehingga perilaku SQLite dapat berjalan langsung di browser.

| Properti | Nilai |
| :--- | :--- |
| **Key Engine** | `sqlite-client` |
| **Tipe** | Client (Browser) |
| **Persistensi** | Persisten dengan OPFS jika tersedia; selain itu tergantung browser/runtime |
| **Limit** | Soft guard 256 MB |
| **Dependensi** | [`@sqlite.org/sqlite-wasm`](https://www.npmjs.com/package/@sqlite.org/sqlite-wasm) |

**Fungsi:** Menyediakan engine key-value berbasis SQLite di browser melalui WebAssembly. Implementasi saat ini menggunakan OPFS jika didukung dan fallback ke mode database SQLite WASM standar jika tidak tersedia.

**Umum digunakan untuk:**

- Persistensi data client-side tingkat lanjut.
- Aplikasi browser yang diuntungkan oleh pola penyimpanan mirip SQL.
- Aplikasi offline dengan kebutuhan data terstruktur.
- Eksperimen atau aplikasi yang membutuhkan perilaku SQLite di browser.

**Catatan penting:**

- Dukungan browser dan perilaku persistensi dapat bergantung pada WebAssembly, OPFS, dan kemampuan origin storage.
- Lebih berat dibanding LocalStorage atau IndexedDB.
- OmniStorage mengekspos engine ini sebagai key-value engine, bukan API query SQL penuh.
- Gunakan ketika penyimpanan browser berbasis SQLite cukup bermanfaat untuk menjustifikasi kompleksitas tambahan.

---
