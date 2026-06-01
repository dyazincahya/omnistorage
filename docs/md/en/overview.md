<img src="assets/images/icon.png" class="doc-header-icon" alt="Store Icon">

# <i class="ri-information-line"></i> Overview

`OmniStorage` is a universal, lightweight, and type-safe key-value storage wrapper library for JavaScript and Node.js.

The library is designed to provide a consistent development experience across various platforms, handling differences between browser storage (such as `localStorage` and `IndexedDB`) and server-side storage (such as File System or Memory).

## <i class="ri-question-line"></i> Why Use This Library?

1.  <i class="ri-global-line"></i> **Universal API**: Use the same code for storage in the Browser and Node.js.
2.  <i class="ri-code-box-line"></i> **ORM-Like Syntax**: Uses familiar terms for developers such as `create`, `find`, `update`, and `save`.
3.  <i class="ri-shield-check-line"></i> **Type Safety**: Built-in data type validation during retrieval.
4.  <i class="ri-plug-line"></i> **Pluggable Engines**: Choose the engine that fits your needs (Local, Session, Memory, IndexedDB, SQLite, File).
5.  <i class="ri-flashlight-line"></i> **Smart Logic**: Clear distinction between insert (`create`), update (`update`), and upsert (`save`) operations.

## <i class="ri-focus-2-line"></i> Core Concepts

### <i class="ri-database-2-line"></i> Database Name (`dbName`)

The primary identifier for your storage instance. In file-based or key-prefix engines, this acts as a global prefix. In IndexedDB, it becomes the physical database name.

### <i class="ri-node-tree"></i> Namespacing

Allows you to divide storage into isolated logical sections, avoiding key conflicts between application modules.

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
