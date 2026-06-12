# <i class="ri-download-cloud-2-line"></i> Instalasi & Dependensi

Mulai menggunakan `OmniStorage` di proyek Anda.

## <i class="ri-external-link-line"></i> Demo & Contoh

- **Demo app:** [omnistorage-example.vercel.app](https://omnistorage-example.vercel.app) _(Vercel)_
- **Source code contoh:** [dyazincahya/omnistorage-example](https://github.com/dyazincahya/omnistorage-example)

## <i class="ri-terminal-box-line"></i> Instalasi

Gunakan npm untuk menginstal library:

```bash
npm install @x-labs-myid/omnistorage
```

## <i class="ri-window-line"></i> Setup Client-side

Untuk aplikasi browser, gunakan engine yang aman untuk browser: `local`, `session`, `cookie`, `cache`, `indexeddb`, `memory`, atau `sqlite-client`. Engine `memory` memakai JavaScript `Map` native, sehingga data hanya berada di memori tab/halaman saat ini dan hilang saat reload.

Anda bisa menginisialisasi config global client-side sekali di file bootstrap aplikasi. Lihat detail lengkap di [Referensi API `init()`](#api:init).

```javascript
// app.js
import store from "@x-labs-myid/omnistorage";

await store.init({
  db: {
    name: "omnistorage",
    engine: "sqlite",
  },
  logs: "auto",
});

export default store;
```

```javascript
// browser.js
import store from "./app.js";

await store.save("settings", {
  theme: "dark",
  sidebar: "compact",
});

const settings = await store.find("settings");
console.log(settings.data);
```

Gunakan `sqlite-client` jika membutuhkan persistensi browser berbasis SQLite melalui WASM:

```javascript
import store from "@x-labs-myid/omnistorage";

store.db("todo_app").use("sqlite-client");
store.configureLogs("client");

await store.save("draft:1", {
  title: "Offline note",
  updatedAt: Date.now(),
});
```

Di runtime browser, penyimpanan log default pada mode `auto` adalah `sqlite-client`.

## <i class="ri-server-line"></i> Setup Server-side

Untuk aplikasi Node.js/server, gunakan engine server: `file` atau `sqlite-server`. Anda juga bisa memakai `memory` untuk penyimpanan RAM sementara di server; engine ini memakai JavaScript `Map` native di proses Node.js saat ini dan hilang saat proses restart.

Letakkan konfigurasi global di `app.js` sebelum operasi storage pertama. Lihat detail lengkap di [Referensi API `init()`](#api:init).

```javascript
// app.js
import store from "@x-labs-myid/omnistorage";

await store.init({
  db: {
    name: "omnistorage",
    engine: "sqlite",
  },
  logs: "auto",
});

export default store;
```

```javascript
// server.js
import store from "./app.js";

await store.save("user:1", {
  name: "Cahya",
  role: "admin",
});

const user = await store.find("user:1");
console.log(user.data);
```

Setup chainable tetap didukung:

```javascript
store
  .use({
    db: {
      name: "omnistorage",
      engine: "sqlite",
    },
  })
  .configureLogs("auto");
```

Jika database yang dikonfigurasi sudah ada, OmniStorage akan memakainya dan hanya membuat table `omnistorage_kv` ketika diperlukan. Log aktivitas memakai table `omnistorage_logs`.

Anda juga bisa memakai persistensi JSON berbasis file:

```javascript
import store from "@x-labs-myid/omnistorage";

store.db("server_data").use("file");
await store.save("feature-flags", { beta: true });
```

Di runtime Node.js, penyimpanan log default pada mode `auto` adalah `sqlite-server`. Override secara manual jika diperlukan:

```javascript
store.configureLogs("server");
```

## <i class="ri-flashlight-line"></i> Vite dan Bundler Browser

Tidak perlu alias khusus di Vite. Anda **tidak** perlu memetakan `fs`, `fs/promises`, `path`, `better-sqlite3`, `bindings`, atau `util` ke file kosong.

OmniStorage me-load dependensi Node-only secara lazy, sehingga build browser hanya membawa engine yang aman untuk browser.

```javascript
import { defineConfig } from "vite";

export default defineConfig({});
```

Gunakan `file` dan `sqlite-server` hanya di runtime Node.js/server. Untuk aplikasi browser, gunakan engine seperti `local`, `session`, `cookie`, `cache`, `indexeddb`, `memory`, atau `sqlite-client`.

## <i class="ri-links-line"></i> Dependensi

Library ini dibangun di atas beberapa library hebat lainnya untuk mendukung berbagai engine penyimpanan:

| Library                   | Kegunaan                                           | Referensi                                                                                                                |
| :------------------------ | :------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| `localStorage`            | Penyimpanan bawaan browser untuk data persisten.   | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)                                     |
| `sessionStorage`          | Penyimpanan bawaan browser untuk data sesi saja.   | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)                                   |
| `document.cookie`         | API bawaan browser untuk penyimpanan cookie kecil. | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie)                                         |
| `CacheStorage`            | API bawaan browser untuk cache bergaya response.   | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage)                                            |
| `dexie` & `idb`           | Menjalankan engine IndexedDB di browser.           | [Dexie](https://dexie.org/) · [idb](https://www.npmjs.com/package/idb)                                                   |
| JavaScript `Map`          | Penyimpanan in-memory bawaan untuk engine Memory.  | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)                     |
| `better-sqlite3`          | Engine SQLite untuk lingkungan Node.js.            | [GitHub](https://github.com/WiseLibs/better-sqlite3) · [npm](https://www.npmjs.com/package/better-sqlite3)               |
| `@sqlite.org/sqlite-wasm` | Engine SQLite untuk lingkungan Browser (WASM).     | [SQLite WASM](https://sqlite.org/wasm/doc/trunk/index.md) · [npm](https://www.npmjs.com/package/@sqlite.org/sqlite-wasm) |

## <i class="ri-shield-check-line"></i> Kompatibilitas

- <i class="ri-chrome-line"></i> **Browser**: Chrome 11+, Firefox 4+, Safari 11+, Edge 12+.
- <i class="ri-nodejs-line"></i> **Node.js**: v14.0.0 atau yang lebih baru.
