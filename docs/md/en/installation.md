# <i class="ri-download-cloud-2-line"></i> Installation & Dependencies

Start using `OmniStorage` in your project.

## <i class="ri-terminal-box-line"></i> Installation

Use npm to install the library from GitHub Packages:

```bash
npm config set @dyazincahya:registry https://npm.pkg.github.com
npm install @dyazincahya/omnistorage
```

## <i class="ri-links-line"></i> Dependencies

The library is built on top of several great libraries to support various engines:

| Library                   | Usage                                           |
| :------------------------ | :---------------------------------------------- |
| `localStorage`            | Built-in browser storage for persistent data.   |
| `sessionStorage`          | Built-in browser storage for session-only data. |
| `dexie` & `idb`           | Powering the IndexedDB engine in the browser.   |
| `cacheable`               | Fast Memory engine with caching features.       |
| `better-sqlite3`          | SQLite engine for Node.js environments.         |
| `@sqlite.org/sqlite-wasm` | SQLite engine for Browser environments (WASM).  |

## <i class="ri-shield-check-line"></i> Compatibility

- <i class="ri-chrome-line"></i> **Browser**: Chrome 11+, Firefox 4+, Safari 11+, Edge 12+.
- <i class="ri-nodejs-line"></i> **Node.js**: v14.0.0 or later.
