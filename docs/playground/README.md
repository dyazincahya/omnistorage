# OmniStorage Playground

Interactive browser playground for manually testing OmniStorage operations from the documentation site.

## Location

Open the playground from the docs site:

```text
/docs/playground/
```

For local testing, run a static server from the project root and open:

```text
http://localhost:8080/docs/playground/
```

## Supported engines

Because this playground is intended for GitHub Pages, it supports browser-safe engines only:

- Memory
- LocalStorage
- SessionStorage
- IndexedDB

Server-only engines such as file storage and server-side SQLite require a Node.js backend and are not executed in this static playground.
