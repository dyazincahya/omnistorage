# <i class="ri-cpu-line"></i> Storage Engines

`OmniStorage` supports multiple storage engines that can be selected based on runtime, persistence needs, data size, and deployment target. Every engine is exposed through the same async API, so application code can switch storage backends without changing the operation flow.

## <i class="ri-list-settings-line"></i> Available Engines

<h2 id="local"><i class="ri-database-line"></i> LocalStorage</h2>

LocalStorage uses the browser's native `window.localStorage` API. Data is stored per origin and remains available after page reloads, browser restarts, or tab closes until the user, browser, or application clears it.

| Property         | Value                                                                                      |
| :--------------- | :----------------------------------------------------------------------------------------- |
| **Engine Key**   | `local`                                                                                    |
| **Type**         | Client (Browser)                                                                           |
| **Persistence**  | Persistent until cleared                                                                   |
| **Limit**        | 5 MB default guard                                                                         |
| **Dependencies** | [Native Browser API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) |

**What it does:** Stores small key-value data directly in the browser using string-based Web Storage.

**Commonly used for:**

- User preferences such as theme, language, and UI settings.
- Small application state that should survive reloads.
- Feature flags and lightweight client-side configuration.

**Important notes:**

- Storage is synchronous natively, but OmniStorage wraps it in an async API for consistency.
- Capacity is limited, commonly around 5–10 MB depending on the browser and quota policy.
- Data is readable by JavaScript on the same origin, so avoid storing sensitive secrets.
- Private/incognito browsing modes may clear or restrict persisted data differently.

---

<h2 id="session"><i class="ri-history-line"></i> SessionStorage</h2>

SessionStorage uses the browser's native `window.sessionStorage` API. It behaves similarly to LocalStorage, but data is scoped to the current browser tab/session.

| Property         | Value                                                                                        |
| :--------------- | :------------------------------------------------------------------------------------------- |
| **Engine Key**   | `session`                                                                                    |
| **Type**         | Client (Browser)                                                                             |
| **Persistence**  | Current tab session only                                                                     |
| **Limit**        | 5 MB default guard                                                                           |
| **Dependencies** | [Native Browser API](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) |

**What it does:** Stores temporary key-value data that should disappear when the tab or browser session ends.

**Commonly used for:**

- Multi-step form progress.
- Temporary UI state.
- Checkout/session flows that should not persist forever.
- Tab-specific data that should not be shared with other tabs.

**Important notes:**

- Data is isolated per tab, unlike LocalStorage.
- It is not suitable for long-term persistence.
- Like LocalStorage, data is readable by JavaScript on the same origin.

---

<h2 id="cookie"><i class="ri-cookie-line"></i> Cookies</h2>

Cookies store small key-value data through the browser's `document.cookie` interface. Unlike LocalStorage, cookies may be sent automatically with matching HTTP requests, depending on path, domain, SameSite, and secure settings.

| Property         | Value                                                                                  |
| :--------------- | :------------------------------------------------------------------------------------- |
| **Engine Key**   | `cookie`                                                                               |
| **Type**         | Client (Browser)                                                                       |
| **Persistence**  | Session cookie by default in the current engine                                        |
| **Limit**        | ~80 KB total default guard; 4 KB per cookie item                                       |
| **Dependencies** | [Native Browser API](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) |

**What it does:** Stores small browser-accessible values as HTTP cookies using OmniStorage's standard key prefixing. The current engine writes browser-accessible cookies through `document.cookie` with default `Path=/` and `SameSite=Lax`.

**Commonly used for:**

- Locale/language flags.
- Consent markers.
- Lightweight preferences that may need server awareness.
- Small compatibility state for traditional server-rendered applications.

**Important notes:**

- Cookies are small; a common practical limit is around 4 KB per cookie.
- The current engine does not expose per-write cookie attributes yet, so values are session cookies unless the engine is extended with expiry/max-age options.
- JavaScript cannot read or write `HttpOnly` cookies.
- Cookie data can be sent with HTTP requests, so avoid storing large data or sensitive values.
- For sensitive authentication, prefer secure server-managed cookies rather than client-managed values.

---

<h2 id="cache"><i class="ri-archive-line"></i> Cache Storage</h2>

Cache Storage uses the browser's `caches` API. It is commonly used by Progressive Web Apps and Service Workers to store request/response pairs for offline support and fast repeat access.

| Property         | Value                                                                               |
| :--------------- | :---------------------------------------------------------------------------------- |
| **Engine Key**   | `cache`                                                                             |
| **Type**         | Client (Browser)                                                                    |
| **Persistence**  | Best-effort persistent cache, subject to browser quota/eviction policy              |
| **Limit**        | 50 MB soft guard                                                                    |
| **Dependencies** | [Native Browser API](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage) |

**What it does:** Stores OmniStorage values as JSON responses behind generated internal request keys.

**Commonly used for:**

- Offline-friendly cached data.
- API response snapshots.
- PWA data that should be available without network access.
- Larger browser-side cached values compared with cookies or Web Storage.

**Important notes:**

- Cache Storage is designed for request/response caching, not relational querying.
- It is generally available in modern browsers and secure contexts; support may differ in older browsers or restricted environments.
- Browser quota and eviction policies may vary, so cached data should be considered rebuildable.
- It works best for cache-like data that can be refreshed or rebuilt.

---

<h2 id="indexeddb"><i class="ri-hard-drive-2-line"></i> IndexedDB</h2>

IndexedDB is a browser database API for storing structured data. It supports larger datasets than LocalStorage and is designed for asynchronous, non-blocking storage.

| Property         | Value                                                 |
| :--------------- | :---------------------------------------------------- |
| **Engine Key**   | `indexeddb`                                           |
| **Type**         | Client (Browser)                                      |
| **Persistence**  | Persistent until cleared or evicted by browser policy |
| **Limit**        | 500 MB soft guard                                     |
| **Dependencies** | [`idb`](https://www.npmjs.com/package/idb)            |

**What it does:** Stores structured client-side data in the `omnistorage_kv` IndexedDB object store using OmniStorage keys and values.

**Commonly used for:**

- Offline-first applications.
- Large client-side datasets.
- Cached API data that needs structured persistence.
- Complex objects, documents, and local app records.

**Important notes:**

- IndexedDB is asynchronous and better suited for larger data than Web Storage.
- Browser support is broad, but quota behavior differs across browsers.
- It is usually the best default choice for serious browser-side persistence.

---

<h2 id="memory"><i class="ri-temp-hot-line"></i> In-Memory</h2>

The memory engine stores data inside the active JavaScript runtime memory. In the browser, data lives in the current page context. In Node.js, data lives in the running process.

| Property         | Value                                                                                                    |
| :--------------- | :------------------------------------------------------------------------------------------------------- |
| **Engine Key**   | `memory`                                                                                                 |
| **Type**         | Universal runtime (Browser & Node.js)                                                                    |
| **Persistence**  | Volatile, cleared when runtime ends                                                                      |
| **Limit**        | 50 MB soft guard                                                                                         |
| **Dependencies** | JavaScript [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) |

**What it does:** Provides very fast temporary storage using native JavaScript `Map` without writing to browser APIs, disk, or third-party cache libraries.

**Commonly used for:**

- Runtime caching.
- Tests and demos.
- Temporary computed data.
- Server-side in-process cache.
- Fallback storage when browser-specific APIs are unavailable.

**Important notes:**

- Data is lost when the page reloads or the Node.js process restarts.
- It is not shared across tabs, workers, or server instances.
- In a project that has both frontend and backend, browser `memory` and Node.js `memory` are separate because each runtime owns its own `Map` instance.
- It does not use `cacheable` or any other third-party memory library.
- Best for speed and temporary state, not durable storage.

---

<h2 id="file"><i class="ri-folder-open-line"></i> File System</h2>

The file engine stores data on disk using Node.js file system capabilities. In the current implementation, each `dbName` is stored as a JSON file under a `.omnistorage` directory in the process working directory.

| Property         | Value                                          |
| :--------------- | :--------------------------------------------- |
| **Engine Key**   | `file`                                         |
| **Type**         | Server (Node.js)                               |
| **Persistence**  | Persistent on local disk                       |
| **Limit**        | 100 MB soft guard                              |
| **Dependencies** | Node.js [`fs`](https://nodejs.org/api/fs.html) |

**What it does:** Persists key-value data into a JSON file on the server or local Node.js runtime.

**Commonly used for:**

- Simple server-side persistence.
- Local development tools.
- CLI utilities.
- Lightweight data storage without running a database server.

**Important notes:**

- This engine is not available in normal browser environments.
- Disk permissions, current working directory, and deployment filesystem behavior matter.
- Writes update the JSON file, so it is best for simple persistence rather than high-concurrency workloads.
- For high-concurrency or relational data, SQLite may be a better fit.

---

<h2 id="sqlite-server"><i class="ri-server-line"></i> SQLite (Node.js)</h2>

SQLite Server uses SQLite through Node.js. In OmniStorage, it provides a durable SQLite-backed key-value store for server-side applications.

| Property         | Value                                                            |
| :--------------- | :--------------------------------------------------------------- |
| **Engine Key**   | `sqlite-server`                                                  |
| **Type**         | Server (Node.js)                                                 |
| **Persistence**  | Persistent SQLite database file                                  |
| **Limit**        | 1 GB soft guard                                                  |
| **Dependencies** | [`better-sqlite3`](https://www.npmjs.com/package/better-sqlite3) |

**What it does:** Stores OmniStorage key-value data in the `omnistorage_kv` table inside a local SQLite database file on the server.

**Commonly used for:**

- Durable server-side key-value storage.
- Local-first server apps.
- Small to medium applications that need SQLite reliability without a separate database server.
- Audit/logging-oriented persistence.

**Important notes:**

- Requires a Node.js environment and native SQLite dependency support.
- Works well for durable local databases.
- `.db(name)` sets the logical database name. If the matching SQLite database already exists, OmniStorage reuses it and only creates the `omnistorage_kv` table if it is missing. If it does not exist, SQLite creates it.
- OmniStorage exposes this as a key-value engine, not a full SQL query API.
- For distributed multi-server deployments, consider how the SQLite file is shared or replicated.

---

<h2 id="sqlite-client"><i class="ri-globe-line"></i> SQLite (WASM)</h2>

SQLite Client uses SQLite compiled to WebAssembly, allowing SQLite-style storage to run in the browser.

| Property         | Value                                                                              |
| :--------------- | :--------------------------------------------------------------------------------- |
| **Engine Key**   | `sqlite-client`                                                                    |
| **Type**         | Client (Browser)                                                                   |
| **Persistence**  | Persistent with OPFS when available; otherwise browser/runtime dependent           |
| **Limit**        | 256 MB soft guard                                                                  |
| **Dependencies** | [`@sqlite.org/sqlite-wasm`](https://www.npmjs.com/package/@sqlite.org/sqlite-wasm) |

**What it does:** Provides a browser-side SQLite-backed key-value engine through WebAssembly. Data is stored in the `omnistorage_kv` table. The current implementation checks OPFS-backed SQLite storage when available, reuses an existing database with the same name, and creates the database/table only when needed.

**Commonly used for:**

- Advanced client-side data persistence.
- Browser apps that benefit from SQL-like local storage.
- Offline-capable applications with structured data needs.
- Experiments or apps that want SQLite behavior in the browser.

**Important notes:**

- Browser support and persistence behavior can depend on WebAssembly, OPFS, and origin storage capabilities.
- It is heavier than LocalStorage or IndexedDB.
- If `.db(name)` matches an existing browser SQLite database, OmniStorage uses it and creates only the `omnistorage_kv` table when missing.
- OmniStorage exposes this as a key-value engine, not a full SQL query API.
- Use it when SQLite-backed browser storage is useful enough to justify the extra complexity.

---
