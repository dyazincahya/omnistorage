# <i class="ri-download-cloud-2-line"></i> Instalasi & Dependensi

Mulai menggunakan `OmniStorage` di proyek Anda.

## <i class="ri-terminal-box-line"></i> Instalasi

Gunakan npm untuk menginstal library:

```bash
npm install @x-labs-myid/omnistorage
```

## <i class="ri-links-line"></i> Dependensi

Library ini dibangun di atas beberapa library hebat lainnya untuk mendukung berbagai engine penyimpanan:

| Library                   | Kegunaan                                              | Referensi |
| :------------------------ | :---------------------------------------------------- | :-------- |
| `localStorage`            | Penyimpanan bawaan browser untuk data persisten.      | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) |
| `sessionStorage`          | Penyimpanan bawaan browser untuk data sesi saja.      | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) |
| `document.cookie`         | API bawaan browser untuk penyimpanan cookie kecil.    | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) |
| `CacheStorage`            | API bawaan browser untuk cache bergaya response.      | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage) |
| `dexie` & `idb`           | Menjalankan engine IndexedDB di browser.              | [Dexie](https://dexie.org/) · [idb](https://www.npmjs.com/package/idb) |
| `cacheable`               | Engine Memory yang cepat dengan fitur caching.        | [npm](https://www.npmjs.com/package/cacheable) |
| `better-sqlite3`          | Engine SQLite untuk lingkungan Node.js.               | [GitHub](https://github.com/WiseLibs/better-sqlite3) · [npm](https://www.npmjs.com/package/better-sqlite3) |
| `@sqlite.org/sqlite-wasm` | Engine SQLite untuk lingkungan Browser (WASM).        | [SQLite WASM](https://sqlite.org/wasm/doc/trunk/index.md) · [npm](https://www.npmjs.com/package/@sqlite.org/sqlite-wasm) |

## <i class="ri-shield-check-line"></i> Kompatibilitas

- <i class="ri-chrome-line"></i> **Browser**: Chrome 11+, Firefox 4+, Safari 11+, Edge 12+.
- <i class="ri-nodejs-line"></i> **Node.js**: v14.0.0 atau yang lebih baru.
