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

## <i class="ri-focus-2-line"></i> Konsep Utama

### <i class="ri-database-2-line"></i> Nama Database (`dbName`)

Identifier utama untuk instance storage Anda. Di engine berbasis file/key-prefix, ini bertindak sebagai prefix global. Di IndexedDB, ini menjadi nama database fisik.

### <i class="ri-node-tree"></i> Namespacing

Memungkinkan Anda membagi penyimpanan menjadi bagian-bagian logis yang terisolasi, menghindari konflik kunci antar modul aplikasi.

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
