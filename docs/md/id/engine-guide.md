# <i class="ri-compass-3-line"></i> Panduan Engine

Halaman ini menjelaskan bagaimana OmniStorage memilih engine default, cara mengganti engine, dan cara menentukan engine yang cocok untuk use case tertentu.

## <i class="ri-radar-line"></i> Engine Default

Secara default, OmniStorage menggunakan `sqlite` ketika tidak ada engine yang dipilih secara global dengan `.use()` atau secara lokal dengan `.engine()`.

`sqlite` bersifat runtime-aware: otomatis menjadi `sqlite-server` di runtime Node.js/server dan `sqlite-client` di runtime browser/client. Gunakan `.use(engineType)` jika ingin default global yang berbeda.

Prioritas engine adalah:

1. Engine lokal dari `.engine(engineType)`
2. Engine global dari `.use(engineType)`
3. Fallback bawaan: `sqlite`

## <i class="ri-arrow-left-right-line"></i> Mengganti Engine

Anda dapat mengganti engine secara global atau hanya untuk rangkaian operasi tertentu.

### Engine global

Gunakan `.use(engineType)` ketika semua operasi berikutnya ingin menggunakan engine yang sama secara default.

```javascript
import store from "@x-labs-myid/omnistorage";

store.use("indexeddb");

await store.save("profile", {
  name: "Kang Cahya",
  role: "developer",
});
```

### Engine per operasi

Gunakan `.engine(engineType)` ketika hanya ingin memakai engine tertentu secara sementara.

```javascript
import store from "@x-labs-myid/omnistorage";

const users = [{ id: 1, name: "Cahya" }];

await store.engine("session").save("checkout_step", 2);
await store.engine("cookie").save("locale", "id");
await store.engine("cache").save("users_snapshot", users);
```

Ini berguna ketika satu aplikasi membutuhkan perilaku penyimpanan berbeda untuk jenis data yang berbeda.

> `.config(engineType)` masih tersedia sebagai alias backward-compatible untuk `.engine(engineType)`.

## <i class="ri-database-2-line"></i> Nama Database dan Namespacing

Pemilihan engine dapat dikombinasikan dengan `.db()` dan `.namespace()`.

```javascript
import store from "@x-labs-myid/omnistorage";

store.db("my_app").use("indexeddb");

const authStore = store.namespace("auth");
await authStore.save("user", { id: 1, name: "Cahya" });
```

Perilaku umum:

- Pada `local`, `session`, `cookie`, `cache`, `memory`, dan `file`, `dbName` berfungsi sebagai prefix global key.
- Pada engine seperti `indexeddb`, `sqlite-server`, dan `sqlite-client`, `dbName` digunakan sebagai nama database fisik atau scope database.
- Data IndexedDB memakai object store `omnistorage_kv`, sedangkan data SQLite memakai table `omnistorage_kv`.
- Untuk engine SQLite, jika `dbName` mengarah ke database existing, OmniStorage akan memakainya dan hanya membuat table OmniStorage jika belum ada. Jika database belum tersedia, SQLite akan membuatnya.
- `namespace()` menambahkan lapisan logis lain untuk mengelompokkan key berdasarkan fitur atau modul.

## <i class="ri-route-line"></i> Memilih Engine yang Tepat

Gunakan panduan singkat ini sebagai titik awal:

| Kebutuhan                                                     | Engine yang Disarankan |
| :------------------------------------------------------------ | :--------------------- |
| Preferensi browser kecil yang persisten                       | `local`                |
| State sementara untuk tab saat ini                            | `session`              |
| Nilai browser sangat kecil yang mungkin perlu terlihat server | `cookie`               |
| Snapshot API atau cache offline-friendly                      | `cache`                |
| Data terstruktur lebih besar di browser                       | `indexeddb`            |
| Cache runtime sementara, test, atau demo                      | `memory`               |
| Persistensi disk sederhana di Node.js                         | `file`                 |
| Penyimpanan durable Node.js dengan reliabilitas database      | `sqlite-server`        |
| Perilaku mirip SQLite di browser                              | `sqlite-client`        |

## <i class="ri-lightbulb-line"></i> Contoh Praktis

### Preferensi pengguna

```javascript
import store from "@x-labs-myid/omnistorage";

store.use("local");
await store.save("theme", "dark");
await store.save("language", "id");
```

### Alur checkout sementara

```javascript
import store from "@x-labs-myid/omnistorage";

await store.engine("session").save("checkout", {
  step: 2,
  selectedShipping: "regular",
});
```

### Flag locale browser

```javascript
import store from "@x-labs-myid/omnistorage";

await store.engine("cookie").save("locale", "id");
```

### Snapshot API offline

```javascript
import store from "@x-labs-myid/omnistorage";

const products = [
  { id: 1, name: "Keyboard" },
  { id: 2, name: "Mouse" },
];

await store.engine("cache").save("products", products);
```

### Dataset besar di browser

```javascript
import store from "@x-labs-myid/omnistorage";

const catalogItems = [
  { sku: "SKU-001", name: "Laptop" },
  { sku: "SKU-002", name: "Monitor" },
];

store.use("indexeddb");
await store.save("catalog", catalogItems);
```

### Penyimpanan durable sisi server

```javascript
import store from "@x-labs-myid/omnistorage";

const invoiceData = {
  id: "INV-001",
  total: 125000,
  status: "paid",
};

store.use("sqlite");
await store.save("invoice:INV-001", invoiceData);
```

## <i class="ri-error-warning-line"></i> Catatan Keamanan dan Ukuran Data

- Jangan menyimpan password, private token, atau secret sensitif pada engine yang bisa dibaca JavaScript di browser.
- Gunakan `cookie` hanya untuk nilai kecil; cookie umumnya terbatas sekitar 4 KB per cookie.
- Gunakan `cache` dan `indexeddb` untuk data browser yang lebih besar.
- Gunakan engine server-side seperti `file` atau `sqlite-server` ketika data tidak boleh terekspos ke JavaScript sisi client.
