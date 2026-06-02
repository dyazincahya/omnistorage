# <i class="ri-download-cloud-2-line"></i> Instalasi & Dependensi

Mulai menggunakan `OmniStorage` di proyek Anda.

## <i class="ri-terminal-box-line"></i> Instalasi

Gunakan npm untuk menginstal library:

```bash
npm install @x-labs-myid/omnistorage
```

## <i class="ri-links-line"></i> Dependensi

Library ini dibangun di atas beberapa library hebat lainnya untuk mendukung berbagai engine penyimpanan:

| Library                   | Kegunaan                                              |
| :------------------------ | :---------------------------------------------------- |
| `localStorage`            | Penyimpanan bawaan browser untuk data persisten.      |
| `sessionStorage`          | Penyimpanan bawaan browser untuk data sesi saja.      |
| `dexie` & `idb`           | Menjalankan engine IndexedDB di browser.              |
| `cacheable`               | Engine Memory yang cepat dengan fitur caching.        |
| `better-sqlite3`          | Engine SQLite untuk lingkungan Node.js.               |
| `@sqlite.org/sqlite-wasm` | Engine SQLite untuk lingkungan Browser (WASM).        |

## <i class="ri-shield-check-line"></i> Kompatibilitas

- <i class="ri-chrome-line"></i> **Browser**: Chrome 11+, Firefox 4+, Safari 11+, Edge 12+.
- <i class="ri-nodejs-line"></i> **Node.js**: v14.0.0 atau yang lebih baru.
