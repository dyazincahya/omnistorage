# <i class="ri-history-line"></i> Log & Statistik

Pantau aktivitas penyimpanan Anda dan dapatkan wawasan penggunaan yang mendetail.

---

## <i class="ri-history-line"></i> Log Aktivitas (Logging)

`OmniStorage` secara otomatis melacak setiap aktivitas (create, update, delete, dll) yang dilakukan pada penyimpanan menggunakan database SQLite internal.

#### `.getActivityLogs(limit)`

Mengembalikan riwayat detail operasi penyimpanan. Parameter `limit` bersifat opsional (default: 100).

```javascript
const res = await store.getActivityLogs(10);
console.log(res.data);
```

**Contoh Respon:**

```javascript
{
  "ok": true,
  "message": "Activity logs retrieved",
  "data": [
    {
      "id": 42,
      "timestamp": "2024-06-01 10:00:00",
      "operation": "save",
      "engine": "local",
      "key": "user:101",
      "namespace": "v1/auth",
      "status": "success",
      "message": ""
    },
    {
      "id": 41,
      "timestamp": "2024-06-01 09:55:21",
      "operation": "create",
      "engine": "memory",
      "key": "temp_session",
      "namespace": "default",
      "status": "error",
      "message": "Already exists"
    }
  ]
}
```

#### `.clearActivityLogs()`

Menghapus semua log yang tercatat secara permanen dari database internal.

```javascript
await store.clearActivityLogs();
```

---

## <i class="ri-bar-chart-box-line"></i> Statistik Penyimpanan

Dapatkan wawasan real-time tentang penggunaan penyimpanan Anda di berbagai engine.

#### `.getStatistics()`

Mengambil statistik gabungan untuk semua engine yang tersedia.

```javascript
const stats = await store.getStatistics();
```

**Contoh Respon:**

```javascript
{
  "ok": true,
  "data": {
    "local": {
      "engine": "local",
      "dbName": "MyStore",
      "totalKeys": 15,
      "totalSize": 2048,
      "totalSizeFormatted": "2.00 KB"
    },
    "memory": {
      "engine": "memory",
      "dbName": "MyStore",
      "totalKeys": 5,
      "totalSize": 512,
      "totalSizeFormatted": "0.50 KB"
    },
    "indexeddb": {
      "engine": "indexeddb",
      "dbName": "MyStore",
      "totalKeys": 120,
      "totalSize": 1048576,
      "totalSizeFormatted": "1024.00 KB"
    }
  }
}
```

#### `.getStatistic(engineName)`

Mengambil statistik untuk engine penyimpanan tertentu.

```javascript
const localStats = await store.getStatistic("local");
```

**Contoh Respon:**

```javascript
{
  "ok": true,
  "engine": "local",
  "data": {
    "engine": "local",
    "dbName": "MyStore",
    "totalKeys": 15,
    "totalSize": 2048,
    "totalSizeFormatted": "2.00 KB"
  }
}
```
