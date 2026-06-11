# <i class="ri-history-line"></i> Logs & Statistics

Monitor storage activity and measure data usage across engines. This page follows the **API Reference** style: each method includes its signature, parameters, usage examples, and response shape.

---

## <i class="ri-history-line"></i> Activity Logging

`OmniStorage` records write/delete activity performed through the storage API, such as `create`, `save`, `update`, `destroy`, and `truncate`. Logs are stored in SQLite in the `omnistorage_logs` table by default.

Logs are useful for lightweight auditing, debugging, or inspecting operation history while the app is running.

### Default Behavior

By default, logging uses the `auto` engine mode:

1. Node.js/server runtimes use `sqlite-server` (`better-sqlite3`).
2. Browser/client runtimes use `sqlite-client` (`@sqlite.org/sqlite-wasm`).
3. Projects that include both client and server code keep the browser bundle on `sqlite-client`, so Vite/client builds do not pull in `better-sqlite3` or Node.js modules.
4. In test runtime, `auto` resolves to `sqlite-server`.

> Logging is not a full production audit system. For compliance, backup, retention, or log encryption requirements, add an appropriate server-side mechanism.

---

## <i class="ri-settings-4-line"></i> Log Configuration

<h3 id="configure-logs"><i class="ri-tools-line"></i> <code>.configureLogs(config)</code></h3>

Configures the SQLite mode used for activity logs. Logs always use SQLite; this config only selects `mode`.

```typescript
store.configureLogs(
  config?: "auto" | "client" | "server" | {
    mode?: "auto" | "client" | "server";
  }
);
```

This method returns the `store` instance, so it can be used in a chain.

### Config

| Option | Default | Description                    |
| :----- | :------ | :----------------------------- |
| `mode` | `auto`  | `auto`, `client`, or `server`. |

Mode `auto` automatically selects `sqlite-server` in Node.js/server and `sqlite-client` in browser/client.

If `mode` is invalid, OmniStorage throws:

```text
Invalid log mode "...". Use "auto", "client", or "server".
```

### Examples

```javascript
import store from "@x-labs-myid/omnistorage";

// Default behavior: auto-detect runtime
store.configureLogs("auto");

// Force browser SQLite WASM logging
store.configureLogs("client");

// Force Node.js SQLite logging
store.configureLogs("server");

// Config object
store.configureLogs({ mode: "auto" });
```

### Runtime Notes

- `sqlite-server` is only available in Node.js runtimes.
- `sqlite-client` uses SQLite WASM and is suitable for browsers.
- If SQLite initialization fails, the logger writes the error to the console and log entries are not stored.
- Changing the configuration reinitializes the logger connection.

---

<h3 id="get-log-config"><i class="ri-file-settings-line"></i> <code>.getLogConfig()</code></h3>

Returns the active logging configuration.

```typescript
store.getLogConfig(): {
  mode: "auto" | "client" | "server";
  databaseExists: boolean;
}
```

### Example

```javascript
const config = store.getLogConfig();
console.log(config);
```

### Response

```javascript
{
  mode: "auto",
  databaseExists: true
}
```

| Field            | Description                                                                  |
| :--------------- | :--------------------------------------------------------------------------- |
| `mode`           | Log mode: `auto`, `client`, or `server`.                                     |
| `databaseExists` | Read-only status showing whether the log database existed before opening it. |

---

## <i class="ri-database-2-line"></i> Retrieving Log Data

<h3 id="get-activity-logs"><i class="ri-list-check-2"></i> <code>.getActivityLogs(limit)</code></h3>

Retrieves storage activity history, ordered from newest to oldest.

```typescript
await store.getActivityLogs(limit?: number);
```

### Parameters

| Parameter | Required | Default | Description                           |
| :-------- | :------: | :------ | :------------------------------------ |
| `limit`   |    No    | `100`   | Maximum number of log rows to return. |

The response includes `source` to indicate where the logs came from: `server` for Node.js SQLite or `client` for browser SQLite WASM.

### Examples

:::code-tabs
@tab Basic API

```javascript
import store from "@x-labs-myid/omnistorage";

await store.engine("memory").save("user:101", {
  name: "Kang Cahya",
  role: "developer",
});

const res = await store.getActivityLogs(10);
console.log(res.data);
```

@tab JSON Command

```javascript
// Logs are created by command operations that perform writes/deletes.
await store.command({
  engine: "memory",
  operation: "save",
  key: "user:101",
  value: {
    name: "Kang Cahya",
    role: "developer",
  },
});

// Reading logs still uses the direct logging API.
const res = await store.getActivityLogs(10);
```

:::

### Response

```javascript
{
  ok: true,
  message: "Activity logs retrieved",
  data: [
    {
      id: 42,
      timestamp: "2024-06-01 10:00:00",
      operation: "upsert",
      engine: "memory",
      key: "user:101",
      namespace: "default",
      status: "success",
      message: "",
      source: "server"
    },
    {
      id: 41,
      timestamp: "2024-06-01 09:55:21",
      operation: "insert",
      engine: "local",
      key: "user:101",
      namespace: "default",
      status: "error",
      message: "Create failed: Key \"user:101\" already exists.",
      source: "server"
    }
  ],
  timestamp: 1717200010000,
  source: "server"
}
```

### Logged Operations

OmniStorage currently records these main operations:

| API Operation                        | `operation` Value  | When It Is Logged                             |
| :----------------------------------- | :----------------- | :-------------------------------------------- |
| `.create()` / `.insert()`            | `insert`           | On success or key validation failure.         |
| `.save()` / `.set()`                 | `upsert`           | On success or value validation failure.       |
| `.update()`                          | `update`           | On success or when the key is missing.        |
| `.destroy()` / `.delete()`           | `destroy`          | After the key is removed.                     |
| `.truncate()` / `.clear()`           | `truncate`         | After the storage is cleared.                 |
| `.command()` write/delete operations | Matching operation | Because command delegates to the related API. |

> Read operations such as `.find()` and `.findAll()` do not create activity logs.

---

<h3 id="get-logs"><i class="ri-file-list-3-line"></i> <code>.getLogs(limit)</code></h3>

Alias for `.getActivityLogs(limit)`.

```javascript
const logs = await store.getLogs(25);
```

The response is identical to `.getActivityLogs()`.

---

<h3 id="clear-activity-logs"><i class="ri-delete-bin-6-line"></i> <code>.clearActivityLogs()</code></h3>

Deletes all recorded logs from the active log table.

```typescript
await store.clearActivityLogs();
```

### Example

```javascript
const res = await store.clearActivityLogs();
console.log(res.ok); // true
```

### Response

```javascript
{
  ok: true,
  message: "Activity logs cleared",
  timestamp: 1717200010000
}
```

> This operation is permanent for the currently configured log table. If your UI exposes it, show a user confirmation first.

---

## <i class="ri-bar-chart-box-line"></i> Storage Statistics

Statistics calculate key count and estimated data size for storage engines. The calculation is based on keys using the active database prefix (`dbName_`).

Standard statistics fields:

| Field                | Type     | Description                                      |
| :------------------- | :------- | :----------------------------------------------- |
| `engine`             | `string` | Storage engine name.                             |
| `dbName`             | `string` | Active database/prefix name for that engine.     |
| `totalKeys`          | `number` | Number of keys detected for the active database. |
| `totalSize`          | `number` | Estimated data size in bytes.                    |
| `totalSizeFormatted` | `string` | Estimated size in KB with two decimal places.    |

---

<h3 id="get-statistic"><i class="ri-bar-chart-line"></i> <code>.getStatistic(engineName)</code></h3>

Retrieves statistics for a specific engine. If `engineName` is omitted, it retrieves statistics for all engines.

```typescript
await store.getStatistic(engineName?: string);
```

### Parameters

| Parameter    | Required | Description                                                                 |
| :----------- | :------: | :-------------------------------------------------------------------------- |
| `engineName` |    No    | Engine name, for example `local`, `session`, `memory`, `file`, `indexeddb`. |

### Single Engine Example

:::code-tabs
@tab Basic API

```javascript
const localStats = await store.getStatistic("local");
console.log(localStats.data.totalKeys);
```

@tab JSON Command

```javascript
const localStats = await store.command({
  engine: "local",
  operation: "getStatistic",
});
```

:::

### Single Engine Response

```javascript
{
  ok: true,
  engine: "local",
  data: {
    engine: "local",
    dbName: "MyStoreDB",
    totalKeys: 15,
    totalSize: 2048,
    totalSizeFormatted: "2.00 KB"
  },
  timestamp: 1717200010000
}
```

### All Engines Example

```javascript
const stats = await store.getStatistic();
```

### All Engines Response

```javascript
{
  ok: true,
  data: {
    local: {
      engine: "local",
      dbName: "MyStoreDB",
      totalKeys: 15,
      totalSize: 2048,
      totalSizeFormatted: "2.00 KB"
    },
    memory: {
      engine: "memory",
      dbName: "MyStoreDB",
      totalKeys: 5,
      totalSize: 512,
      totalSizeFormatted: "0.50 KB"
    },
    indexeddb: {
      engine: "indexeddb",
      dbName: "MyStoreDB",
      totalKeys: 120,
      totalSize: 1048576,
      totalSizeFormatted: "1024.00 KB"
    }
  },
  timestamp: 1717200010000
}
```

If one engine fails while collecting all statistics, that engine field contains an error object:

```javascript
{
  ok: true,
  data: {
    indexeddb: {
      error: "IndexedDB is not available"
    }
  }
}
```

If `engineName` is provided but unknown, the method throws:

```text
Engine unknown-engine not found
```

---

<h3 id="get-statistics"><i class="ri-bar-chart-grouped-line"></i> <code>.getStatistics()</code></h3>

Alias for retrieving statistics from all engines.

```typescript
await store.getStatistics();
```

### Examples

:::code-tabs
@tab Basic API

```javascript
const stats = await store.getStatistics();
console.log(stats.data.memory.totalSizeFormatted);
```

@tab JSON Command

```javascript
const stats = await store.command({
  operation: "getStatistics",
});
```

:::

The response is the same as `.getStatistic()` without parameters.

---

<h3 id="statistics-aliases"><i class="ri-links-line"></i> Statistics Aliases</h3>

Available statistics aliases:

| API                                     | Equivalent        | Description                                |
| :-------------------------------------- | :---------------- | :----------------------------------------- |
| `.getStatistics()`                      | `.getStatistic()` | Retrieves statistics for all engines.      |
| `.command({ operation: "statistics" })` | JSON command      | Retrieves statistics through JSON command. |
| `.command({ operation: "stats" })`      | JSON command      | Shortest command alias.                    |

Example:

```javascript
const allStats = await store.getStatistics();

const memoryStats = await store.command({
  engine: "memory",
  operation: "stats",
});
```

---

## <i class="ri-lightbulb-line"></i> Usage Tips

- Call `.configureLogs()` at application startup before the first storage operation if you want to choose the log mode explicitly.
- Use `getLogConfig()` to inspect the active `mode` and `databaseExists` config.
- Keep `getActivityLogs(limit)` limited in UI screens so log queries stay lightweight.
- Use `clearActivityLogs()` carefully because there is no soft delete.
- Statistics are data-size estimates, not exact physical database/file sizes.
