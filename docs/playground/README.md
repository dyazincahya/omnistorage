# OmniStorage Playground

## English

Interactive browser playground for manually testing OmniStorage operations from the documentation site.

### Location

Open the playground from the docs site:

```text
/docs/playground/
```

For local testing, run a static server from the project root and open:

```text
http://localhost:8080/docs/playground/
```

### Supported engines

Because this playground is intended for GitHub Pages, it supports browser-safe engines only:

- Memory
- LocalStorage
- SessionStorage
- Cookies
- Cache Storage
- IndexedDB
- SQLite Client WASM

Server-only engines such as file storage and server-side SQLite require a Node.js backend and are not executed in this static playground.

---

## Bahasa Indonesia

Playground browser interaktif untuk menguji operasi OmniStorage secara manual dari situs dokumentasi.

### Lokasi

Buka playground dari situs dokumentasi:

```text
/docs/playground/
```

Untuk pengujian lokal, jalankan static server dari root project lalu buka:

```text
http://localhost:8080/docs/playground/
```

### Engine yang didukung

Karena playground ini ditujukan untuk GitHub Pages, hanya engine yang aman dijalankan di browser yang didukung:

- Memory
- LocalStorage
- SessionStorage
- Cookies
- Cache Storage
- IndexedDB
- SQLite Client WASM

Engine khusus server seperti file storage dan SQLite server membutuhkan backend Node.js, sehingga tidak dieksekusi di playground statis ini.
