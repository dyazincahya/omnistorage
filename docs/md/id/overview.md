<img src="assets/images/icon.png" class="doc-header-icon" alt="Store Icon">

# <i class="ri-information-line"></i> Gambaran Umum

`OmniStorage` adalah library wrapper penyimpanan data key-value yang universal, ringan, dan _type-safe_ untuk JavaScript dan Node.js.

Library ini menyediakan satu API asynchronous yang konsisten untuk menyimpan data di browser, server, dan runtime bersama.

## <i class="ri-external-link-line"></i> Demo & Contoh

- **Demo app:** [omnistorage-example.vercel.app](https://omnistorage-example.vercel.app) _(Vercel)_
- **Source code contoh:** [dyazincahya/omnistorage-example](https://github.com/dyazincahya/omnistorage-example)

## <i class="ri-question-line"></i> Mengapa Menggunakan Library Ini?

1. <i class="ri-global-line"></i> **API Universal**: Gunakan API penyimpanan yang sama di Browser dan Node.js.
2. <i class="ri-code-box-line"></i> **Sintaks ORM-Like**: Gunakan method yang familiar seperti `create`, `find`, `update`, dan `save`.
3. <i class="ri-shield-check-line"></i> **Type Safety**: Validasi tipe data saat mengambil nilai yang tersimpan.
4. <i class="ri-plug-line"></i> **Engine Pluggable**: Ganti backend penyimpanan tanpa mengubah alur aplikasi.
5. <i class="ri-history-line"></i> **Pelacakan Aktivitas**: Pantau operasi penyimpanan untuk debugging dan audit.

---

## <i class="ri-layout-grid-line"></i> Engine yang Tersedia

`OmniStorage` saat ini mendukung engine berikut:

- **Hybrid / Universal**: `memory`
- **Client-side / Browser**: `local`, `session`, `cookie`, `cache`, `indexeddb`, `sqlite-client`
- **Server-only / Node.js**: `file`, `sqlite-server`

Untuk detail perilaku, use case, dan kebutuhan setiap engine, lihat halaman **Engine Penyimpanan**.

---

## <i class="ri-checkbox-circle-line"></i> Respon Standar

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
