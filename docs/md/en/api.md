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

> If no global engine is set with `.use()` and no local engine is selected with `.engine()`, OmniStorage uses `memory` by default.

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

<h2 id="command-payload"><i class="ri-terminal-box-line"></i> JSON Command Runner</h2>

### <i class="ri-braces-line"></i> `.command(payload)` / `.execute(payload)` / `.run(payload)`

Executes a storage operation from a plain JSON-compatible object.

This API is the standard low-level runner used by integrations and the Playground. It does **not** replace the ORM-like methods such as `.save()`, `.find()`, or `.truncate()`. Instead, it maps a structured payload to the same existing operations, so both styles stay consistent.

In the documentation, JSON payload examples are shown as a **JSON Payload** tab beside the regular **Basic API** examples wherever the pattern is practical.

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

Equivalent ORM-like usage:

```javascript
const result = await store.db("demo_app").engine("memory").save("user:1", {
  name: "Kang Cahya",
  role: "developer",
  active: true,
});
```

> `.execute(payload)` and `.run(payload)` are aliases for `.command(payload)`.

### Payload Shape

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

| Field       | Required | Description                                                                                               |
| :---------- | :------: | :-------------------------------------------------------------------------------------------------------- |
| `operation` |   Yes    | Operation to execute. `action` and `method` are accepted as aliases.                                      |
| `engine`    |    No    | Storage engine. Defaults to the current default engine, which is `memory` unless changed with `.use()`.   |
| `dbName`    |    No    | Database name for this command. `database` is accepted as an alias.                                       |
| `namespace` |    No    | Logical namespace. Defaults to `default`. Any non-default value runs the operation inside that namespace. |
| `key`       | Depends  | Required by single-key operations such as `save`, `find`, `delete`, and `describe`.                       |
| `value`     | Depends  | Required by write operations such as `save`, `create`, `update`, `insert`, and `set`.                     |
| `items`     | Depends  | Object map for batch operations and JSON transaction payloads.                                            |
| `keys`      | Depends  | Array of keys for batch read/delete operations.                                                           |
| `options`   |    No    | Read options passed to lookup operations, for example `{ "defaultValue": null, "type": "object" }`.       |

### Supported Operations

| Category    | Operations                                                                    |
| :---------- | :---------------------------------------------------------------------------- |
| Write       | `create`, `insert`, `save`, `set`, `update`                                   |
| Read        | `find`, `findOne`, `get`, `getByKey`, `getById`, `findAll`, `getAll`, `all`   |
| Batch write | `saveMany`, `setMany`, `createMany`, `updateMany`                             |
| Batch read  | `findMany`, `getMany`                                                         |
| Delete      | `destroy`, `delete`, `remove`, `destroyMany`, `deleteMany`, `removeMany`      |
| Clear       | `truncate`, `clear`                                                           |
| Metadata    | `describe`, `getMeta`, `getStatistic`, `getStatistics`, `statistics`, `stats` |
| Transaction | `transaction` with an `items` object or a JavaScript `callback`               |

`watch` is intentionally limited: pure JSON cannot carry a callback function. Use `.watch(key, callback)` directly for watcher behavior.

### Response Format

`command()` returns the normal OmniStorage response and adds a `command` metadata object so the caller can trace what was executed.

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

Validation errors are also returned as standard responses instead of throwing in normal usage:

```javascript
const result = await store.command({ operation: "save" });

console.log(result.ok); // false
console.log(result.message); // Operation "save" requires a non-empty "key".
```

### Batch Command Examples

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

### Namespace Commands

A non-default `namespace` applies to the command target automatically:

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

Equivalent ORM-like usage:

```javascript
await store
  .db("my_app")
  .engine("local")
  .namespace("auth")
  .save("token", "secure-token-value");
```

### Notes

- `command()` is additive and backward-compatible. Existing methods keep their behavior.
- `engine` follows the same engine names used by `.engine()` and `.use()`.
- If `engine` is omitted, OmniStorage uses the current default engine.
- If both global `.use()` and payload `engine` are present, the payload `engine` wins for that command only.
- Destructive operations such as `delete`, `destroyMany`, `truncate`, and `clear` run immediately. Confirm user intent in your own UI before sending those payloads.

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

| Feature           | `.create()`                                              | `.save()`                                                |
| :---------------- | :------------------------------------------------------- | :------------------------------------------------------- |
| **Primary Goal**  | Strictly for new data.                                   | Ensure data is saved (Upsert).                           |
| **If Key Exists** | <i class="ri-error-warning-line"></i> **Fails** (Error). | <i class="ri-refresh-line"></i> **Updates** (Overwrite). |
| **Best Use Case** | Unique IDs, Registration.                                | User Settings, Profiles.                                 |

### <i class="ri-add-circle-line"></i> `.create(key, value)`

Stores new data. This function will fail if the key already exists in the storage.

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

### <i class="ri-edit-line"></i> `.update(key, value)`

Updates existing data. This function will fail if the key is not found.

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

### <i class="ri-save-3-line"></i> `.save(key, value)`

_Upsert_ operation. It automatically decides whether to create a new entry or update an existing one.

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

### <i class="ri-list-check"></i> `.findAll()` / `.getAll()`

Retrieves all data within the current database or namespace.

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

### <i class="ri-stack-line"></i> `.findMany(keys, options?)` / `.getMany(keys, options?)`

Retrieves multiple entries by key.

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

<h2 id="deletion"><i class="ri-delete-bin-line"></i> Deletion</h2>

### <i class="ri-close-circle-line"></i> `.destroy(key)` / `.delete(key)` / `.remove(key)`

Deletes a single data entry by key.

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

### <i class="ri-eraser-line"></i> `.truncate()` / `.clear()`

Deletes all data within the current database or namespace.

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

<h2 id="batch"><i class="ri-stack-line"></i> Batch Operations</h2>

Process multiple items efficiently in one call.

### `.saveMany(items)` / `.setMany(items)`

Upserts multiple items.

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

### `.createMany(items)`

Inserts multiple items. Existing keys are returned as failed results.

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

### `.updateMany(items)`

Updates multiple items. Missing keys are returned as failed results.

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

### `.destroyMany(keys)` / `.deleteMany(keys)`

Deletes multiple items by key.

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
