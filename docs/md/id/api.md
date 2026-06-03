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

```javascript
import store from "@x-labs-myid/omnistorage";

store.use("session"); // local, session, cookie, cache, memory, file, indexeddb, sqlite-server, sqlite-client
```

### <i class="ri-equalizer-line"></i> `.config(engineType)`

Beralih sementara ke engine tertentu untuk serangkaian operasi tanpa mengubah default global.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.config("memory").save("temp_key", "value");
```

### <i class="ri-folder-shield-line"></i> `.namespace(name)`

Membuat lapisan isolasi logis di dalam engine saat ini.

```javascript
import store from "@x-labs-myid/omnistorage";

const auth = store.namespace("v1/auth");
await auth.save("token", "xyz123"); // Disimpan sebagai "dbName_v1/auth:token"
```

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

| Fitur | `.create()` | `.save()` |
| :--- | :--- | :--- |
| **Tujuan Utama** | Khusus untuk data baru. | Memastikan data tersimpan (Upsert). |
| **Jika Key Ada** | <i class="ri-error-warning-line"></i> **Gagal** (Error). | <i class="ri-refresh-line"></i> **Update** (Menimpa). |
| **Kasus Terbaik** | ID unik, registrasi. | Pengaturan user, profil. |

### <i class="ri-add-circle-line"></i> `.create(key, value)`

Menyimpan data baru. Fungsi ini akan gagal jika key sudah ada di dalam penyimpanan.

```javascript
import store from "@x-labs-myid/omnistorage";

const userData = {
  name: "Kang Cahya",
  address: "Jawa Barat, Indonesia",
  email: "cahya.dev@random.com",
};

const res = await store.create("user:101", userData);
```

### <i class="ri-edit-line"></i> `.update(key, value)`

Memperbarui data yang sudah ada. Fungsi ini akan gagal jika key tidak ditemukan.

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.update("user:101", { name: "Cahya Updated" });
```

### <i class="ri-save-3-line"></i> `.save(key, value)`

Operasi _upsert_. Secara otomatis akan memutuskan apakah membuat data baru atau memperbarui yang sudah ada.

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.save("user:102", {
  name: "Budi",
  address: "Jakarta",
  email: "budi@example.com",
});
```

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

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.find("user:101", {
  defaultValue: null,
  type: "object",
});
```

### <i class="ri-list-check"></i> `.findAll()` / `.getAll()`

Mengambil semua data dalam database atau namespace saat ini.

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.findAll();
```

### <i class="ri-stack-line"></i> `.findMany(keys, options?)` / `.getMany(keys, options?)`

Mengambil banyak entri berdasarkan daftar key.

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.findMany(["user:101", "user:102"]);
```

---

<h2 id="deletion"><i class="ri-delete-bin-line"></i> Penghapusan</h2>

### <i class="ri-close-circle-line"></i> `.destroy(key)` / `.delete(key)` / `.remove(key)`

Menghapus satu entri data berdasarkan key.

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.destroy("user:101");
```

### <i class="ri-eraser-line"></i> `.truncate()` / `.clear()`

Menghapus semua data dalam database atau namespace saat ini.

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.truncate();
```

---

<h2 id="batch"><i class="ri-stack-line"></i> Operasi Batch</h2>

Memproses banyak item secara efisien dalam satu panggilan.

### `.saveMany(items)` / `.setMany(items)`

_Upsert_ banyak item sekaligus.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.saveMany({
  key1: "value1",
  key2: { id: 2 },
});
```

### `.createMany(items)`

_Insert_ banyak item sekaligus. Key yang sudah ada akan dilaporkan gagal.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.createMany({
  "user:201": { name: "Ayu" },
  "user:202": { name: "Dina" },
});
```

### `.updateMany(items)`

_Update_ banyak item sekaligus. Key yang tidak ditemukan akan dilaporkan gagal.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.updateMany({
  "user:201": { name: "Ayu Updated" },
  "user:202": { name: "Dina Updated" },
});
```

### `.destroyMany(keys)` / `.deleteMany(keys)`

Menghapus banyak item berdasarkan key.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.destroyMany(["user:201", "user:202"]);
```

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
