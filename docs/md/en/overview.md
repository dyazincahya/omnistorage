<img src="assets/images/icon.png" class="doc-header-icon" alt="Store Icon">

# <i class="ri-information-line"></i> Overview

`OmniStorage` is a universal, lightweight, and type-safe key-value storage wrapper library for JavaScript and Node.js.

The library provides one consistent asynchronous API for storing data across browser, server, and shared runtime environments.

## <i class="ri-external-link-line"></i> Demo & Example

- **Demo app:** [omnistorage-example.vercel.app](https://omnistorage-example.vercel.app) _(Vercel)_
- **Example source code:** [dyazincahya/omnistorage-example](https://github.com/dyazincahya/omnistorage-example)

## <i class="ri-question-line"></i> Why Use This Library?

1. <i class="ri-global-line"></i> **Universal API**: Use the same storage API in the Browser and Node.js.
2. <i class="ri-code-box-line"></i> **ORM-Like Syntax**: Work with familiar methods such as `create`, `find`, `update`, and `save`.
3. <i class="ri-shield-check-line"></i> **Type Safety**: Validate data types when retrieving stored values.
4. <i class="ri-plug-line"></i> **Pluggable Engines**: Switch storage backends without changing your application flow.
5. <i class="ri-history-line"></i> **Activity Tracking**: Track storage operations for debugging and auditing.

---

## <i class="ri-layout-grid-line"></i> Available Engines

`OmniStorage` currently supports these engines:

- **Hybrid / Universal**: `memory`
- **Client-side / Browser**: `local`, `session`, `cookie`, `cache`, `indexeddb`, `sqlite-client`
- **Server-only / Node.js**: `file`, `sqlite-server`

For detailed behavior, use cases, and requirements for each engine, see the **Storage Engines** page.

---

## <i class="ri-checkbox-circle-line"></i> Standard Response

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
