# <i class="ri-history-line"></i> Log & Statistik

Pantau aktivitas penyimpanan dan ukur penggunaan data di setiap engine. Halaman ini mengikuti gaya **API Reference**: setiap method dijelaskan dengan signature, parameter, contoh penggunaan, dan format response.

---

## <i class="ri-history-line"></i> Log Aktivitas (Logging)

`OmniStorage` mencatat aktivitas tulis/hapus yang dilakukan melalui API storage, seperti `create`, `save`, `update`, `destroy`, dan `truncate`. Log disimpan di SQLite pada table `omnistorage_logs` secara default.

Log berguna untuk audit sederhana, debugging, atau melihat riwayat operasi saat aplikasi berjalan.

### Perilaku Default

Secara default, konfigurasi logging memakai engine `auto`:

1. Runtime Node.js/server memakai `sqlite-server` (`better-sqlite3`).
2. Runtime browser/client memakai `sqlite-client` (`@sqlite.org/sqlite-wasm`).
3. Project yang berisi client dan server tetap memakai `sqlite-client` pada bundle browser, sehingga build Vite/client tidak menarik `better-sqlite3` atau modul Node.js.
4. Pada runtime test, mode `auto` di-resolve ke `sqlite-server`.

> Logging tidak menggantikan sistem audit production yang lengkap. Untuk kebutuhan compliance, backup, retensi, atau enkripsi log, tetap tambahkan mekanisme server-side yang sesuai.

---

## <i class="ri-settings-4-line"></i> Konfigurasi Log

<h3 id="configure-logs"><i class="ri-tools-line"></i> <code>.configureLogs(config)</code></h3>

Mengatur mode SQLite yang dipakai untuk menyimpan log aktivitas. Logs selalu memakai SQLite; config ini hanya memilih `mode`.

```typescript
store.configureLogs(
  config?: "auto" | "client" | "server" | {
    mode?: "auto" | "client" | "server";
  }
);
```

Method ini mengembalikan instance `store`, sehingga bisa dipakai dalam chain.

### Config

| Opsi   | Default | Deskripsi                        |
| :----- | :------ | :------------------------------- |
| `mode` | `auto`  | `auto`, `client`, atau `server`. |

Mode `auto` otomatis memilih `sqlite-server` di Node.js/server dan `sqlite-client` di browser/client.

Jika `mode` tidak valid, OmniStorage akan throw error:

```text
Invalid log mode "...". Use "auto", "client", or "server".
```

### Contoh

```javascript
import store from "@x-labs-myid/omnistorage";

// Perilaku default: auto-detect runtime
store.configureLogs("auto");

// Paksa logging SQLite WASM di browser
store.configureLogs("client");

// Paksa logging SQLite Node.js
store.configureLogs("server");

// Config object
store.configureLogs({ mode: "auto" });
```

### Catatan Runtime

- `sqlite-server` hanya tersedia di runtime Node.js.
- `sqlite-client` memakai SQLite WASM dan cocok untuk browser.
- Jika inisialisasi SQLite gagal, logger akan menulis error ke console dan operasi log tidak disimpan.
- Mengubah konfigurasi akan melakukan reinitialize koneksi logger.

---

<h3 id="get-log-config"><i class="ri-file-settings-line"></i> <code>.getLogConfig()</code></h3>

Mengambil konfigurasi logging aktif.

```typescript
store.getLogConfig(): {
  mode: "auto" | "client" | "server";
  databaseExists: boolean;
}
```

### Contoh

```javascript
const config = store.getLogConfig();
console.log(config);
```

### Response

```javascript
{
  mode: "auto",
  databaseExists: true
}
```

| Field            | Deskripsi                                                                               |
| :--------------- | :-------------------------------------------------------------------------------------- |
| `mode`           | Mode log: `auto`, `client`, atau `server`.                                              |
| `databaseExists` | Status read-only hasil pengecekan apakah database log sudah ada sebelum koneksi dibuka. |

---

## <i class="ri-database-2-line"></i> Mengambil Data Log

<h3 id="get-activity-logs"><i class="ri-list-check-2"></i> <code>.getActivityLogs(limit)</code></h3>

Mengambil riwayat aktivitas storage, diurutkan dari log terbaru ke terlama.

```typescript
await store.getActivityLogs(limit?: number);
```

### Parameter

| Parameter | Wajib | Default | Deskripsi                                  |
| :-------- | :---: | :------ | :----------------------------------------- |
| `limit`   | Tidak | `100`   | Jumlah maksimal row log yang dikembalikan. |

Response menyertakan `source` untuk menunjukkan sumber log: `server` untuk SQLite Node.js atau `client` untuk SQLite WASM browser.

### Contoh

:::code-tabs
@tab Basic API

```javascript
import store from "@x-labs-myid/omnistorage";

await store.engine("memory").save("user:101", {
  name: "Kang Cahya",
  role: "developer",
});

const res = await store.getActivityLogs(10);
console.log(res.data);
```

@tab JSON Command

```javascript
// Log dibuat oleh operasi command yang melakukan write/delete.
await store.command({
  engine: "memory",
  operation: "save",
  key: "user:101",
  value: {
    name: "Kang Cahya",
    role: "developer",
  },
});

// Pengambilan log tetap memakai API logging langsung.
const res = await store.getActivityLogs(10);
```

:::

### Response

```javascript
{
  ok: true,
  message: "Activity logs retrieved",
  data: [
    {
      id: 42,
      timestamp: "2024-06-01 10:00:00",
      operation: "upsert",
      engine: "memory",
      key: "user:101",
      namespace: "default",
      status: "success",
      message: "",
      source: "server"
    },
    {
      id: 41,
      timestamp: "2024-06-01 09:55:21",
      operation: "insert",
      engine: "local",
      key: "user:101",
      namespace: "default",
      status: "error",
      message: "Create failed: Key \"user:101\" already exists.",
      source: "server"
    }
  ],
  timestamp: 1717200010000,
  source: "server"
}
```

### Operasi yang Dicatat

Saat ini OmniStorage mencatat operasi utama berikut:

| Operasi API                     | Nilai `operation` | Kapan Dicatat                         |
| :------------------------------ | :---------------- | :------------------------------------ |
| `.create()` / `.insert()`       | `insert`          | Berhasil atau gagal validasi key.     |
| `.save()` / `.set()`            | `upsert`          | Berhasil atau gagal validasi value.   |
| `.update()`                     | `update`          | Berhasil atau key tidak ditemukan.    |
| `.destroy()` / `.delete()`      | `destroy`         | Setelah key dihapus.                  |
| `.truncate()` / `.clear()`      | `truncate`        | Setelah storage dikosongkan.          |
| `.command()` untuk write/delete | Sesuai operasi    | Karena command memanggil API terkait. |

> Operasi baca seperti `.find()` dan `.findAll()` tidak menghasilkan activity log.

---

<h3 id="get-logs"><i class="ri-file-list-3-line"></i> <code>.getLogs(limit)</code></h3>

Alias untuk `.getActivityLogs(limit)`.

```javascript
const logs = await store.getLogs(25);
```

Response sama persis dengan `.getActivityLogs()`.

---

<h3 id="clear-activity-logs"><i class="ri-delete-bin-6-line"></i> <code>.clearActivityLogs()</code></h3>

Menghapus semua log yang tercatat dari table log aktif.

```typescript
await store.clearActivityLogs();
```

### Contoh

```javascript
const res = await store.clearActivityLogs();
console.log(res.ok); // true
```

### Response

```javascript
{
  ok: true,
  message: "Activity logs cleared",
  timestamp: 1717200010000
}
```

> Operasi ini permanen untuk table log yang sedang dikonfigurasi. Jika UI Anda menyediakan fitur ini, sebaiknya tampilkan konfirmasi user terlebih dahulu.

---

## <i class="ri-bar-chart-box-line"></i> Statistik Penyimpanan

Statistik menghitung jumlah key dan estimasi ukuran data untuk engine storage. Perhitungan dilakukan berdasarkan key yang memakai prefix database aktif (`dbName_`).

Field statistik standar:

| Field                | Tipe     | Deskripsi                                           |
| :------------------- | :------- | :-------------------------------------------------- |
| `engine`             | `string` | Nama engine storage.                                |
| `dbName`             | `string` | Nama database/prefix aktif pada engine tersebut.    |
| `totalKeys`          | `number` | Jumlah key yang terdeteksi untuk database aktif.    |
| `totalSize`          | `number` | Estimasi ukuran data dalam byte.                    |
| `totalSizeFormatted` | `string` | Estimasi ukuran dalam KB dengan format dua desimal. |

---

<h3 id="get-statistic"><i class="ri-bar-chart-line"></i> <code>.getStatistic(engineName)</code></h3>

Mengambil statistik untuk satu engine tertentu. Jika `engineName` tidak dikirim, method ini mengambil statistik semua engine.

```typescript
await store.getStatistic(engineName?: string);
```

### Parameter

| Parameter    | Wajib | Deskripsi                                                                |
| :----------- | :---: | :----------------------------------------------------------------------- |
| `engineName` | Tidak | Nama engine, misalnya `local`, `session`, `memory`, `file`, `indexeddb`. |

### Contoh Satu Engine

:::code-tabs
@tab Basic API

```javascript
const localStats = await store.getStatistic("local");
console.log(localStats.data.totalKeys);
```

@tab JSON Command

```javascript
const localStats = await store.command({
  engine: "local",
  operation: "getStatistic",
});
```

:::

### Response Satu Engine

```javascript
{
  ok: true,
  engine: "local",
  data: {
    engine: "local",
    dbName: "MyStoreDB",
    totalKeys: 15,
    totalSize: 2048,
    totalSizeFormatted: "2.00 KB"
  },
  timestamp: 1717200010000
}
```

### Contoh Semua Engine

```javascript
const stats = await store.getStatistic();
```

### Response Semua Engine

```javascript
{
  ok: true,
  data: {
    local: {
      engine: "local",
      dbName: "MyStoreDB",
      totalKeys: 15,
      totalSize: 2048,
      totalSizeFormatted: "2.00 KB"
    },
    memory: {
      engine: "memory",
      dbName: "MyStoreDB",
      totalKeys: 5,
      totalSize: 512,
      totalSizeFormatted: "0.50 KB"
    },
    indexeddb: {
      engine: "indexeddb",
      dbName: "MyStoreDB",
      totalKeys: 120,
      totalSize: 1048576,
      totalSizeFormatted: "1024.00 KB"
    }
  },
  timestamp: 1717200010000
}
```

Jika salah satu engine gagal dihitung saat mengambil semua statistik, field engine tersebut berisi object error:

```javascript
{
  ok: true,
  data: {
    indexeddb: {
      error: "IndexedDB is not available"
    }
  }
}
```

Jika `engineName` dikirim tetapi engine tidak dikenal, method akan throw error:

```text
Engine unknown-engine not found
```

---

<h3 id="get-statistics"><i class="ri-bar-chart-grouped-line"></i> <code>.getStatistics()</code></h3>

Alias untuk mengambil statistik semua engine.

```typescript
await store.getStatistics();
```

### Contoh

:::code-tabs
@tab Basic API

```javascript
const stats = await store.getStatistics();
console.log(stats.data.memory.totalSizeFormatted);
```

@tab JSON Command

```javascript
const stats = await store.command({
  operation: "getStatistics",
});
```

:::

Response sama dengan `.getStatistic()` tanpa parameter.

---

<h3 id="statistics-aliases"><i class="ri-links-line"></i> Alias Statistik</h3>

Alias statistik yang tersedia:

| API                                     | Padanan           | Deskripsi                               |
| :-------------------------------------- | :---------------- | :-------------------------------------- |
| `.getStatistics()`                      | `.getStatistic()` | Mengambil statistik semua engine.       |
| `.command({ operation: "statistics" })` | JSON command      | Mengambil statistik lewat JSON command. |
| `.command({ operation: "stats" })`      | JSON command      | Alias command paling singkat.           |

Contoh:

```javascript
const allStats = await store.getStatistics();

const memoryStats = await store.command({
  engine: "memory",
  operation: "stats",
});
```

---

## <i class="ri-lightbulb-line"></i> Tips Penggunaan

- Panggil `.configureLogs()` di awal aplikasi sebelum operasi storage pertama jika ingin memilih mode log secara eksplisit.
- Gunakan `getLogConfig()` untuk melihat config aktif `mode` dan `databaseExists`.
- Batasi `getActivityLogs(limit)` pada UI agar query log tetap ringan.
- Jalankan `clearActivityLogs()` secara hati-hati karena tidak ada soft delete.
- Statistik adalah estimasi ukuran data, bukan ukuran fisik database/file storage yang presisi.
