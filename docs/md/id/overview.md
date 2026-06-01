<img src="assets/images/icon.png" class="doc-header-icon" alt="Store Icon">

# <i class="ri-information-line"></i> Gambaran Umum

`OmniStorage` adalah library wrapper penyimpanan data key-value yang universal, ringan, dan _type-safe_ untuk JavaScript dan Node.js.

Library ini dirancang untuk memberikan pengalaman pengembangan yang konsisten di berbagai platform, menangani perbedaan antara penyimpanan browser (seperti `localStorage`, `IndexedDB`, dan `SQLite WASM`) dan penyimpanan server (seperti `SQLite`, `File System`, atau `Memory`).

## <i class="ri-question-line"></i> Mengapa Menggunakan Library Ini?

1.  <i class="ri-global-line"></i> **Universal API**: Gunakan kode yang sama untuk penyimpanan di Browser dan Node.js.
2.  <i class="ri-code-box-line"></i> **ORM-Like Syntax**: Menggunakan istilah yang akrab bagi pengembang seperti `create`, `find`, `update`, dan `save`.
3.  <i class="ri-shield-check-line"></i> **Type Safety**: Validasi tipe data bawaan saat pengambilan data.
4.  <i class="ri-plug-line"></i> **Engine Pluggable**: Pilih engine yang sesuai dengan kebutuhan Anda (Local, Session, Memory, IndexedDB, SQLite Client/Server, File).
5.  <i class="ri-history-line"></i> **Pelacakan Aktivitas**: Logging SQLite bawaan untuk memantau semua operasi penyimpanan untuk debugging dan audit.

---

## <i class="ri-layout-grid-line"></i> Perbandingan Engine Penyimpanan

`OmniStorage` menyatukan berbagai engine. Berikut adalah rincian mendalam tentang bagaimana setiap engine bekerja untuk membantu Anda memilih yang tepat sesuai kebutuhan.

### <i class="ri-window-line"></i> Engine Berbasis Browser

*   **LocalStorage (`local`)**
    *   **Persistensi**: Permanen (sampai dihapus).
    *   **Kapasitas**: Kecil (~5-10MB).
    *   **Logika**: Menggunakan `dbName` sebagai prefix global dan `namespace` sebagai infix.
*   **SessionStorage (`session`)**
    *   **Persistensi**: Hanya sesi tab (hilang saat tab ditutup).
    *   **Kapasitas**: Kecil (~5-10MB).
    *   **Logika**: Menggunakan `dbName` sebagai prefix global dan `namespace` sebagai infix.
*   **IndexedDB (`indexeddb`)**
    *   **Persistensi**: Permanen.
    *   **Kapasitas**: Sangat Besar (GB).
    *   **Logika**: Menggunakan `dbName` sebagai nama database fisik.

### <i class="ri-server-line"></i> Engine Server & Universal

*   **Memory (`memory`)**
    *   **Persistensi**: Volatile (terhapus saat restart/refresh).
    *   **Kapasitas**: Terbatas oleh RAM.
    *   **Logika**: Universal (Browser/Node). Menggunakan `dbName` sebagai prefix.
*   **File System (`file`)**
    *   **Persistensi**: Permanen.
    *   **Kapasitas**: Besar (Tergantung disk).
    *   **Logika**: Khusus Node.js. Menggunakan `dbName` sebagai prefix file/folder.
*   **SQLite (`sqlite-server` / `sqlite-client`)**
    *   **Persistensi**: Permanen.
    *   **Kapasitas**: Besar (Tergantung disk).
    *   **Logika**: Menggunakan `dbName` sebagai file database fisik (`.sqlite`).

---

## <i class="ri-focus-2-line"></i> Konsep Utama

Untuk menjaga konsistensi API di seluruh platform, library menggunakan strategi berikut:

### <i class="ri-database-2-line"></i> Nama Database (`dbName`)

`dbName` adalah identifier utama untuk instance storage Anda.

- **Di Local/Session/Memory/File**: Ia bertindak sebagai **Namespace Global** (Prefix paling depan). Jika `dbName` adalah `app1`, maka key `user` akan disimpan sebagai `app1_user`.
- **Di IndexedDB/SQLite**: Ia bertindak sebagai **Nama Database/File Fisik**. Sistem akan membuat database atau file nyata dengan nama tersebut.

### <i class="ri-node-tree"></i> Namespacing

`namespace` adalah pengelompokan logis di dalam sebuah database.

- **Di Local/Session/Memory/File**: Ia bertindak sebagai **Sub-Prefix**. Jika Anda menggunakan `store.db('app1').namespace('auth')`, maka key `token` akan disimpan sebagai `app1_auth:token`.
- **Di IndexedDB/SQLite**: Karena engine ini sudah terisolasi di tingkat `dbName`, maka `namespace` hanya bertindak sebagai **Key Prefix** di dalam tabel penyimpanan.

> <i class="ri-information-line"></i> **Penting**: Meskipun secara native beberapa engine bersifat synchronous (seperti LocalStorage), library ini membungkus semuanya dalam **Asynchronous API (Promise)** agar cara aksesnya seragam dan tidak memblokir _main thread_.

### <i class="ri-checkbox-circle-line"></i> Respon Standar

Semua operasi mengembalikan objek respon standar untuk penanganan yang konsisten:

```javascript
{
  ok: true,
  data: { ... },
  message: "Success",
  engine: "local",
  timestamp: 123456789
}
```
