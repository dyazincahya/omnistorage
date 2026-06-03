# <i class="ri-compass-3-line"></i> Engine Guide

This page explains how OmniStorage chooses a default engine, how to switch engines, and how to decide which engine is suitable for your use case.

## <i class="ri-radar-line"></i> Default Engine

By default, OmniStorage uses `memory` when no engine is selected globally with `.use()` or locally with `.engine()`.

`memory` is the safest universal default because it works in both browsers and Node.js without requiring platform-specific APIs. Use `.use(engineType)` when you want a different global default.

Engine priority is:

1. Local engine from `.engine(engineType)`
2. Global engine from `.use(engineType)`
3. Built-in fallback: `memory`

## <i class="ri-arrow-left-right-line"></i> Switching Engines

You can change the engine globally or only for a specific chain of operations.

### Global engine

Use `.use(engineType)` when you want all following operations to use the same engine by default.

```javascript
import store from "@x-labs-myid/omnistorage";

store.use("indexeddb");

await store.save("profile", {
  name: "Kang Cahya",
  role: "developer",
});
```

### Per-operation engine

Use `.engine(engineType)` when you only want to use a specific engine temporarily.

```javascript
import store from "@x-labs-myid/omnistorage";

const users = [{ id: 1, name: "Cahya" }];

await store.engine("session").save("checkout_step", 2);
await store.engine("cookie").save("locale", "id");
await store.engine("cache").save("users_snapshot", users);
```

This is useful when one application needs different storage behavior for different kinds of data.

> `.config(engineType)` is still available as a backward-compatible alias for `.engine(engineType)`.

## <i class="ri-database-2-line"></i> Database Name and Namespacing

Engine selection can be combined with `.db()` and `.namespace()`.

```javascript
import store from "@x-labs-myid/omnistorage";

store.db("my_app").use("indexeddb");

const authStore = store.namespace("auth");
await authStore.save("user", { id: 1, name: "Cahya" });
```

General behavior:

- In `local`, `session`, `cookie`, `cache`, `memory`, and `file`, `dbName` acts as a global key prefix.
- In database-like engines such as `indexeddb`, `sqlite-server`, and `sqlite-client`, `dbName` is used as the physical database name or database scope.
- `namespace()` adds another logical layer for grouping keys by feature or module.

## <i class="ri-route-line"></i> Choosing the Right Engine

Use this quick guide as a starting point:

| Need | Recommended Engine |
| :--- | :--- |
| Small persistent browser preferences | `local` |
| Temporary state for the current tab | `session` |
| Very small browser values that may need server visibility | `cookie` |
| Offline-friendly API snapshots or cache entries | `cache` |
| Larger browser-side structured data | `indexeddb` |
| Temporary runtime cache, tests, or demos | `memory` |
| Simple Node.js disk persistence | `file` |
| Durable Node.js storage with database reliability | `sqlite-server` |
| SQLite-like behavior in the browser | `sqlite-client` |

## <i class="ri-lightbulb-line"></i> Practical Examples

### User preferences

```javascript
import store from "@x-labs-myid/omnistorage";

store.use("local");
await store.save("theme", "dark");
await store.save("language", "en");
```

### Temporary checkout flow

```javascript
import store from "@x-labs-myid/omnistorage";

await store.engine("session").save("checkout", {
  step: 2,
  selectedShipping: "regular",
});
```

### Browser locale flag

```javascript
import store from "@x-labs-myid/omnistorage";

await store.engine("cookie").save("locale", "id");
```

### Offline API snapshot

```javascript
import store from "@x-labs-myid/omnistorage";

const products = [
  { id: 1, name: "Keyboard" },
  { id: 2, name: "Mouse" },
];

await store.engine("cache").save("products", products);
```

### Large browser dataset

```javascript
import store from "@x-labs-myid/omnistorage";

const catalogItems = [
  { sku: "SKU-001", name: "Laptop" },
  { sku: "SKU-002", name: "Monitor" },
];

store.use("indexeddb");
await store.save("catalog", catalogItems);
```

### Server-side durable storage

```javascript
import store from "@x-labs-myid/omnistorage";

const invoiceData = {
  id: "INV-001",
  total: 125000,
  status: "paid",
};

store.use("sqlite-server");
await store.save("invoice:INV-001", invoiceData);
```

## <i class="ri-error-warning-line"></i> Security and Data Size Notes

- Do not store passwords, private tokens, or sensitive secrets in browser-readable engines.
- Use `cookie` only for small values; cookies are commonly limited to around 4 KB each.
- Use `cache` and `indexeddb` for larger browser-side data.
- Use server-side engines such as `file` or `sqlite-server` when data should not be exposed to client-side JavaScript.
