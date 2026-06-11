# <i class="ri-braces-line"></i> Referensi API (Gaya ORM)

Gunakan metode yang familiar untuk mengelola data Anda. Semua operasi async mengembalikan objek respon standar.

<h2 id="config"><i class="ri-settings-4-line"></i> Konfigurasi & Namespacing</h2>

<h3 id="init"><i class="ri-rocket-line"></i> <code>.init(options)</code></h3>

Menginisialisasi konfigurasi global store di satu tempat. Ini cocok dipakai di `app.js` atau file bootstrap sebelum operasi storage pertama.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.init({
  db: {
    name: "omnistorage",
    engine: "sqlite",
  },
  logs: "auto",
});
```

Padanan dengan setup chainable:

```javascript
store
  .use({
    db: {
      name: "omnistorage",
      engine: "sqlite",
    },
  })
  .configureLogs("auto");
```

| Opsi        | Wajib | Deskripsi                                                                                                                                        |
| :---------- | :---: | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| `db`        | Tidak | Object konfigurasi database. Default `{ name: "omnistorage", engine: "sqlite" }`.                                                                |
| `db.name`   | Tidak | Nama database global. Default `omnistorage`.                                                                                                     |
| `db.engine` | Tidak | Engine storage default. Nilai: `local`, `session`, `cookie`, `cache`, `memory`, `file`, `indexeddb`, `sqlite`, `sqlite-client`, `sqlite-server`. |
| `logs`      | Tidak | Mode log: `auto`, `client`, `server`, atau `{ mode: "auto" }`.                                                                                   |

> `sqlite` adalah engine database default dan otomatis menjadi `sqlite-client` di browser atau `sqlite-server` di Node.js.

> `.init()` bersifat tambahan. Pemanggilan `.db()`, `.use()`, dan `.configureLogs()` tetap didukung.

<h3 id="db"><i class="ri-database-2-line"></i> <code>.db(name)</code></h3>

Mengatur nama database global. Ini bertindak sebagai nama database fisik di IndexedDB atau prefix global pada engine lainnya.

```javascript
import store from "@x-labs-myid/omnistorage";

store.db("my_app");
```

<h3 id="use"><i class="ri-plug-line"></i> <code>.use(config)</code></h3>

Mengatur nama database global dan engine penyimpanan default. Anda bisa mengirim string engine saja untuk kasus sederhana, atau object konfigurasi database yang lebih semantik ketika mengatur keduanya.

> Jika tidak ada engine global yang diatur dengan `.use()` dan tidak ada engine lokal yang dipilih dengan `.engine()`, OmniStorage menggunakan `sqlite` secara default dan otomatis memilih `sqlite-client` atau `sqlite-server` sesuai runtime.

```javascript
import store from "@x-labs-myid/omnistorage";

store.use("sqlite"); // setup sederhana hanya untuk engine

store.use({
  db: {
    name: "omnistorage",
    engine: "sqlite",
  },
});
```

Engine yang tersedia: `local`, `session`, `cookie`, `cache`, `memory`, `file`, `indexeddb`, `sqlite`, `sqlite-server`, `sqlite-client`.

<h3 id="engine"><i class="ri-equalizer-line"></i> <code>.engine(engineType)</code></h3>

Beralih sementara ke engine tertentu untuk serangkaian operasi tanpa mengubah default global.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.engine("memory").save("temp_key", "value");
```

> `.config(engineType)` masih didukung sebagai alias backward-compatible.

<h3 id="namespace"><i class="ri-folder-shield-line"></i> <code>.namespace(name)</code></h3>

Membuat lapisan isolasi logis di dalam engine saat ini.

```javascript
import store from "@x-labs-myid/omnistorage";

const auth = store.namespace("v1/auth");
await auth.save("token", "xyz123"); // Disimpan sebagai "dbName_v1/auth:token"
```

---

<h2 id="command-payload"><i class="ri-terminal-box-line"></i> JSON Command Runner</h2>

<h3 id="command"><i class="ri-braces-line"></i> <code>.command(payload)</code> / <code>.execute(payload)</code> / <code>.run(payload)</code></h3>

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
| `engine`    |   Tidak    | Engine penyimpanan. Default mengikuti engine saat ini, yaitu `sqlite` kecuali diubah dengan `.use()`.            |
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

<h3 id="create"><i class="ri-add-circle-line"></i> <code>.create(key, value)</code></h3>

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

<h3 id="update"><i class="ri-edit-line"></i> <code>.update(key, value)</code></h3>

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

<h3 id="save"><i class="ri-save-3-line"></i> <code>.save(key, value)</code></h3>

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

<h3 id="find"><i class="ri-find-replace-line"></i> <code>.find(key, options?)</code> / <code>.findOne(key, options?)</code></h3>

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

<h3 id="findAll"><i class="ri-list-check"></i> <code>.findAll()</code> / <code>.getAll()</code></h3>

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

<h3 id="findMany"><i class="ri-stack-line"></i> <code>.findMany(keys, options?)</code> / <code>.getMany(keys, options?)</code></h3>

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

<h3 id="destroy"><i class="ri-close-circle-line"></i> <code>.destroy(key)</code> / <code>.delete(key)</code> / <code>.remove(key)</code></h3>

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

<h3 id="truncate"><i class="ri-eraser-line"></i> <code>.truncate()</code> / <code>.clear()</code></h3>

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

<h3 id="saveMany"><code>.saveMany(items)</code> / <code>.setMany(items)</code></h3>

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

<h3 id="createMany"><code>.createMany(items)</code></h3>

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

<h3 id="updateMany"><code>.updateMany(items)</code></h3>

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

<h3 id="destroyMany"><code>.destroyMany(keys)</code> / <code>.deleteMany(keys)</code></h3>

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

<h3 id="watch"><i class="ri-eye-line"></i> <code>.watch(key, callback)</code></h3>

Memantau perubahan pada key tertentu. Mengembalikan fungsi `unwatch`.

```javascript
import store from "@x-labs-myid/omnistorage";

const unwatch = store.watch("user:101", (newValue, oldValue) => {
  console.log("Data berubah!", { newValue, oldValue });
});

unwatch();
```

<h3 id="on"><i class="ri-flashlight-line"></i> <code>.on(event, callback)</code></h3>

Hook global untuk operasi penyimpanan. Event yang didukung: `onSet`, `onGet`, `onDelete`, `onClear`.

```javascript
import store from "@x-labs-myid/omnistorage";

store.on("onSet", (data) => {
  console.log(`Tersimpan di ${data.engine}: ${data.key}`);
});
```

<h3 id="transaction"><i class="ri-exchange-funds-line"></i> <code>.transaction(callback)</code></h3>

Eksekusi banyak operasi dalam blok bergaya transaksi.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.transaction(async (trx) => {
  await trx.create("trx:1", "Nilai A");
  await trx.save("trx:2", "Nilai B");
});
```

<h3 id="describe"><i class="ri-information-line"></i> <code>.describe(key)</code> / <code>.getMeta(key)</code></h3>

Mengambil metadata untuk key tertentu, seperti estimasi ukuran dalam bytes dan engine yang digunakan.

```javascript
import store from "@x-labs-myid/omnistorage";

const meta = await store.describe("user:101");
console.log(meta.data.size);
```

<h3 id="getStatistics"><i class="ri-bar-chart-box-line"></i> <code>.getStatistic(name?)</code> / <code>.getStatistics()</code></h3>

Mengambil statistik penggunaan penyimpanan. Lihat [Log & Statistik](logs-stats.md) untuk detail log aktivitas.

```javascript
import store from "@x-labs-myid/omnistorage";

const allStats = await store.getStatistics();
const localStats = await store.getStatistic("local");
```

<h3 id="getActivityLogs"><i class="ri-file-list-3-line"></i> <code>.getActivityLogs(limit?)</code>, <code>.getLogs(limit?)</code>, <code>.clearActivityLogs()</code></h3>

Membaca atau menghapus log aktivitas OmniStorage.

```javascript
import store from "@x-labs-myid/omnistorage";

const logs = await store.getActivityLogs(50);
await store.clearActivityLogs();
```
