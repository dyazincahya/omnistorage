# OmniStorage

A lightweight, type-safe, and universal storage layer for JavaScript. Store anything, anywhere, with a single unified API.

## Apa itu `OmniStorage`?

Library ini adalah wrapper abstrak untuk penyimpanan data key-value yang dirancang untuk bekerja secara konsisten baik di lingkungan **Browser** maupun **Node.js**.

Secara default, di Browser ia akan menggunakan `localStorage`, dan di Node.js (atau jika `localStorage` tidak tersedia) ia akan beralih menggunakan **In-Memory Storage**.

## Masalah yang Dipecahkan

1. **Inkonsistensi Platform**: Pengembang seringkali harus menulis logika berbeda untuk menyimpan data di Browser (`localStorage`) dan Node.js (variabel global/file). Library ini menyatukan API tersebut.
2. **Data Integrity**: Menyediakan mekanisme validasi (validator) saat mengambil data untuk memastikan data yang didapat sesuai dengan format yang diharapkan.
3. **Namespace Collision**: Menghindari konflik kunci (key) di `localStorage` dengan fitur namespacing yang mudah.
4. **Silent Failures**: Menangani `JSON.parse` error atau kuota storage yang penuh secara anggun tanpa menghentikan aplikasi.

## Fitur Utama

- **Universal**: Berjalan di mana saja (Browser, Node.js, Workers).
- **Type-Safeish**: Dilengkapi dengan fungsi validator opsional.
- **Namespacing**: Kelola data dalam grup yang terisolasi.
- **Capacity Validation**: Proteksi agar penyimpanan tidak melebihi limit.
- **Data Filtering**: Hook untuk menyaring data sebelum disimpan/diambil.
- **Lightweight**: Tanpa dependensi eksternal yang besar.

## Pemetaan & Penyamaan Persepsi Storage

Library ini menyatukan berbagai engine storage dengan karakteristik yang berbeda. Berikut adalah tabel perbandingan lengkap untuk menyamakan persepsi:

| Karakteristik                | LocalStorage (`local`)          | SessionStorage (`session`)      | IndexedDB (`indexeddb`)                 | Memory (`memory`)                         | File System (`file`)            |
| :--------------------------- | :------------------------------ | :------------------------------ | :-------------------------------------- | :---------------------------------------- | :------------------------------ | -------------------------------------- |
| **Platform**                 | Browser                         | Browser                         | Browser                                 | Browser & Node.js                         | Node.js                         | Browser (WASM) & Node.js               |
| **Persistensi**              | **Permanent**                   | **Tab Session**                 | **Permanent**                           | **Volatile**                              | **Permanent**                   | **Permanent**                          |
| **Implementasi `dbName`**    | **Key Prefix**: `dbName_...`    | **Key Prefix**: `dbName_...`    | **Database Name**: Fisik di Disk        | **Key Prefix**: `dbName_...`              | **Key Prefix**: `dbName_...`    | **SQLite File**: `dbName.sqlite`       |
| **Implementasi `namespace`** | **Key In-fix**: `dbName_ns:...` | **Key In-fix**: `dbName_ns:...` | **Key Prefix**: `ns:...` di tabel `kv`  | **Key In-fix**: `dbName_ns:...`           | **Key In-fix**: `dbName_ns:...` | **Key Prefix**: `ns:...` di tabel `kv` |
| **Kapasitas**                | Kecil (~5-10MB)                 | Kecil (~5-10MB)                 | **Sangat Besar** (GB)                   | Terbatas (RAM)                            | Besar (Tergantung disk)         | Besar (Tergantung disk)                |
| **Tipe Data**                | JSON String                     | JSON String                     | Native Objects (Hybrid `idb` & `Dexie`) | Native Reference (Powered by `cacheable`) | JSON String                     | JSON String (SQLite Rows)              |

### Penjelasan Detail Konsep

Untuk menjaga konsistensi API di seluruh platform, library menggunakan strategi berikut:

#### 1. Database Name (`dbName`)

`dbName` adalah identifier utama instance storage Anda.

- **Di Local/Session/Memory/File**: Ia bertindak sebagai **Namespace Global** (Prefix paling depan). Jika `dbName` adalah `app1`, maka key `user` akan disimpan sebagai `app1_user`.
- **Di IndexedDB**: Ia bertindak sebagai **Nama Database Fisik**. Browser akan membuat database nyata dengan nama tersebut.

#### 2. Namespace

`namespace` adalah pengelompokan logis di dalam sebuah database.

- **Di Local/Session/Memory/File**: Ia bertindak sebagai **Sub-Prefix**. Jika Anda menggunakan `store.db('app1').namespace('auth')`, maka key `token` akan disimpan sebagai `app1_auth:token`.
- **Di IndexedDB**: Karena IndexedDB sudah terisolasi di tingkat `dbName`, maka `namespace` hanya bertindak sebagai **Key Prefix** di dalam tabel `kv`.

> **Penting**: Meskipun secara native beberapa engine bersifat synchronous (seperti LocalStorage), library ini membungkus semuanya dalam **Asynchronous API (Promise)** agar cara aksesnya seragam dan tidak memblokir _main thread_.

## Instalasi

```bash
npm install omnistorage
```

## Dokumentasi Lengkap

Untuk informasi lebih detail mengenai penggunaan, API, dan contoh kasus, silakan kunjungi:
[https://github.com/kang-cahya/omnistorage](https://github.com/kang-cahya/omnistorage)

## Standardized Output

Semua fungsi di library ini mengembalikan format objek yang seragam (Standard Response), sehingga Anda bisa menangani hasil operasi dengan cara yang konsisten:

```javascript
{
  ok: true,           // Boolean: true jika berhasil, false jika gagal
  data: { ... },      // Any: Data hasil query atau data yang baru disimpan
  message: "Success", // String: Pesan status atau detail error
  engine: "local",    // String: Engine yang digunakan
  timestamp: 1234567  // Number: Waktu eksekusi
}
```

### Contoh Penanganan Output:

```javascript
const res = await User.find("1");

if (res.ok) {
  console.log("Data ditemukan:", res.data);
} else {
  console.error("Gagal:", res.message);
}
```

## API ORM-Like

Library ini menggunakan standarisasi istilah ORM (seperti Sequelize, Prisma, atau Mongoose) agar lebih umum dan mudah dipahami:

| Method                 | Padanan SQL / Deskripsi    | Perilaku                                      |
| :--------------------- | :------------------------- | :-------------------------------------------- |
| `.create(key, val)`    | `INSERT INTO`              | **Strict**: Gagal jika key sudah ada.         |
| `.update(key, val)`    | `UPDATE`                   | **Strict**: Gagal jika key belum ada.         |
| `.save(key, val)`      | `UPSERT`                   | **Flexible**: Simpan atau Update data.        |
| `.find(key)`           | `SELECT ... WHERE key = ?` | Mengambil satu data berdasarkan key.          |
| `.findOne(key)`        | `SELECT ... WHERE key = ?` | Alias untuk `.find()`.                        |
| `.findAll()`           | `SELECT *`                 | Mengambil semua data dalam namespace.         |
| `.findMany([keys])`    | `SELECT IN (...)`          | Mengambil banyak data sekaligus.              |
| `.saveMany(items)`     | `UPSERT MANY`              | Menyimpan banyak data sekaligus.              |
| `.destroy(key)`        | `DELETE FROM`              | Menghapus satu data.                          |
| `.destroyMany([keys])` | `DELETE IN (...)`          | Menghapus banyak data sekaligus.              |
| `.truncate()`          | `TRUNCATE TABLE`           | Menghapus semua data dalam namespace.         |
| `.describe(key)`       | `SHOW INFO`                | Mendapatkan metadata (size, engine).          |
| `.watch(key, cb)`      | `LISTEN`                   | Memantau perubahan pada key tertentu.         |
| `.on(event, cb)`       | `TRIGGER`                  | Hook global (onSet, onGet, onDelete, dll).    |
| `.transaction(cb)`     | `BEGIN...COMMIT`           | Eksekusi banyak perintah dalam satu blok.     |
| `.getStatistic(type?)` | `STATS`                    | Mendapatkan statistik satu atau semua engine. |

> **Catatan**: Untuk kemudahan migrasi, alias lama seperti `.get()`, `.set()`, `.insert()`, `.delete()`, dan `.remove()` tetap didukung namun disarankan menggunakan penamaan ORM yang baru.

### Smart Logic Perbedaan Create, Update, & Save

Meskipun storage engine seperti `localStorage` secara native hanya mendukung `.setItem()` (yang akan menimpa data jika key sudah ada), library ini menambahkan lapisan logika ORM:

- **`.create(key, value)`**: Menjamin data baru. Jika Anda mencoba `.create` pada key yang sudah ada, ia akan mengembalikan error.
- **`.update(key, value)`**: Menjamin pembaruan. Jika key tidak ditemukan, ia tidak akan membuat data baru melainkan mengembalikan error.
- **`.save(key, value)`**: Paling umum digunakan. Ia tidak peduli data sudah ada atau belum (Upsert).

### Contoh Penggunaan ORM-Like

```javascript
const User = store.namespace("users");

// 1. Membuat data baru
await User.create("1", { name: "Cahya" });

// 2. Mencari data
const user = await User.find("1");

// 3. Update data yang ada
await User.update("1", { name: "Cahya Updated" });

// 4. Batch Operations
await User.saveMany({
  2: { name: "Budi" },
  3: { name: "Andi" },
});

const allUsers = await User.findAll();
```

## Penggunaan Singkat

### 1. Penggunaan Default (Auto-detect)

Secara otomatis menggunakan `localStorage` di browser atau `memory` di Node.js.

```javascript
import store from "@my-js-lib/store";

store.set("user", { name: "Cahya" });
const user = store.get("user");
```

### 2. Penggunaan Spesifik (Practical Chaining)

Jika ingin menggunakan storage tertentu tanpa mengubah setting global.

```javascript
// Gunakan session storage untuk data sementara
store.config("session").set("token", "abc-123");

// Gunakan memory storage eksplisit
store.config("memory").set("temp", "data");
```

### 3. Kustomisasi Nama Database

Secara default, library men-generate 5 karakter acak (misal: `yqwer`). Anda bisa menentukan nama sendiri agar lebih deskriptif.

```javascript
store.db("my_app").set("version", "1.0.0");
// Key di localStorage: 'my_app_version'
// Nama DB di IndexedDB: 'my_app'
```

### 4. Mengubah Default Global

```javascript
store.use("session");
store.set("key", "value"); // Sekarang tersimpan di sessionStorage secara default
```

### 4. Namespacing

```javascript
const appStore = store.config("local").namespace("app");
appStore.set("theme", "dark"); // Tersimpan di localStorage sebagai 'app:theme'
```

### 5. Type Checking (Powered by `is`)

Anda bisa memastikan tipe data yang diambil sesuai dengan harapan (string, number, array, object, dll).

```javascript
await store.set("count", 10);
const count = await store.get("count", { type: "number" });
```

### 6. IndexedDB (Powered by `dexie` & `idb`)

Untuk menyimpan data dalam jumlah besar di browser dengan performa tinggi.

```javascript
// Gunakan engine indexeddb
const db = store.config("indexeddb");

await db.set("large_data", { items: [1, 2, 3] });
const data = await db.get("large_data");
```

### 7. Memory Storage (Powered by `cacheable`)

Engine ini sangat cepat karena menyimpan data langsung di RAM. Sangat cocok untuk Node.js atau data sementara di browser yang tidak perlu persisten setelah page refresh.

```javascript
// Gunakan engine memory
const mem = store.config("memory");
await mem.set("temp", "value");
```

> **Catatan**: Sejak versi 1.1.0, semua API `store` bersifat **Asynchronous** (mengembalikan Promise) untuk mendukung IndexedDB dan engine masa depan lainnya secara konsisten.

### 8. Hooks & Watchers (Advanced)

Anda bisa bereaksi terhadap perubahan data, sangat berguna untuk sinkronisasi UI.

```javascript
// Memantau satu key spesifik
const unwatch = store.watch("theme", (newValue, oldValue) => {
  console.log(`Theme berubah dari ${oldValue} ke ${newValue}`);
});

// Hook global untuk semua operasi set
store.on("onSet", (data) => {
  console.log(`Data disimpan di ${data.engine}:`, data.key);
});

// Berhenti memantau
unwatch();
```

### 9. Metadata

Melihat informasi teknis tentang data yang disimpan.

```javascript
const meta = await store.describe("my_key");
console.log(meta.size); // Ukuran dalam bytes
console.log(meta.engine); // Engine yang digunakan (local/memory/dll)
```

### 10. Statistik (Storage Analysis)

Anda bisa memantau penggunaan storage secara mendalam, baik untuk satu engine maupun semuanya.

```javascript
// Statistik semua engine
const allStats = await store.getStatistics();

// Statistik engine spesifik
const localStats = await store.getStatistic("local");
/*
Contoh Respon:
{
  "ok": true,
  "engine": "local",
  "data": {
    "engine": "local",
    "dbName": "my_app",
    "totalKeys": 15,
    "totalSize": 10240,
    "totalSizeFormatted": "10.00 KB"
  }
}
*/
```

### 11. Transaction (Atomic Operations)

...

### 12. SQLite Support (Advanced)

Library ini sekarang mendukung SQLite baik di Client (Browser via WASM) maupun Server (Node.js via better-sqlite3).

```javascript
// Node.js Server
const sqliteServer = store.config("sqlite-server");
await sqliteServer.save("key", { data: "value" });

// Browser Client (WASM)
const sqliteClient = store.config("sqlite-client");
await sqliteClient.save("key", { data: "value" });
```

> **Catatan**: `sqlite-client` menggunakan OPFS (_Origin Private File System_) jika tersedia di browser untuk persistensi yang lebih cepat dan aman.

## Penanganan Error & Limitasi

### 1. Serialisasi JSON

Semua data (kecuali di IndexedDB) disimpan dalam format string JSON.

- **Limitasi**: Objek seperti `Date` akan berubah menjadi string ISO, `Function` akan hilang, dan struktur data sirkular akan menyebabkan error pada `.set()`.
- **Saran**: Pastikan data yang disimpan adalah POJO (_Plain Old JavaScript Object_).

### 2. Kapasitas Penyimpanan

- **LocalStorage/SessionStorage**: Terbatas hingga ~5-10MB per domain. Jika penuh, library akan menangkap `QuotaExceededError` dan mencatatnya di console.
- **IndexedDB**: Mendukung data dalam jumlah sangat besar (hingga 80% dari sisa ruang disk).
- **File System**: Tergantung sisa ruang disk di server.

### 3. Penanganan Error

Library dirancang untuk tidak menghentikan aplikasi (_non-blocking_). Jika terjadi error pada I/O (misal: file tidak bisa ditulis), library akan mencetak pesan error ke `console.error` dan mengembalikan `defaultValue` (jika pada operasi `.get()`).

---

## Browser & Node.js Support

- **Browser**: Chrome 11+, Firefox 4+, Safari 11+, Edge 12+. (Mendukung LocalStorage, SessionStorage, dan IndexedDB).
- **Node.js**: v14.0.0 atau yang lebih baru. (Mendukung Memory dan File System).

---

## Lisensi

MIT
