# <i class="ri-download-cloud-2-line"></i> Installation & Dependencies

Start using `OmniStorage` in your project.

## <i class="ri-external-link-line"></i> Demo & Example

- **Demo app:** [omnistorage-example.vercel.app](https://omnistorage-example.vercel.app) _(Vercel)_
- **Example source code:** [dyazincahya/omnistorage-example](https://github.com/dyazincahya/omnistorage-example)

## <i class="ri-terminal-box-line"></i> Installation

Use npm to install the library:

```bash
npm install @x-labs-myid/omnistorage
```

## <i class="ri-window-line"></i> Client-side Setup

For browser apps, use browser-safe engines: `local`, `session`, `cookie`, `cache`, `indexeddb`, `memory`, or `sqlite-client`. The `memory` engine uses native JavaScript `Map`, so it stays in the current tab/page memory and is cleared on reload.

You can initialize global client-side config once in your app bootstrap. See the full [`init()` API reference](#api:init).

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

Use `sqlite-client` when you want SQLite-backed browser persistence through WASM:

```javascript
import store from "@x-labs-myid/omnistorage";

store.db("todo_app").use("sqlite-client");
store.configureLogs("client");

await store.save("draft:1", {
  title: "Offline note",
  updatedAt: Date.now(),
});
```

In browser runtimes, log storage defaults to `sqlite-client` in `auto` mode.

## <i class="ri-server-line"></i> Server-side Setup

For Node.js/server apps, use server engines: `file` or `sqlite-server`. You can also use `memory` for temporary server-side RAM storage; it uses native JavaScript `Map` inside the current Node.js process and is cleared when the process restarts.

Put global configuration in `app.js` before the first storage operation. See the full [`init()` API reference](#api:init).

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

Chainable setup is still supported:

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

If the configured database already exists, OmniStorage reuses it and creates only the `omnistorage_kv` table when needed. Activity logs use the `omnistorage_logs` table.

You can also use file-based JSON persistence:

```javascript
import store from "@x-labs-myid/omnistorage";

store.db("server_data").use("file");
await store.save("feature-flags", { beta: true });
```

In Node.js runtimes, log storage defaults to `sqlite-server` in `auto` mode. Override it manually when needed:

```javascript
store.configureLogs("server");
```

## <i class="ri-flashlight-line"></i> Vite and Browser Bundlers

No special Vite aliases are required. You do **not** need to map `fs`, `fs/promises`, `path`, `better-sqlite3`, `bindings`, or `util` to empty files.

OmniStorage keeps Node-only dependencies lazy-loaded, so browser builds only bundle the browser-safe engines you use.

```javascript
import { defineConfig } from "vite";

export default defineConfig({});
```

Use `file` and `sqlite-server` only in Node.js/server runtimes. For browser apps, use engines such as `local`, `session`, `cookie`, `cache`, `indexeddb`, `memory`, or `sqlite-client`.

## <i class="ri-links-line"></i> Dependencies

The library is built on top of several great libraries to support various engines:

| Library                   | Usage                                             | Reference                                                                                                                |
| :------------------------ | :------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| `localStorage`            | Built-in browser storage for persistent data.     | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)                                     |
| `sessionStorage`          | Built-in browser storage for session-only data.   | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)                                   |
| `document.cookie`         | Built-in browser API for small cookie storage.    | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie)                                         |
| `CacheStorage`            | Built-in browser API for response-style caches.   | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage)                                            |
| `dexie` & `idb`           | Powering the IndexedDB engine in the browser.     | [Dexie](https://dexie.org/) · [idb](https://www.npmjs.com/package/idb)                                                   |
| JavaScript `Map`          | Built-in in-memory storage for the Memory engine. | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)                     |
| `better-sqlite3`          | SQLite engine for Node.js environments.           | [GitHub](https://github.com/WiseLibs/better-sqlite3) · [npm](https://www.npmjs.com/package/better-sqlite3)               |
| `@sqlite.org/sqlite-wasm` | SQLite engine for Browser environments (WASM).    | [SQLite WASM](https://sqlite.org/wasm/doc/trunk/index.md) · [npm](https://www.npmjs.com/package/@sqlite.org/sqlite-wasm) |

## <i class="ri-shield-check-line"></i> Compatibility

- <i class="ri-chrome-line"></i> **Browser**: Chrome 11+, Firefox 4+, Safari 11+, Edge 12+.
- <i class="ri-nodejs-line"></i> **Node.js**: v14.0.0 or later.
