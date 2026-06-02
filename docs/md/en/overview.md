<img src="assets/images/icon.png" class="doc-header-icon" alt="Store Icon">

# <i class="ri-information-line"></i> Overview

`OmniStorage` is a universal, lightweight, and type-safe key-value storage wrapper library for JavaScript and Node.js.

The library is designed to provide a consistent development experience across various platforms, handling differences between browser storage (such as `localStorage`, `IndexedDB`, and `SQLite WASM`), server-side storage (such as `SQLite` and `File System`), and universal runtime storage such as `Memory`.

## <i class="ri-question-line"></i> Why Use This Library?

1.  <i class="ri-global-line"></i> **Universal API**: Use the same code for storage in the Browser and Node.js.
2.  <i class="ri-code-box-line"></i> **ORM-Like Syntax**: Uses familiar terms for developers such as `create`, `find`, `update`, and `save`.
3.  <i class="ri-shield-check-line"></i> **Type Safety**: Built-in data type validation during retrieval.
4.  <i class="ri-plug-line"></i> **Pluggable Engines**: Choose the engine that fits your needs (Local, Session, Memory, IndexedDB, SQLite Client/Server, File).
5.  <i class="ri-history-line"></i> **Activity Tracking**: Built-in SQLite logging to monitor all storage operations for debugging and auditing.

---

## <i class="ri-layout-grid-line"></i> Storage Engines Comparison

`OmniStorage` unifies various engines. Below is a detailed breakdown of how each engine behaves to help you choose the right one for your needs.

### <i class="ri-window-line"></i> Browser-Based Engines

*   **LocalStorage (`local`)**
    *   **Persistence**: Permanent (until cleared).
    *   **Capacity**: Small (~5-10MB).
    *   **Logic**: Uses `dbName` as a global prefix and `namespace` as an infix.
*   **SessionStorage (`session`)**
    *   **Persistence**: Tab session only (volatile on close).
    *   **Capacity**: Small (~5-10MB).
    *   **Logic**: Uses `dbName` as a global prefix and `namespace` as an infix.
*   **IndexedDB (`indexeddb`)**
    *   **Persistence**: Permanent.
    *   **Capacity**: Very Large (GBs).
    *   **Logic**: Uses `dbName` as the physical database name.
*   **SQLite WASM (`sqlite-client`)**
    *   **Persistence**: Browser-side SQLite database.
    *   **Capacity**: Large (browser/storage dependent).
    *   **Logic**: Client-side SQLite via WebAssembly.

### <i class="ri-git-branch-line"></i> Hybrid / Universal Engine

*   **Memory (`memory`)**
    *   **Persistence**: Volatile (cleared when the current browser page or Node.js process ends).
    *   **Capacity**: Limited by the active runtime RAM.
    *   **Logic**: Hybrid/universal in-process storage (Browser/Node). Uses `dbName` as a prefix.

### <i class="ri-server-line"></i> Server Engines

*   **File System (`file`)**
    *   **Persistence**: Permanent.
    *   **Capacity**: Large (Disk dependent).
    *   **Logic**: Node.js only. Uses `dbName` as a file/folder prefix.
*   **SQLite Server (`sqlite-server`)**
    *   **Persistence**: Permanent.
    *   **Capacity**: Large (Disk dependent).
    *   **Logic**: Node.js SQLite using `dbName` as the physical database file (`.sqlite`).

---

## <i class="ri-focus-2-line"></i> Core Concepts

To maintain API consistency across platforms, the library uses the following strategies:

### <i class="ri-database-2-line"></i> Database Name (`dbName`)

`dbName` is the primary identifier for your storage instance.

- **In Local/Session/Memory/File**: It acts as a **Global Namespace** (the very first prefix). If `dbName` is `app1`, then the key `user` will be stored as `app1_user`.
- **In IndexedDB/SQLite**: It acts as the **Physical Database Name/File**. The system will create a real database or file with that name.

### <i class="ri-node-tree"></i> Namespacing

`namespace` is a logical grouping within a database.

- **In Local/Session/Memory/File**: It acts as a **Sub-Prefix**. If you use `store.db('app1').namespace('auth')`, the key `token` will be stored as `app1_auth:token`.
- **In IndexedDB/SQLite**: Since these engines are already isolated at the `dbName` level, `namespace` acts as a **Key Prefix** within the storage table.

> <i class="ri-information-line"></i> **Important**: Although some engines are natively synchronous (like LocalStorage), this library wraps everything in an **Asynchronous API (Promise)** to ensure access is uniform and does not block the main thread.

### <i class="ri-checkbox-circle-line"></i> Standard Response

All operations return a standard response object for consistent handling:

```javascript
{
  ok: true,
  data: { ... },
  message: "Success",
  engine: "local",
  timestamp: 123456789
}
```
