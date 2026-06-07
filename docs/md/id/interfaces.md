# <i class="ri-code-s-slash-line"></i> Export & Interface

OmniStorage mengekspor singleton siap pakai dan class manager jika Anda membutuhkan instance yang terpisah.

## <i class="ri-share-box-line"></i> Export Publik

```javascript
import store, {
  StoreManager,
  store as sharedStore,
} from "@x-labs-myid/omnistorage";

// `store` dan `sharedStore` menunjuk ke singleton yang sama.
const customStore = new StoreManager(); // Instance manager terpisah.
```

| Export         | Tipe                    | Penjelasan                                                                              |
| :------------- | :---------------------- | :-------------------------------------------------------------------------------------- |
| `default`      | Instance `StoreManager` | Cara paling mudah memakai OmniStorage. Biasanya di-import sebagai `store`.              |
| `store`        | Instance `StoreManager` | Named export untuk singleton yang sama. Berguna jika Anda lebih suka named import.      |
| `StoreManager` | `class`                 | Membuat manager penyimpanan terpisah dengan db name, engine, hook, dan watcher sendiri. |

## <i class="ri-shapes-line"></i> Bentuk Interface

Deklarasi bergaya TypeScript di bawah ini menjelaskan bentuk objek publik dan return shape yang dapat digunakan developer. Ini adalah interface dokumentasi, bukan named type export tambahan dari package JavaScript.

### Tipe engine

Gunakan nilai ini pada `.use(engineType)` atau `.engine(engineType)`:

```typescript
type EngineType =
  | "local"
  | "session"
  | "cookie"
  | "cache"
  | "memory"
  | "file"
  | "indexeddb"
  | "sqlite-server"
  | "sqlite-client";
```

### Bentuk respon standar

Sebagian besar method async mengembalikan bentuk respon standar berikut:

```typescript
interface CommandMeta {
  operation: string;
  engine: EngineType;
  dbName: string;
  namespace: string;
}

interface StoreResponse<T = unknown> {
  ok: boolean;
  data?: T;
  message?: string;
  engine?: EngineType;
  timestamp?: number;
  command?: CommandMeta;
}
```

- `ok`: status keberhasilan operasi.
- `data`: data hasil baca, nilai yang disimpan, metadata, statistik, atau hasil batch.
- `message`: pesan status atau error yang mudah dibaca.
- `engine`: engine yang menjalankan operasi.
- `timestamp`: waktu pembuatan respon jika disediakan formatter.
- `command`: metadata yang ditambahkan oleh `.command(payload)`, `.execute(payload)`, atau `.run(payload)`.

### Bentuk JSON payload

```typescript
type CommandOperation =
  | "create"
  | "insert"
  | "save"
  | "set"
  | "update"
  | "find"
  | "findOne"
  | "get"
  | "getByKey"
  | "getById"
  | "findAll"
  | "getAll"
  | "all"
  | "saveMany"
  | "setMany"
  | "createMany"
  | "updateMany"
  | "findMany"
  | "getMany"
  | "destroy"
  | "delete"
  | "remove"
  | "destroyMany"
  | "deleteMany"
  | "removeMany"
  | "truncate"
  | "clear"
  | "describe"
  | "getMeta"
  | "getStatistic"
  | "getStatistics"
  | "statistics"
  | "stats"
  | "transaction";

interface CommandPayload<T = unknown> {
  operation?: CommandOperation;
  action?: CommandOperation;
  method?: CommandOperation;
  engine?: EngineType;
  dbName?: string;
  database?: string;
  namespace?: string;
  key?: string;
  value?: T;
  items?: Record<string, T>;
  keys?: string[];
  options?: FindOptions;
  callback?: TransactionCallback | WatchCallback;
}
```

### Interface utama `StoreManager`

Berikut method publik yang bisa dipanggil developer melalui `store` atau instance `new StoreManager()`.

| Method                                | Return                   | Penjelasan                                                                     |
| :------------------------------------ | :----------------------- | :----------------------------------------------------------------------------- |
| `.db(name)`                           | `StoreManager`           | Mengatur nama database dan menginisialisasi ulang engine dengan nama tersebut. |
| `.getDbName()`                        | `string`                 | Mengambil nama database saat ini.                                              |
| `.use(engineType)`                    | `StoreManager`           | Mengatur engine default secara global.                                         |
| `.engine(engineType)`                 | `ConfiguredStore`        | Mengembalikan interface operasi sementara yang terikat ke engine tertentu.     |
| `.config(engineType)`                 | `ConfiguredStore`        | Alias backward-compatible untuk `.engine(engineType)`.                         |
| `.namespace(name)`                    | `NamespaceStore`         | Mengembalikan interface operasi yang ter-scope namespace.                      |
| `.command(payload)`                   | `Promise<StoreResponse>` | Menjalankan JSON payload standar.                                           |
| `.execute(payload)`                   | `Promise<StoreResponse>` | Alias untuk `.command(payload)`.                                               |
| `.run(payload)`                       | `Promise<StoreResponse>` | Alias untuk `.command(payload)`.                                               |
| `.create(key, value)`                 | `Promise<StoreResponse>` | Menyisipkan item baru dan gagal jika key sudah ada.                            |
| `.insert(key, value)`                 | `Promise<StoreResponse>` | Alias untuk `.create()`.                                                       |
| `.update(key, value)`                 | `Promise<StoreResponse>` | Memperbarui item yang sudah ada dan gagal jika key belum ada.                  |
| `.save(key, value)`                   | `Promise<StoreResponse>` | Operasi upsert. Membuat atau menimpa sesuai kebutuhan.                         |
| `.set(key, value)`                    | `Promise<StoreResponse>` | Alias untuk `.save()`.                                                         |
| `.find(key, options?)`                | `Promise<StoreResponse>` | Mengambil satu item berdasarkan key.                                           |
| `.findOne(key, options?)`             | `Promise<StoreResponse>` | Alias untuk `.find()`.                                                         |
| `.get(key, options?)`                 | `Promise<StoreResponse>` | Alias untuk `.find()`.                                                         |
| `.getByKey(key, options?)`            | `Promise<StoreResponse>` | Alias untuk `.find()`.                                                         |
| `.getById(key, options?)`             | `Promise<StoreResponse>` | Alias untuk `.find()`.                                                         |
| `.findAll()`                          | `Promise<StoreResponse>` | Mengambil semua item dari engine default saat ini.                             |
| `.getAll()`                           | `Promise<StoreResponse>` | Alias untuk `.findAll()`.                                                      |
| `.destroy(key)`                       | `Promise<StoreResponse>` | Menghapus satu item berdasarkan key.                                           |
| `.delete(key)`                        | `Promise<StoreResponse>` | Alias untuk `.destroy()`.                                                      |
| `.remove(key)`                        | `Promise<StoreResponse>` | Alias untuk `.destroy()`.                                                      |
| `.truncate()`                         | `Promise<StoreResponse>` | Menghapus semua data pada engine/database scope saat ini.                      |
| `.clear()`                            | `Promise<StoreResponse>` | Alias untuk `.truncate()`.                                                     |
| `.saveMany(items)`                    | `Promise<StoreResponse>` | Upsert banyak item.                                                            |
| `.setMany(items)`                     | `Promise<StoreResponse>` | Alias untuk `.saveMany()`.                                                     |
| `.createMany(items)`                  | `Promise<StoreResponse>` | Insert banyak item; key yang sudah ada dilaporkan gagal.                       |
| `.updateMany(items)`                  | `Promise<StoreResponse>` | Update banyak item; key yang tidak ditemukan dilaporkan gagal.                 |
| `.findMany(keys, options?)`           | `Promise<StoreResponse>` | Mengambil banyak item berdasarkan daftar key.                                  |
| `.getMany(keys, options?)`            | `Promise<StoreResponse>` | Alias untuk `.findMany()`.                                                     |
| `.destroyMany(keys)`                  | `Promise<StoreResponse>` | Menghapus banyak item berdasarkan daftar key.                                  |
| `.deleteMany(keys)`                   | `Promise<StoreResponse>` | Alias untuk `.destroyMany()`.                                                  |
| `.transaction(callback, engineType?)` | `Promise<StoreResponse>` | Menjalankan beberapa operasi dalam callback bergaya transaksi.                 |
| `.describe(key)`                      | `Promise<StoreResponse>` | Mengambil metadata key, seperti estimasi ukuran dan engine.                    |
| `.getMeta(key)`                       | `Promise<StoreResponse>` | Alias untuk `.describe()`.                                                     |
| `.getStatistic(engineType?)`          | `Promise<StoreResponse>` | Mengambil statistik satu engine atau semua engine.                             |
| `.getStatistics()`                    | `Promise<StoreResponse>` | Alias untuk `.getStatistic()` tanpa engine type.                               |
| `.getActivityLogs(limit?)`            | `Promise<StoreResponse>` | Mengambil log aktivitas yang dicatat OmniStorage.                              |
| `.getLogs(limit?)`                    | `Promise<StoreResponse>` | Alias untuk `.getActivityLogs()`.                                              |
| `.clearActivityLogs()`                | `Promise<StoreResponse>` | Menghapus semua log aktivitas.                                                 |
| `.watch(key, callback)`               | `() => void`             | Memantau satu key dan mengembalikan fungsi unwatch.                            |
| `.on(event, callback)`                | `StoreManager`           | Mendaftarkan hook global.                                                      |

### Opsi pencarian

```typescript
interface FindOptions<T = unknown> {
  validator?: (value: T) => boolean;
  defaultValue?: T;
  type?: string;
}
```

- `validator`: fungsi validasi kustom. Jika menghasilkan `false`, respon menjadi `ok: false`.
- `defaultValue`: nilai fallback sebagai `data` ketika key tidak ditemukan atau validasi gagal.
- `type`: pengecekan tipe opsional menggunakan predicate dari package internal `is`, misalnya `string`, `number`, `object`, atau `array`.

### Interface configured store

`store.engine(engineType)` mengembalikan interface operasi sementara yang terikat pada engine tersebut. Ini tidak mengubah engine default global secara permanen. `store.config(engineType)` mengembalikan interface yang sama sebagai alias backward-compatible.

```typescript
interface ConfiguredStore {
  create(key: string, value: unknown): Promise<StoreResponse>;
  update(key: string, value: unknown): Promise<StoreResponse>;
  save(key: string, value: unknown): Promise<StoreResponse>;
  find(key: string, options?: FindOptions): Promise<StoreResponse>;
  findOne(key: string, options?: FindOptions): Promise<StoreResponse>;
  findMany(keys: string[], options?: FindOptions): Promise<StoreResponse>;
  findAll(): Promise<unknown[]>;
  saveMany(items: Record<string, unknown>): Promise<StoreResponse>;
  destroy(key: string): Promise<StoreResponse>;
  destroyMany(keys: string[]): Promise<StoreResponse>;
  truncate(): Promise<StoreResponse>;
  describe(key: string): Promise<StoreResponse>;
  watch(key: string, callback: WatchCallback): () => void;
  transaction(callback: TransactionCallback): Promise<StoreResponse>;
  namespace(name: string): NamespaceStore;
  command(payload: CommandPayload): Promise<StoreResponse>;
  execute(payload: CommandPayload): Promise<StoreResponse>;
  run(payload: CommandPayload): Promise<StoreResponse>;
}
```

### Interface namespace store

`store.namespace(name)` menambahkan prefix `name:` ke semua key dan mengembalikan method berikut:

```typescript
interface NamespaceStore {
  create(key: string, value: unknown): Promise<StoreResponse>;
  update(key: string, value: unknown): Promise<StoreResponse>;
  save(key: string, value: unknown): Promise<StoreResponse>;
  find(key: string, options?: FindOptions): Promise<StoreResponse>;
  findOne(key: string, options?: FindOptions): Promise<StoreResponse>;
  findAll(): Promise<StoreResponse>;
  createMany(items: Record<string, unknown>): Promise<StoreResponse>;
  updateMany(items: Record<string, unknown>): Promise<StoreResponse>;
  saveMany(items: Record<string, unknown>): Promise<StoreResponse>;
  findMany(keys: string[], options?: FindOptions): Promise<StoreResponse>;
  destroy(key: string): Promise<StoreResponse>;
  destroyMany(keys: string[]): Promise<StoreResponse>;
  truncate(): Promise<StoreResponse>;
  describe(key: string): Promise<StoreResponse>;
  watch(key: string, callback: WatchCallback): () => void;
  transaction(callback: TransactionCallback): Promise<StoreResponse>;
}
```

### Hook, watcher, dan transaksi

```typescript
type HookEvent = "onSet" | "onGet" | "onDelete" | "onClear";
type WatchCallback = (newValue: unknown, oldValue: unknown) => void;

type TransactionStore = {
  create(key: string, value: unknown): Promise<StoreResponse>;
  update(key: string, value: unknown): Promise<StoreResponse>;
  save(key: string, value: unknown): Promise<StoreResponse>;
  destroy(key: string): Promise<StoreResponse>;
};

type TransactionCallback = (
  trx: TransactionStore,
) => Promise<unknown> | unknown;
```
