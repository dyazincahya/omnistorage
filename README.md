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

## Key Features

- **Universal API** — use one consistent interface across browser and Node.js environments.
- **Pluggable engines** — supports browser storage, cookies, Cache Storage, in-memory storage, file-based storage, IndexedDB, and SQLite.
- **ORM-like operations** — work with familiar storage methods such as create, save, find, update, and delete.
- **Type-safe retrieval** — validate data types when reading stored values.
- **Namespacing support** — organize and isolate data across apps, modules, or features.
- **Standard responses** — receive predictable operation results with status, message, engine, and timestamp information.
- **Activity logging** — track storage operations for debugging and auditing.
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

## Supported Engines

OmniStorage supports multiple engines across browser, Node.js, and shared runtime use cases:

- **Hybrid / Universal**: `memory`
- **Client-side / Browser**: `local`, `session`, `cookie`, `cache`, `indexeddb`, `sqlite-client`
- **Server-only / Node.js**: `file`, `sqlite-server`

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
