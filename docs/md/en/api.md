# <i class="ri-braces-line"></i> API Reference (ORM-Like)

Use familiar methods to manage your data. All operations return a standard response object.

## <i class="ri-database-2-line"></i> Sample Data Structure

In these examples, we use a **User** object with 3 fields: `name`, `address`, and `email`.

```javascript
const userData = {
  name: "Kang Cahya",
  address: "Jawa Barat, Indonesia",
  email: "cahya.dev@random.com",
};
```

---

<h2 id="config"><i class="ri-settings-4-line"></i> Configuration & Namespacing</h2>

### <i class="ri-database-2-line"></i> `.db(name)`

Sets the global database name. This acts as a physical database name in IndexedDB or a global prefix in other engines.

```javascript
store.db("my_app");
```

### <i class="ri-plug-line"></i> `.use(engineType)`

Sets the default storage engine globally.

```javascript
store.use("session"); // local, session, memory, file, indexeddb, sqlite-server, sqlite-client
```

### <i class="ri-equalizer-line"></i> `.config(engineType)`

Temporary switch to a specific engine for a chain of operations without changing the global default.

```javascript
await store.config("memory").save("temp_key", "value");
```

### <i class="ri-folder-shield-line"></i> `.namespace(name)`

Creates a logical isolation layer within the current engine.

```javascript
const auth = store.namespace("v1/auth");
await auth.save("token", "xyz123"); // Saved as "dbName_v1/auth:token"
```

---

<h2 id="basic"><i class="ri-settings-4-line"></i> Basic Operations</h2>

### <i class="ri-arrow-left-right-line"></i> Quick Comparison: `create` vs `save`

Before choosing a method, understand how they handle existing data:

| Feature           | `.create()`                                              | `.save()`                                                |
| :---------------- | :------------------------------------------------------- | :------------------------------------------------------- |
| **Primary Goal**  | Strictly for new data.                                   | Ensure data is saved (Upsert).                           |
| **If Key Exists** | <i class="ri-error-warning-line"></i> **Fails** (Error). | <i class="ri-refresh-line"></i> **Updates** (Overwrite). |
| **Best Use Case** | Unique IDs, Registration.                                | User Settings, Profiles.                                 |

---

### <i class="ri-add-circle-line"></i> `.create(key, value)`

Stores new data. This function will fail if the key already exists in the storage.

**Example:**

```javascript
const res = await store.create("user:101", userData);
```

**Response:**

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

Updates existing data. This function will fail if the key is not found.

**Example:**

```javascript
const res = await store.update("user:101", { name: "Cahya Updated" });
```

**Response:**

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

_Upsert_ operation. It will automatically decide whether to create a new entry or update an existing one.

**Example:**

```javascript
const res = await store.save("user:102", {
  name: "Budi",
  address: "Jakarta",
  email: "budi@example.com",
});
```

**Response:**

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

<h2 id="retrieval"><i class="ri-search-eye-line"></i> Data Retrieval</h2>

### <i class="ri-find-replace-line"></i> `.find(key, options?)` / `.findOne(key, options?)`

Retrieves a single data entry. `.findOne` is an alias for `.find`.

**Example:**

```javascript
const res = await store.find("user:101");
```

**Response:**

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

Retrieves all data within the current database or namespace.

**Response:**

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

<h2 id="deletion"><i class="ri-delete-bin-line"></i> Deletion</h2>

### <i class="ri-close-circle-line"></i> `.destroy(key)`

Deletes a single data entry by its key.

**Response:**

```javascript
{
  ok: true,
  data: null,
  message: "Item deleted",
  engine: "local"
}
```

### <i class="ri-eraser-line"></i> `.truncate()`

Deletes all data within the current database or namespace.

**Response:**

```javascript
{
  ok: true,
  data: null,
  message: "Storage cleared",
  engine: "local"
}
```

---

<h2 id="batch"><i class="ri-stack-line"></i> Batch Operations</h2>

Process multiple items efficiently in a single call.

### `.saveMany(items)`

_Upsert_ multiple items.

```javascript
await store.saveMany({
  key1: "value1",
  key2: { id: 2 },
});
```

### `.createMany(items)`

_Insert_ multiple items. Fails for keys that already exist.

### `.updateMany(items)`

_Update_ multiple items. Fails for keys that don't exist.

### `.findMany(keys)`

Retrieve multiple items by their keys.

```javascript
const res = await store.findMany(["key1", "key2"]);
// res.data = { "key1": "value1", "key2": { "id": 2 } }
```

### `.destroyMany(keys)`

Delete multiple items by their keys.

---

<h2 id="advanced"><i class="ri-rocket-2-line"></i> Advanced Features</h2>

### <i class="ri-eye-line"></i> `.watch(key, callback)`

Monitors changes to a specific key. Returns an `unwatch` function.

```javascript
const unwatch = store.watch("user:101", (newValue, oldValue) => {
  console.log("Data changed!", newValue);
});

// To stop watching:
unwatch();
```

### <i class="ri-flashlight-line"></i> `.on(event, callback)`

Global hooks for storage operations. Supported events: `onSet`, `onGet`, `onDelete`, `onClear`.

```javascript
store.on("onSet", (data) => {
  console.log(`Saved to ${data.engine}: ${data.key}`);
});
```

### <i class="ri-exchange-funds-line"></i> `.transaction(callback)`

Execute multiple operations in a single block.

```javascript
await store.transaction(async (trx) => {
  await trx.create("trx:1", "Value A");
  await trx.save("trx:2", "Value B");
});
```

### <i class="ri-information-line"></i> `.describe(key)`

Retrieves metadata for a specific key (e.g., size in bytes, engine used).

```javascript
const meta = await store.describe("user:101");
console.log(meta.data.size);
```

### <i class="ri-bar-chart-box-line"></i> `.getStatistics()` / `.getStatistic(name)`

Retrieves storage usage statistics. See [Logs & Statistics](logs-stats.md) for more details.
