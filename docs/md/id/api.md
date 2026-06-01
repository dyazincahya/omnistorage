# <i class="ri-braces-line"></i> Referensi API (Gaya ORM)

Gunakan metode yang familiar untuk mengelola data Anda. Semua operasi mengembalikan objek respon standar.

## <i class="ri-database-2-line"></i> Contoh Struktur Data

Dalam contoh ini, kita menggunakan objek **User** dengan 3 kolom: `name`, `address`, dan `email`.

```javascript
const userData = {
  name: "Kang Cahya",
  address: "Jawa Barat, Indonesia",
  email: "cahya.dev@random.com",
};
```

---

<h2 id="config"><i class="ri-settings-4-line"></i> Konfigurasi & Namespacing</h2>

### <i class="ri-database-2-line"></i> `.db(name)`

Mengatur nama database global. Ini bertindak sebagai nama database fisik di IndexedDB atau prefix global pada engine lainnya.

```javascript
store.db("my_app");
```

### <i class="ri-plug-line"></i> `.use(engineType)`

Mengatur engine penyimpanan default secara global.

```javascript
store.use("session"); // local, session, memory, file, indexeddb, sqlite-server, sqlite-client
```

### <i class="ri-equalizer-line"></i> `.config(engineType)`

Beralih sementara ke engine tertentu untuk serangkaian operasi tanpa mengubah default global.

```javascript
await store.config("memory").save("temp_key", "value");
```

### <i class="ri-folder-shield-line"></i> `.namespace(name)`

Membuat lapisan isolasi logis di dalam engine saat ini.

```javascript
const auth = store.namespace("v1/auth");
await auth.save("token", "xyz123"); // Disimpan sebagai "dbName_v1/auth:token"
```

---

<h2 id="basic"><i class="ri-settings-4-line"></i> Operasi Dasar</h2>

### <i class="ri-arrow-left-right-line"></i> Perbandingan Cepat: `create` vs `save`

Sebelum memilih metode, pahami bagaimana keduanya menangani data yang sudah ada:

| Fitur             | `.create()`                                              | `.save()`                                             |
| :---------------- | :------------------------------------------------------- | :---------------------------------------------------- |
| **Tujuan Utama**  | Khusus untuk data baru.                                  | Memastikan data tersimpan (Upsert).                   |
| **Jika Key Ada**  | <i class="ri-error-warning-line"></i> **Gagal** (Error). | <i class="ri-refresh-line"></i> **Update** (Menimpa). |
| **Kasus Terbaik** | ID Unik, Registrasi.                                     | Pengaturan User, Profil.                              |

---

### <i class="ri-add-circle-line"></i> `.create(key, value)`

Menyimpan data baru. Fungsi ini akan gagal jika key sudah ada di dalam penyimpanan.

**Contoh:**

```javascript
const res = await store.create("user:101", userData);
```

**Respon:**

```javascript
{
  ok: true,
  data: { name: "Kang Cahya", address: "Jawa Barat, Indonesia", email: "cahya.dev@random.com" },
  message: "Data created successfully",
  engine: "local",
  timestamp: 1717200000000
}
```

### <i class="ri-edit-line"></i> `.update(key, value)`

Memperbarui data yang sudah ada. Fungsi ini akan gagal jika key tidak ditemukan.

**Contoh:**

```javascript
const res = await store.update("user:101", { name: "Cahya Updated" });
```

**Respon:**

```javascript
{
  ok: true,
  data: { name: "Kang Cahya Updated", address: "Jawa Barat, Indonesia", email: "cahya.dev@random.com" },
  message: "Data updated successfully",
  engine: "local",
  timestamp: 1717200005000
}
```

### <i class="ri-save-3-line"></i> `.save(key, value)`

Operasi _upsert_. Secara otomatis akan memutuskan apakah akan membuat data baru atau memperbarui yang sudah ada.

**Contoh:**

```javascript
const res = await store.save("user:102", {
  name: "Budi",
  address: "Jakarta",
  email: "budi@example.com",
});
```

**Respon:**

```javascript
{
  ok: true,
  data: { name: "Budi", address: "Jakarta", email: "budi@example.com" },
  message: "Data saved successfully",
  engine: "local",
  timestamp: 1717200010000
}
```

---

<h2 id="retrieval"><i class="ri-search-eye-line"></i> Pengambilan Data</h2>

### <i class="ri-find-replace-line"></i> `.find(key, options?)` / `.findOne(key, options?)`

Mengambil satu entri data. `.findOne` adalah alias untuk `.find`.

**Contoh:**

```javascript
const res = await store.find("user:101");
```

**Respon:**

```javascript
{
  ok: true,
  data: { name: "Kang Cahya Updated", address: "Jawa Barat, Indonesia", email: "cahya.dev@random.com" },
  message: "Success",
  engine: "local",
  timestamp: 1717200015000
}
```

### <i class="ri-list-check"></i> `.findAll()`

Mengambil semua data dalam database atau namespace saat ini.

**Respon:**

```javascript
{
  ok: true,
  data: [
    { key: "user:101", value: { ... } },
    { key: "user:102", value: { ... } }
  ],
  message: "2 items found",
  engine: "local",
  timestamp: 1717200020000
}
```

---

<h2 id="deletion"><i class="ri-delete-bin-line"></i> Penghapusan</h2>

### <i class="ri-close-circle-line"></i> `.destroy(key)`

Menghapus satu entri data berdasarkan kuncinya.

**Respon:**

```javascript
{
  ok: true,
  data: null,
  message: "Item deleted",
  engine: "local"
}
```

### <i class="ri-eraser-line"></i> `.truncate()`

Menghapus semua data dalam database atau namespace saat ini.

**Respon:**

```javascript
{
  ok: true,
  data: null,
  message: "Storage cleared",
  engine: "local"
}
```

---

<h2 id="batch"><i class="ri-stack-line"></i> Operasi Batch</h2>

Memproses banyak item secara efisien dalam satu panggilan.

### `.saveMany(items)`

_Upsert_ banyak item sekaligus.

```javascript
await store.saveMany({
  key1: "value1",
  key2: { id: 2 },
});
```

### `.createMany(items)`

_Insert_ banyak item sekaligus. Gagal untuk key yang sudah ada.

### `.updateMany(items)`

_Update_ banyak item sekaligus. Gagal untuk key yang tidak ditemukan.

### `.findMany(keys)`

Mengambil banyak item sekaligus berdasarkan key mereka.

```javascript
const res = await store.findMany(["key1", "key2"]);
// res.data = { "key1": "value1", "key2": { "id": 2 } }
```

### `.destroyMany(keys)`

Menghapus banyak item sekaligus berdasarkan key mereka.

---

<h2 id="advanced"><i class="ri-rocket-2-line"></i> Fitur Lanjutan</h2>

### <i class="ri-eye-line"></i> `.watch(key, callback)`

Memantau perubahan pada key tertentu. Mengembalikan fungsi `unwatch`.

```javascript
const unwatch = store.watch("user:101", (newValue, oldValue) => {
  console.log("Data berubah!", newValue);
});

// Untuk berhenti memantau:
unwatch();
```

### <i class="ri-flashlight-line"></i> `.on(event, callback)`

Hook global untuk operasi penyimpanan. Event yang didukung: `onSet`, `onGet`, `onDelete`, `onClear`.

```javascript
store.on("onSet", (data) => {
  console.log(`Tersimpan di ${data.engine}: ${data.key}`);
});
```

### <i class="ri-exchange-funds-line"></i> `.transaction(callback)`

Eksekusi banyak operasi dalam satu blok.

```javascript
await store.transaction(async (trx) => {
  await trx.create("trx:1", "Nilai A");
  await trx.save("trx:2", "Nilai B");
});
```

### <i class="ri-information-line"></i> `.describe(key)`

Mengambil metadata untuk key tertentu (misalnya, ukuran dalam bytes, engine yang digunakan).

```javascript
const meta = await store.describe("user:101");
console.log(meta.data.size);
```

### <i class="ri-bar-chart-box-line"></i> `.getStatistics()` / `.getStatistic(name)`

Mengambil statistik penggunaan penyimpanan. Lihat [Log & Statistik](logs-stats.md) untuk detail lebih lanjut.
