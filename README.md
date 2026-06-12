<p align="center">
  <img src="docs/assets/images/icon.png" width="128" alt="OmniStorage Logo">
</p>

<h1 align="center">OmniStorage</h1>

<p align="center">
  A lightweight, type-safe, universal storage layer for JavaScript.
  <br />
  Store data across browser and Node.js environments with one consistent API.
</p>

<div align="center">

[![npm version](https://img.shields.io/npm/v/@x-labs-myid/omnistorage?color=cb3837&label=npm&logo=npm)](https://www.npmjs.com/package/@x-labs-myid/omnistorage)
[![npm downloads](https://img.shields.io/npm/dm/@x-labs-myid/omnistorage?color=2ea44f&label=downloads)](https://www.npmjs.com/package/@x-labs-myid/omnistorage)
[![docs](https://img.shields.io/badge/docs-omnistorage.js.org-5340c8)](https://omnistorage.js.org)

</div>

---

## Overview

**OmniStorage** is a pluggable key-value storage library for JavaScript and Node.js. It helps developers work with different storage backends through a consistent, async, and easy-to-use API.

The library is designed for projects that need flexible storage options without rewriting application logic for each environment.

## Demo & Example

- **Demo app:** [omnistorage-example.vercel.app](https://omnistorage-example.vercel.app)
- **Example source code:** [dyazincahya/omnistorage-example](https://github.com/dyazincahya/omnistorage-example)

## Key Features

- **Universal API** — use one consistent interface across browser and Node.js environments.
- **Pluggable engines** — supports browser storage, cookies, Cache Storage, in-memory storage, file-based storage, IndexedDB, and SQLite.
- **ORM-like operations** — work with familiar storage methods such as create, save, find, update, and delete.
- **Type-safe retrieval** — validate data types when reading stored values.
- **Namespacing support** — organize and isolate data across apps, modules, or features.
- **Standard responses** — receive predictable operation results with status, message, engine, and timestamp information.
- **Activity logging** — track storage operations in the `omnistorage_logs` SQLite table for debugging and auditing.
- **Hooks and watchers** — react to storage changes when data is created, updated, read, or deleted.

## Installation

Install from npm:

```bash
npm install @x-labs-myid/omnistorage
```

Use it in your project:

```javascript
import store from "@x-labs-myid/omnistorage";
```

### Client-side setup

Use browser-safe engines for frontend apps: `local`, `session`, `cookie`, `cache`, `indexeddb`, `memory`, or `sqlite-client`.

```javascript
import store from "@x-labs-myid/omnistorage";

store.db("todo_app").use("indexeddb");
// Optional: force browser SQLite WASM for logs.
store.configureLogs("client");

await store.save("theme", { mode: "dark" });
const theme = await store.find("theme");
```

For browser SQLite storage, use `sqlite-client`:

```javascript
store.db("todo_app").use("sqlite-client");
await store.save("draft:1", { title: "Offline note" });
```

### Server-side setup

Use Node.js-only engines on the server: `file` or `sqlite-server`.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.init({
  db: {
    name: "omnistorage",
    engine: "sqlite",
  },
  logs: "auto",
});

await store.save("user:1", { name: "Cahya" });
const user = await store.find("user:1");
```

If the configured database already exists, OmniStorage reuses it and only creates the `omnistorage_kv` and `omnistorage_logs` tables when needed.

### Vite and browser bundlers

OmniStorage works in Vite without aliasing Node.js modules to empty files. Node-only dependencies such as `better-sqlite3` and `node:fs` are loaded lazily only when Node-only engines (`file` or `sqlite-server`) are used at runtime.

A normal Vite config is enough:

```javascript
import { defineConfig } from "vite";

export default defineConfig({});
```

## Supported Engines

OmniStorage supports multiple engines across browser, Node.js, and shared runtime use cases:

- **Runtime-aware**: `sqlite` — resolves to `sqlite-client` in browsers and `sqlite-server` in Node.js
- **Hybrid / Universal**: `memory` — native JavaScript `Map`, no third-party cache dependency
- **Client-side / Browser**: `local`, `session`, `cookie`, `cache`, `indexeddb`, `sqlite-client`
- **Server-only / Node.js**: `file`, `sqlite-server`

## Storage naming

OmniStorage uses OmniStorage-scoped names for internal persistence objects:

- SQLite key-value data is stored in the `omnistorage_kv` table.
- Activity logs are stored in the `omnistorage_logs` table.
- IndexedDB stores key-value data in the `omnistorage_kv` object store.
- The file engine stores JSON files under `.omnistorage/`.

For SQLite engines, `.db(name)` sets the logical database name. If the matching database already exists, OmniStorage reuses it and only creates the OmniStorage table when needed. If it does not exist, SQLite creates it.

Activity logging defaults to `auto` mode: Node.js/server runtimes use `sqlite-server`, browser/client runtimes use `sqlite-client` with SQLite WASM, and mixed client/server projects keep browser logs on SQLite WASM. You can configure global setup either with `init()` or the chainable API:

```javascript
await store.init({
  db: {
    name: "omnistorage",
    engine: "sqlite",
  },
  logs: "auto",
});

store
  .use({
    db: {
      name: "omnistorage",
      engine: "sqlite",
    },
  })
  .configureLogs("auto");
```

## Documentation

Detailed installation guides, API reference, engine configuration, and advanced examples are available on the official documentation site:

👉 **[OmniStorage Official Documentation](https://omnistorage.js.org)**

## Development

Install project dependencies first:

```bash
npm install
```

### Run the documentation locally

The documentation is a static site inside the `docs/` directory. Serve the project root with any local HTTP server, then open the docs page in your browser.

Using Python:

```bash
python -m http.server 8000
```

Or using `serve` via npx:

```bash
npx serve .
```

Then open:

```text
http://localhost:8000/docs/
```

If you use `npx serve .`, open the local URL printed in the terminal and go to `/docs/`.

Playground:

```text
http://localhost:8000/docs/playground/
```

> Avoid opening `docs/index.html` directly with `file://` because the docs load Markdown files with `fetch()`, which requires an HTTP server in most browsers.

### Run checks and tests

Run the source syntax check/build command:

```bash
npm run build
```

Run the configured typecheck command:

```bash
npm run typecheck
```

Run all tests:

```bash
npm test
```

Run a specific test file:

```bash
npm test -- tests/omnistorage.test.js
```

## License

[MIT](/LICENSE)

---

<p align="center">
  Developed with ❤️ by <a href="https://github.com/dyazincahya">Kang Cahya</a>
</p>
