# <i class="ri-history-line"></i> Logs & Statistics

Monitor your storage activity and get detailed usage insights.

---

## <i class="ri-history-line"></i> Activity Logging

`OmniStorage` automatically tracks every activity (create, update, delete, etc.) performed on the storage using an internal SQLite database.

#### `.getActivityLogs(limit)`

Returns a detailed history of storage operations. The `limit` parameter is optional (default: 100).

```javascript
const res = await store.getActivityLogs(10);
console.log(res.data);
```

**Response Example:**

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

Permanently deletes all recorded logs from the internal database.

```javascript
await store.clearActivityLogs();
```

---

## <i class="ri-bar-chart-box-line"></i> Storage Statistics

Get real-time insights about your storage usage across different engines.

#### `.getStatistics()`

Retrieves combined statistics for all available engines.

```javascript
const stats = await store.getStatistics();
```

**Response Example:**

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

Retrieves statistics for a specific storage engine.

```javascript
const localStats = await store.getStatistic("local");
```

**Response Example:**

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
