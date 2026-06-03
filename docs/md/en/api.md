# <i class="ri-braces-line"></i> API Reference (ORM-Like)

Use familiar methods to manage your data. All operations return a standard response object.

<h2 id="config"><i class="ri-settings-4-line"></i> Configuration & Namespacing</h2>

### <i class="ri-database-2-line"></i> `.db(name)`

Sets the global database name. This acts as a physical database name in IndexedDB or a global prefix in other engines.

```javascript
import store from "@x-labs-myid/omnistorage";

store.db("my_app");
```

### <i class="ri-plug-line"></i> `.use(engineType)`

Sets the default storage engine globally.

```javascript
import store from "@x-labs-myid/omnistorage";

store.use("session"); // local, session, cookie, cache, memory, file, indexeddb, sqlite-server, sqlite-client
```

### <i class="ri-equalizer-line"></i> `.engine(engineType)`

Temporary switch to a specific engine for a chain of operations without changing the global default.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.engine("memory").save("temp_key", "value");
```

> `.config(engineType)` is still supported as a backward-compatible alias.

### <i class="ri-folder-shield-line"></i> `.namespace(name)`

Creates a logical isolation layer within the current engine.

```javascript
import store from "@x-labs-myid/omnistorage";

const auth = store.namespace("v1/auth");
await auth.save("token", "xyz123"); // Saved as "dbName_v1/auth:token"
```

---

<h2 id="basic"><i class="ri-settings-4-line"></i> Basic Operations</h2>

### <i class="ri-database-2-line"></i> Sample Data Structure

In these examples, we use a **User** object with 3 fields: `name`, `address`, and `email`.

```javascript
const userData = {
  name: "Kang Cahya",
  address: "Jawa Barat, Indonesia",
  email: "cahya.dev@random.com",
};
```

### <i class="ri-arrow-left-right-line"></i> Quick Comparison: `create` vs `save`

Before choosing a method, understand how they handle existing data:

| Feature | `.create()` | `.save()` |
| :--- | :--- | :--- |
| **Primary Goal** | Strictly for new data. | Ensure data is saved (Upsert). |
| **If Key Exists** | <i class="ri-error-warning-line"></i> **Fails** (Error). | <i class="ri-refresh-line"></i> **Updates** (Overwrite). |
| **Best Use Case** | Unique IDs, Registration. | User Settings, Profiles. |

### <i class="ri-add-circle-line"></i> `.create(key, value)`

Stores new data. This function will fail if the key already exists in the storage.

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

Updates existing data. This function will fail if the key is not found.

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.update("user:101", { name: "Cahya Updated" });
```

### <i class="ri-save-3-line"></i> `.save(key, value)`

_Upsert_ operation. It automatically decides whether to create a new entry or update an existing one.

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.save("user:102", {
  name: "Budi",
  address: "Jakarta",
  email: "budi@example.com",
});
```

**Example response:**

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

<h2 id="retrieval"><i class="ri-search-eye-line"></i> Data Retrieval</h2>

### <i class="ri-find-replace-line"></i> `.find(key, options?)` / `.findOne(key, options?)`

Retrieves a single data entry. `.findOne`, `.get`, `.getByKey`, and `.getById` are aliases for the same lookup behavior.

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.find("user:101", {
  defaultValue: null,
  type: "object",
});
```

### <i class="ri-list-check"></i> `.findAll()` / `.getAll()`

Retrieves all data within the current database or namespace.

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.findAll();
```

### <i class="ri-stack-line"></i> `.findMany(keys, options?)` / `.getMany(keys, options?)`

Retrieves multiple entries by key.

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.findMany(["user:101", "user:102"]);
```

---

<h2 id="deletion"><i class="ri-delete-bin-line"></i> Deletion</h2>

### <i class="ri-close-circle-line"></i> `.destroy(key)` / `.delete(key)` / `.remove(key)`

Deletes a single data entry by key.

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.destroy("user:101");
```

### <i class="ri-eraser-line"></i> `.truncate()` / `.clear()`

Deletes all data within the current database or namespace.

```javascript
import store from "@x-labs-myid/omnistorage";

const res = await store.truncate();
```

---

<h2 id="batch"><i class="ri-stack-line"></i> Batch Operations</h2>

Process multiple items efficiently in one call.

### `.saveMany(items)` / `.setMany(items)`

Upserts multiple items.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.saveMany({
  key1: "value1",
  key2: { id: 2 },
});
```

### `.createMany(items)`

Inserts multiple items. Existing keys are returned as failed results.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.createMany({
  "user:201": { name: "Ayu" },
  "user:202": { name: "Dina" },
});
```

### `.updateMany(items)`

Updates multiple items. Missing keys are returned as failed results.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.updateMany({
  "user:201": { name: "Ayu Updated" },
  "user:202": { name: "Dina Updated" },
});
```

### `.destroyMany(keys)` / `.deleteMany(keys)`

Deletes multiple items by key.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.destroyMany(["user:201", "user:202"]);
```

---

<h2 id="advanced"><i class="ri-rocket-2-line"></i> Advanced Features</h2>

### <i class="ri-eye-line"></i> `.watch(key, callback)`

Monitors changes to a specific key. Returns an `unwatch` function.

```javascript
import store from "@x-labs-myid/omnistorage";

const unwatch = store.watch("user:101", (newValue, oldValue) => {
  console.log("Data changed!", { newValue, oldValue });
});

unwatch();
```

### <i class="ri-flashlight-line"></i> `.on(event, callback)`

Global hooks for storage operations. Supported events: `onSet`, `onGet`, `onDelete`, `onClear`.

```javascript
import store from "@x-labs-myid/omnistorage";

store.on("onSet", (data) => {
  console.log(`Saved to ${data.engine}: ${data.key}`);
});
```

### <i class="ri-exchange-funds-line"></i> `.transaction(callback)`

Executes multiple operations in a single transaction-like block.

```javascript
import store from "@x-labs-myid/omnistorage";

await store.transaction(async (trx) => {
  await trx.create("trx:1", "Value A");
  await trx.save("trx:2", "Value B");
});
```

### <i class="ri-information-line"></i> `.describe(key)` / `.getMeta(key)`

Retrieves metadata for a specific key, such as estimated size in bytes and engine used.

```javascript
import store from "@x-labs-myid/omnistorage";

const meta = await store.describe("user:101");
console.log(meta.data.size);
```

### <i class="ri-bar-chart-box-line"></i> `.getStatistic(name?)` / `.getStatistics()`

Retrieves storage usage statistics. See [Logs & Statistics](logs-stats.md) for activity-log details.

```javascript
import store from "@x-labs-myid/omnistorage";

const allStats = await store.getStatistics();
const localStats = await store.getStatistic("local");
```

### <i class="ri-file-list-3-line"></i> `.getActivityLogs(limit?)`, `.getLogs(limit?)`, `.clearActivityLogs()`

Reads or clears OmniStorage activity logs.

```javascript
import store from "@x-labs-myid/omnistorage";

const logs = await store.getActivityLogs(50);
await store.clearActivityLogs();
```
