# ROADMAP - @my-js-lib/store

Dokumen ini menjelaskan rencana pengembangan library `@my-js-lib/store` untuk menjadi solusi penyimpanan data yang universal (Browser & Node.js).

## Phase 1: Core & Compatibility (Current Focus)

- [x] **Universal Support** `[Shared]`: Deteksi otomatis lingkungan (Browser vs Node.js).
- [x] **In-Memory Fallback** `[Server]`: Gunakan memori jika `localStorage` tidak tersedia.
- [ ] **Basic CRUD** `[Shared]`: `set`, `get`, `remove`, `clear`.
- [ ] **Namespacing** `[Shared]`: Dukungan prefix untuk mengisolasi data.

## Phase 2: Advanced Data Management

- [ ] **Versioning** `[Shared]`: Migrasi data antar versi skema.
- [ ] **TTL (Time To Live)** `[Shared]`: Dukungan masa berlaku data (expiration).
- [ ] **Type Safety** `[Shared]`: Peningkatan validasi tipe data saat pengambilan.
- [ ] **Serialization Customization** `[Shared]`: Kemampuan menggunakan `msgpack` atau kompresi.

## Phase 3: Reliability & DevExp

- [ ] **TypeScript** `[Shared]`: Full rewrite atau penambahan `.d.ts`.
- [ ] **Events** `[Client]`: Listener untuk perubahan data (`onSet`, `onRemove`) via StorageEvent.
- [ ] **Encryption** `[Shared]`: Plugin opsional untuk enkripsi data sensitif (AES).
- [ ] **Error Handling** `[Shared]`: Standardisasi error reporting.

## Phase 4: Pluggable Drivers

- [ ] **Driver System** `[Shared]`: Arsitektur untuk mendukung berbagai storage engine.
- [ ] **Official Drivers**:
  - `localStorage` `[Client]` (Default)
  - `sessionStorage` `[Client]`
  - `Memory` `[Shared]` (Default fallback)
  - `FileSystem` `[Server]` (Node.js Persistence)
  - `IndexedDB` `[Client]` (Large data) - **Hybrid `idb` & `Dexie`**
