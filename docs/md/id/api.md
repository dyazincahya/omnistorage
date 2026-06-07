# <i class="ri-braces-line"></i> Referensi API (Gaya ORM)

Gunakan metode yang familiar untuk mengelola data Anda. Semua operasi async mengembalikan objek respon standar.

<h2 id="config"><i class="ri-settings-4-line"></i> Konfigurasi & Namespacing</h2>

### <i class="ri-database-2-line"></i> `.db(name)`

Mengatur nama database global. Ini bertindak sebagai nama database fisik di IndexedDB atau prefix global pada engine lainnya.

```javascript
import store from "@x-labs-myid/omnistorage";

store.db("my_app");
```

### <i class="ri-plug-line"></i> `.use(engineType)`

Mengatur engine penyimpanan default secara global.

> Jika tidak ada engine global yang diatur dengan `.use()` dan tidak ada engine lokal yang dipilih dengan `.engine()`, OmniStorage menggunakan `memory` secara default.

```javascript
import store from "@x-labs-myid/omnistorage";

store.use("session"); // local, session, cookie, cache, memory, file, indexeddb, sqlite-server, sqlite-client
```

### <i class="ri-equalizer-line"></i> `.engine(engineType)`

Beralih sementara ke engine tertentu untuk serangkaian operasi tanpa mengubah default global.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.engine("memory").save("temp_key", "value");
```

> `.config(engineType)` masih didukung sebagai alias backward-compatible.

### <i class="ri-folder-shield-line"></i> `.namespace(name)`

Membuat lapisan isolasi logis di dalam engine saat ini.

```javascript
import store from "@x-labs-myid/omnistorage";

const auth = store.namespace("v1/auth");
await auth.save("token", "xyz123"); // Disimpan sebagai "dbName_v1/auth:token"
```

---

<h2 id="command-payload"><i class="ri-terminal-box-line"></i> JSON Command Runner</h2>

### <i class="ri-braces-line"></i> `.command(payload)` / `.execute(payload)` / `.run(payload)`

Menjalankan operasi storage dari payload command berbentuk objek JSON-compatible.

API ini adalah standar low-level runner untuk integrasi dan Playground. API ini **tidak menggantikan** metode bergaya ORM seperti `.save()`, `.find()`, atau `.truncate()`. Sebaliknya, payload terstruktur akan dipetakan ke operasi yang sama, sehingga gaya payload dan gaya ORM tetap konsisten.

Di dokumentasi, contoh JSON payload ditampilkan sebagai tab **JSON Payload** berdampingan dengan contoh **Basic API** di bagian yang memang praktis untuk dibuat dua versi.

```javascript
import store from "@x-labs-myid/omnistorage";

const result = await store.command({
  engine: "memory",
  dbName: "demo_app",
  namespace: "default",
  operation: "save",
  key: "user:1",
  value: {
    name: "Kang Cahya",
    role: "developer",
    active: true,
  },
});

console.log(result);
```

Padanan dengan gaya ORM-like:

```javascript
const result = await store.db("demo_app").engine("memory").save("user:1", {
  name: "Kang Cahya",
  role: "developer",
  active: true,
});
```

> `.execute(payload)` dan `.run(payload)` adalah alias untuk `.command(payload)`.

### Bentuk Payload

```json
{
  "engine": "memory",
  "dbName": "demo_app",
  "namespace": "default",
  "operation": "save",
  "key": "user:1",
  "value": {
    "name": "Kang Cahya"
  },
  "options": {}
}
```

| Field       |   Wajib    | Deskripsi                                                                                                        |
| :---------- | :--------: | :--------------------------------------------------------------------------------------------------------------- |
| `operation` |     Ya     | Operasi yang akan dijalankan. `action` dan `method` diterima sebagai alias.                                      |
| `engine`    |   Tidak    | Engine penyimpanan. Default mengikuti engine saat ini, yaitu `memory` kecuali diubah dengan `.use()`.            |
| `dbName`    |   Tidak    | Nama database untuk command ini. `database` diterima sebagai alias.                                              |
| `namespace` |   Tidak    | Namespace logis. Default `default`. Nilai selain `default` akan menjalankan operasi di dalam namespace tersebut. |
| `key`       | Tergantung | Wajib untuk operasi satu key seperti `save`, `find`, `delete`, dan `describe`.                                   |
| `value`     | Tergantung | Wajib untuk operasi tulis seperti `save`, `create`, `update`, `insert`, dan `set`.                               |
| `items`     | Tergantung | Object map untuk operasi batch dan payload transaksi JSON.                                                       |
| `keys`      | Tergantung | Array key untuk operasi baca/hapus batch.                                                                        |
| `options`   |   Tidak    | Opsi baca yang diteruskan ke operasi lookup, misalnya `{ "defaultValue": null, "type": "object" }`.              |

### Operasi yang Didukung

| Kategori    | Operasi                                                                       |
| :---------- | :---------------------------------------------------------------------------- |
| Tulis       | `create`, `insert`, `save`, `set`, `update`                                   |
| Baca        | `find`, `findOne`, `get`, `getByKey`, `getById`, `findAll`, `getAll`, `all`   |
| Tulis batch | `saveMany`, `setMany`, `createMany`, `updateMany`                             |
| Baca batch  | `findMany`, `getMany`                                                         |
| Hapus       | `destroy`, `delete`, `remove`, `destroyMany`, `deleteMany`, `removeMany`      |
| Kosongkan   | `truncate`, `clear`                                                           |
| Metadata    | `describe`, `getMeta`, `getStatistic`, `getStatistics`, `statistics`, `stats` |
| Transaksi   | `transaction` dengan object `items` atau JavaScript `callback`                |

`watch` sengaja dibatasi: JSON murni tidak bisa membawa fungsi callback. Gunakan `.watch(key, callback)` secara langsung untuk kebutuhan watcher.

### Format Response

`command()` mengembalikan response normal OmniStorage dan menambahkan objek metadata `command` agar pemanggil dapat melacak operasi yang dieksekusi.

```javascript
{
  ok: true,
  data: {
    name: "Kang Cahya",
    role: "developer",
    active: true
  },
  message: "Upsert successful",
  engine: "memory",
  timestamp: 1717200010000,
  command: {
    operation: "save",
    engine: "memory",
    dbName: "demo_app",
    namespace: "default"
  }
}
```

Error validasi juga dikembalikan sebagai response standar, bukan throw pada penggunaan normal:

```javascript
const result = await store.command({ operation: "save" });

console.log(result.ok); // false
console.log(result.message); // Operation "save" requires a non-empty "key".
```

### Contoh Command Batch

```javascript
await store.command({
  operation: "saveMany",
  engine: "memory",
  dbName: "demo_app",
  namespace: "catalog",
  items: {
    "product:1": { name: "Laptop", price: 1000 },
    "product:2": { name: "Mouse", price: 25 },
  },
});
```

```javascript
await store.command({
  operation: "findMany",
  engine: "memory",
  dbName: "demo_app",
  namespace: "catalog",
  keys: ["product:1", "product:2"],
});
```

### Command dengan Namespace

`namespace` selain `default` otomatis diterapkan ke target command:

```javascript
await store.command({
  operation: "save",
  engine: "local",
  dbName: "my_app",
  namespace: "auth",
  key: "token",
  value: "secure-token-value",
});
```

Padanan dengan gaya ORM-like:

```javascript
await store
  .db("my_app")
  .engine("local")
  .namespace("auth")
  .save("token", "secure-token-value");
```

### Catatan

- `command()` bersifat tambahan dan backward-compatible. Method lama tetap mempertahankan behavior-nya.
- `engine` mengikuti nama engine yang sama dengan `.engine()` dan `.use()`.
- Jika `engine` tidak dikirim, OmniStorage memakai default engine saat ini.
- Jika global `.use()` dan payload `engine` sama-sama ada, `engine` dari payload hanya menang untuk command tersebut.
- Operasi destruktif seperti `delete`, `destroyMany`, `truncate`, dan `clear` langsung dijalankan. Pastikan UI Anda meminta konfirmasi user sebelum mengirim payload tersebut.

---

<h2 id="basic"><i class="ri-settings-4-line"></i> Operasi Dasar</h2>

### <i class="ri-database-2-line"></i> Contoh Struktur Data

Dalam contoh ini, kita menggunakan objek **User** dengan 3 field: `name`, `address`, dan `email`.

```javascript
const userData = {
  name: "Kang Cahya",
  address: "Jawa Barat, Indonesia",
  email: "cahya.dev@random.com",
};
```

### <i class="ri-arrow-left-right-line"></i> Perbandingan Cepat: `create` vs `save`

Sebelum memilih metode, pahami bagaimana keduanya menangani data yang sudah ada:

| Fitur             | `.create()`                                              | `.save()`                                             |
| :---------------- | :------------------------------------------------------- | :---------------------------------------------------- |
| **Tujuan Utama**  | Khusus untuk data baru.                                  | Memastikan data tersimpan (Upsert).                   |
| **Jika Key Ada**  | <i class="ri-error-warning-line"></i> **Gagal** (Error). | <i class="ri-refresh-line"></i> **Update** (Menimpa). |
| **Kasus Terbaik** | ID unik, registrasi.                                     | Pengaturan user, profil.                              |

### <i class="ri-add-circle-line"></i> `.create(key, value)`

Menyimpan data baru. Fungsi ini akan gagal jika key sudah ada di dalam penyimpanan.

:::code-tabs
@tab Basic API

```javascript
import store from "@x-labs-myid/omnistorage";

const userData = {
  name: "Kang Cahya",
  address: "Jawa Barat, Indonesia",
  email: "cahya.dev@random.com",
};

const res = await store.create("user:101", userData);
```

@tab JSON Payload

```javascript
import store from "@x-labs-myid/omnistorage";

const userData = {
  name: "Kang Cahya",
  address: "Jawa Barat, Indonesia",
  email: "cahya.dev@random.com",
};

const res = await store.command({
  operation: "create",
  engine: "memory",
  dbName: "my_app",
  namespace: "default",
  key: "user:101",
  value: userData,
});
```

:::

### <i class="ri-edit-line"></i> `.update(key, value)`

Memperbarui data yang sudah ada. Fungsi ini akan gagal jika key tidak ditemukan.

:::code-tabs
@tab Basic API

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.update("user:101", { name: "Cahya Updated" });
```

@tab JSON Payload

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.command({
  operation: "update",
  engine: "memory",
  key: "user:101",
  value: { name: "Cahya Updated" },
});
```

:::

### <i class="ri-save-3-line"></i> `.save(key, value)`

Operasi _upsert_. Secara otomatis akan memutuskan apakah membuat data baru atau memperbarui yang sudah ada.

:::code-tabs
@tab Basic API

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.save("user:102", {
  name: "Budi",
  address: "Jakarta",
  email: "budi@example.com",
});
```

@tab JSON Payload

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.command({
  operation: "save",
  engine: "memory",
  key: "user:102",
  value: {
    name: "Budi",
    address: "Jakarta",
    email: "budi@example.com",
  },
});
```

:::

**Contoh respon:**

```javascript
{
  ok: true,
  data: { name: "Budi", address: "Jakarta", email: "budi@example.com" },
  message: "Upsert successful",
  engine: "local",
  timestamp: 1717200010000
}
```

---

<h2 id="retrieval"><i class="ri-search-eye-line"></i> Pengambilan Data</h2>

### <i class="ri-find-replace-line"></i> `.find(key, options?)` / `.findOne(key, options?)`

Mengambil satu entri data. `.findOne`, `.get`, `.getByKey`, dan `.getById` adalah alias untuk perilaku pencarian yang sama.

:::code-tabs
@tab Basic API

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.find("user:101", {
  defaultValue: null,
  type: "object",
});
```

@tab JSON Payload

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.command({
  operation: "find",
  engine: "memory",
  key: "user:101",
  options: {
    defaultValue: null,
    type: "object",
  },
});
```

:::

### <i class="ri-list-check"></i> `.findAll()` / `.getAll()`

Mengambil semua data dalam database atau namespace saat ini.

:::code-tabs
@tab Basic API

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.findAll();
```

@tab JSON Payload

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.command({
  operation: "findAll",
  engine: "memory",
});
```

:::

### <i class="ri-stack-line"></i> `.findMany(keys, options?)` / `.getMany(keys, options?)`

Mengambil banyak entri berdasarkan daftar key.

:::code-tabs
@tab Basic API

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.findMany(["user:101", "user:102"]);
```

@tab JSON Payload

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.command({
  operation: "findMany",
  engine: "memory",
  keys: ["user:101", "user:102"],
});
```

:::

---

<h2 id="deletion"><i class="ri-delete-bin-line"></i> Penghapusan</h2>

### <i class="ri-close-circle-line"></i> `.destroy(key)` / `.delete(key)` / `.remove(key)`

Menghapus satu entri data berdasarkan key.

:::code-tabs
@tab Basic API

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.destroy("user:101");
```

@tab JSON Payload

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.command({
  operation: "destroy",
  engine: "memory",
  key: "user:101",
});
```

:::

### <i class="ri-eraser-line"></i> `.truncate()` / `.clear()`

Menghapus semua data dalam database atau namespace saat ini.

:::code-tabs
@tab Basic API

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.truncate();
```

@tab JSON Payload

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.command({
  operation: "truncate",
  engine: "memory",
});
```

:::

---

<h2 id="batch"><i class="ri-stack-line"></i> Operasi Batch</h2>

Memproses banyak item secara efisien dalam satu panggilan.

### `.saveMany(items)` / `.setMany(items)`

_Upsert_ banyak item sekaligus.

:::code-tabs
@tab Basic API

```javascript
import store from "@x-labs-myid/omnistorage";

await store.saveMany({
  key1: "value1",
  key2: { id: 2 },
});
```

@tab JSON Payload

```javascript
import store from "@x-labs-myid/omnistorage";

await store.command({
  operation: "saveMany",
  engine: "memory",
  items: {
    key1: "value1",
    key2: { id: 2 },
  },
});
```

:::

### `.createMany(items)`

_Insert_ banyak item sekaligus. Key yang sudah ada akan dilaporkan gagal.

:::code-tabs
@tab Basic API

```javascript
import store from "@x-labs-myid/omnistorage";

await store.createMany({
  "user:201": { name: "Ayu" },
  "user:202": { name: "Dina" },
});
```

@tab JSON Payload

```javascript
import store from "@x-labs-myid/omnistorage";

await store.command({
  operation: "createMany",
  engine: "memory",
  items: {
    "user:201": { name: "Ayu" },
    "user:202": { name: "Dina" },
  },
});
```

:::

### `.updateMany(items)`

_Update_ banyak item sekaligus. Key yang tidak ditemukan akan dilaporkan gagal.

:::code-tabs
@tab Basic API

```javascript
import store from "@x-labs-myid/omnistorage";

await store.updateMany({
  "user:201": { name: "Ayu Updated" },
  "user:202": { name: "Dina Updated" },
});
```

@tab JSON Payload

```javascript
import store from "@x-labs-myid/omnistorage";

await store.command({
  operation: "updateMany",
  engine: "memory",
  items: {
    "user:201": { name: "Ayu Updated" },
    "user:202": { name: "Dina Updated" },
  },
});
```

:::

### `.destroyMany(keys)` / `.deleteMany(keys)`

Menghapus banyak item berdasarkan key.

:::code-tabs
@tab Basic API

```javascript
import store from "@x-labs-myid/omnistorage";

await store.destroyMany(["user:201", "user:202"]);
```

@tab JSON Payload

```javascript
import store from "@x-labs-myid/omnistorage";

await store.command({
  operation: "destroyMany",
  engine: "memory",
  keys: ["user:201", "user:202"],
});
```

:::

---

<h2 id="advanced"><i class="ri-rocket-2-line"></i> Fitur Lanjutan</h2>

### <i class="ri-eye-line"></i> `.watch(key, callback)`

Memantau perubahan pada key tertentu. Mengembalikan fungsi `unwatch`.

```javascript
import store from "@x-labs-myid/omnistorage";

const unwatch = store.watch("user:101", (newValue, oldValue) => {
  console.log("Data berubah!", { newValue, oldValue });
});

unwatch();
```

### <i class="ri-flashlight-line"></i> `.on(event, callback)`

Hook global untuk operasi penyimpanan. Event yang didukung: `onSet`, `onGet`, `onDelete`, `onClear`.

```javascript
import store from "@x-labs-myid/omnistorage";

store.on("onSet", (data) => {
  console.log(`Tersimpan di ${data.engine}: ${data.key}`);
});
```

### <i class="ri-exchange-funds-line"></i> `.transaction(callback)`

Eksekusi banyak operasi dalam blok bergaya transaksi.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.transaction(async (trx) => {
  await trx.create("trx:1", "Nilai A");
  await trx.save("trx:2", "Nilai B");
});
```

### <i class="ri-information-line"></i> `.describe(key)` / `.getMeta(key)`

Mengambil metadata untuk key tertentu, seperti estimasi ukuran dalam bytes dan engine yang digunakan.

```javascript
import store from "@x-labs-myid/omnistorage";

const meta = await store.describe("user:101");
console.log(meta.data.size);
```

### <i class="ri-bar-chart-box-line"></i> `.getStatistic(name?)` / `.getStatistics()`

Mengambil statistik penggunaan penyimpanan. Lihat [Log & Statistik](logs-stats.md) untuk detail log aktivitas.

```javascript
import store from "@x-labs-myid/omnistorage";

const allStats = await store.getStatistics();
const localStats = await store.getStatistic("local");
```

### <i class="ri-file-list-3-line"></i> `.getActivityLogs(limit?)`, `.getLogs(limit?)`, `.clearActivityLogs()`

Membaca atau menghapus log aktivitas OmniStorage.

```javascript
import store from "@x-labs-myid/omnistorage";

const logs = await store.getActivityLogs(50);
await store.clearActivityLogs();
```
