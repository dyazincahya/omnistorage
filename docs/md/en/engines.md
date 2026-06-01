# <i class="ri-cpu-line"></i> Storage Engines

`OmniStorage` supports various storage engines that can be customized to your application's needs. Each engine is optimized for specific use cases and environments.

## <i class="ri-list-settings-line"></i> Available Engines

### <i class="ri-database-line"></i> LocalStorage
A standard web storage that allows JavaScript sites and apps to store and access data right in the browser with no expiration date.

| Property | Value |
| :--- | :--- |
| **Engine Key** | `local` |
| **Type** | Client (Browser) |
| **Dependencies** | Native Browser API |

**Best for:** User preferences, theme settings (dark/light mode), and persistent login states.

---

### <i class="ri-history-line"></i> SessionStorage
Similar to LocalStorage, but the data is stored for only one session. The data is deleted when the user closes the specific browser tab.

| Property | Value |
| :--- | :--- |
| **Engine Key** | `session` |
| **Type** | Client (Browser) |
| **Dependencies** | Native Browser API |

**Best for:** Multi-step forms, temporary session data, and tab-specific state management.

---

### <i class="ri-hard-drive-2-line"></i> IndexedDB
A low-level API for client-side storage of significant amounts of structured data, including files/blobs.

| Property | Value |
| :--- | :--- |
| **Engine Key** | `indexeddb` |
| **Type** | Client (Browser) |
| **Dependencies** | `dexie`, `idb` |

**Best for:** Large datasets, offline-first applications, and complex object storage.

---

### <i class="ri-temp-hot-line"></i> In-Memory
A high-performance storage that lives in the application's memory (RAM). It is extremely fast but volatile.

| Property | Value |
| :--- | :--- |
| **Engine Key** | `memory` |
| **Type** | Client & Server |
| **Dependencies** | `cacheable` |

**Best for:** Data caching, fast lookup, and server-side temporary state.

---

### <i class="ri-folder-open-line"></i> File System
A server-side engine that stores data directly on the local disk using Node.js's file system capabilities.

| Property | Value |
| :--- | :--- |
| **Engine Key** | `file` |
| **Type** | Server (Node.js) |
| **Dependencies** | Node.js `fs` |

**Best for:** Server-side data persistence and simple file-based databases.

---

### <i class="ri-server-line"></i> SQLite (Node.js)
A full-featured SQL database engine for Node.js environments.

| Property | Value |
| :--- | :--- |
| **Engine Key** | `sqlite-server` |
| **Type** | Server (Node.js) |
| **Dependencies** | `better-sqlite3` |

**Best for:** Complex relational data and heavy server-side processing.

---

### <i class="ri-globe-line"></i> SQLite (WASM)
A WebAssembly version of SQLite that runs directly in the browser.

| Property | Value |
| :--- | :--- |
| **Engine Key** | `sqlite-client` |
| **Type** | Client (Browser) |
| **Dependencies** | `@sqlite.org/sqlite-wasm` |

**Best for:** Client-side relational data and high-performance web storage.

---

## <i class="ri-compass-3-line"></i> How to Choose an Engine

By default, the library will detect your environment:
- <i class="ri-chrome-line"></i> **Browser**: Uses `local` (LocalStorage).
- <i class="ri-nodejs-line"></i> **Node.js**: Uses `memory`.

You can change the engine globally or per operation:

```javascript
// Change globally
store.use("indexeddb");

// Per operation (Chaining)
await store.config("session").save("temp_key", "value");
```
