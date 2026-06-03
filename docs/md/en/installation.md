# <i class="ri-download-cloud-2-line"></i> Installation & Dependencies

Start using `OmniStorage` in your project.

## <i class="ri-terminal-box-line"></i> Installation

Use npm to install the library:

```bash
npm install @x-labs-myid/omnistorage
```

## <i class="ri-links-line"></i> Dependencies

The library is built on top of several great libraries to support various engines:

| Library                   | Usage                                           | Reference |
| :------------------------ | :---------------------------------------------- | :-------- |
| `localStorage`            | Built-in browser storage for persistent data.   | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) |
| `sessionStorage`          | Built-in browser storage for session-only data. | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) |
| `document.cookie`         | Built-in browser API for small cookie storage.  | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) |
| `CacheStorage`            | Built-in browser API for response-style caches. | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage) |
| `dexie` & `idb`           | Powering the IndexedDB engine in the browser.   | [Dexie](https://dexie.org/) · [idb](https://www.npmjs.com/package/idb) |
| `cacheable`               | Fast Memory engine with caching features.       | [npm](https://www.npmjs.com/package/cacheable) |
| `better-sqlite3`          | SQLite engine for Node.js environments.         | [GitHub](https://github.com/WiseLibs/better-sqlite3) · [npm](https://www.npmjs.com/package/better-sqlite3) |
| `@sqlite.org/sqlite-wasm` | SQLite engine for Browser environments (WASM).  | [SQLite WASM](https://sqlite.org/wasm/doc/trunk/index.md) · [npm](https://www.npmjs.com/package/@sqlite.org/sqlite-wasm) |

## <i class="ri-shield-check-line"></i> Compatibility

- <i class="ri-chrome-line"></i> **Browser**: Chrome 11+, Firefox 4+, Safari 11+, Edge 12+.
- <i class="ri-nodejs-line"></i> **Node.js**: v14.0.0 or later.
