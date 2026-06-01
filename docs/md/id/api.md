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

## <i class="ri-settings-4-line"></i> Operasi Dasar

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

## <i class="ri-search-eye-line"></i> Pengambilan Data

### <i class="ri-find-replace-line"></i> `.find(key, options?)`

Mengambil satu entri data. Anda dapat memberikan opsi untuk memvalidasi tipe data yang dikembalikan.

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

## <i class="ri-delete-bin-line"></i> Penghapusan

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

## <i class="ri-rocket-2-line"></i> Fitur Lanjutan

### <i class="ri-eye-line"></i> `.watch(key, callback)`

Memantau perubahan pada key tertentu. Mengembalikan fungsi `unwatch`.
