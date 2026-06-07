# <i class="ri-code-s-slash-line"></i> Exports & Interfaces

OmniStorage exports a ready-to-use singleton plus the manager class if you need an isolated instance.

## <i class="ri-share-box-line"></i> Public Exports

```javascript
import store, {
  StoreManager,
  store as sharedStore,
} from "@x-labs-myid/omnistorage";

// `store` and `sharedStore` point to the same shared singleton.
const customStore = new StoreManager(); // Separate isolated manager instance.
```

| Export         | Type                    | Description                                                                                     |
| :------------- | :---------------------- | :---------------------------------------------------------------------------------------------- |
| `default`      | `StoreManager` instance | The easiest way to use OmniStorage. Import it as `store`.                                       |
| `store`        | `StoreManager` instance | Named export for the same shared singleton. Useful when you prefer named imports.               |
| `StoreManager` | `class`                 | Creates a separate storage manager with its own db name, engine instances, hooks, and watchers. |

## <i class="ri-shapes-line"></i> Interface Shapes

The TypeScript-style declarations below describe the public objects and return shapes that developers can use. They are documentation interfaces, not additional named type exports from the JavaScript package.

### Engine types

Use these values with `.use(engineType)` or `.engine(engineType)`:

```typescript
type EngineType =
  | "local"
  | "session"
  | "cookie"
  | "cache"
  | "memory"
  | "file"
  | "indexeddb"
  | "sqlite-server"
  | "sqlite-client";
```

### Standard response shape

Most async methods return this standard response object:

```typescript
interface CommandMeta {
  operation: string;
  engine: EngineType;
  dbName: string;
  namespace: string;
}

interface StoreResponse<T = unknown> {
  ok: boolean;
  data?: T;
  message?: string;
  engine?: EngineType;
  timestamp?: number;
  command?: CommandMeta;
}
```

- `ok`: whether the operation succeeded.
- `data`: returned data, saved value, metadata, statistics, or batch result.
- `message`: human-readable status or error message.
- `engine`: engine that handled the operation.
- `timestamp`: response creation time when provided by the formatter.
- `command`: metadata added by `.command(payload)`, `.execute(payload)`, or `.run(payload)`.

### JSON payload shape

```typescript
type CommandOperation =
  | "create"
  | "insert"
  | "save"
  | "set"
  | "update"
  | "find"
  | "findOne"
  | "get"
  | "getByKey"
  | "getById"
  | "findAll"
  | "getAll"
  | "all"
  | "saveMany"
  | "setMany"
  | "createMany"
  | "updateMany"
  | "findMany"
  | "getMany"
  | "destroy"
  | "delete"
  | "remove"
  | "destroyMany"
  | "deleteMany"
  | "removeMany"
  | "truncate"
  | "clear"
  | "describe"
  | "getMeta"
  | "getStatistic"
  | "getStatistics"
  | "statistics"
  | "stats"
  | "transaction";

interface CommandPayload<T = unknown> {
  operation?: CommandOperation;
  action?: CommandOperation;
  method?: CommandOperation;
  engine?: EngineType;
  dbName?: string;
  database?: string;
  namespace?: string;
  key?: string;
  value?: T;
  items?: Record<string, T>;
  keys?: string[];
  options?: FindOptions;
  callback?: TransactionCallback | WatchCallback;
}
```

### Main `StoreManager` interface

These are the public methods developers can call on `store` or a `new StoreManager()` instance.

| Method                                | Returns                  | Description                                                      |
| :------------------------------------ | :----------------------- | :--------------------------------------------------------------- |
| `.db(name)`                           | `StoreManager`           | Sets the database name and reinitializes engines with that name. |
| `.getDbName()`                        | `string`                 | Returns the current database name.                               |
| `.use(engineType)`                    | `StoreManager`           | Sets the default engine globally.                                |
| `.engine(engineType)`                 | `ConfiguredStore`        | Returns a temporary engine-bound operation interface.            |
| `.config(engineType)`                 | `ConfiguredStore`        | Backward-compatible alias for `.engine(engineType)`.             |
| `.namespace(name)`                    | `NamespaceStore`         | Returns a namespace-scoped operation interface.                  |
| `.command(payload)`                   | `Promise<StoreResponse>` | Executes a standard JSON payload.                             |
| `.execute(payload)`                   | `Promise<StoreResponse>` | Alias for `.command(payload)`.                                   |
| `.run(payload)`                       | `Promise<StoreResponse>` | Alias for `.command(payload)`.                                   |
| `.create(key, value)`                 | `Promise<StoreResponse>` | Inserts a new item and fails if the key already exists.          |
| `.insert(key, value)`                 | `Promise<StoreResponse>` | Alias for `.create()`.                                           |
| `.update(key, value)`                 | `Promise<StoreResponse>` | Updates an existing item and fails if the key does not exist.    |
| `.save(key, value)`                   | `Promise<StoreResponse>` | Upserts an item. Creates or overwrites as needed.                |
| `.set(key, value)`                    | `Promise<StoreResponse>` | Alias for `.save()`.                                             |
| `.find(key, options?)`                | `Promise<StoreResponse>` | Finds one item by key.                                           |
| `.findOne(key, options?)`             | `Promise<StoreResponse>` | Alias for `.find()`.                                             |
| `.get(key, options?)`                 | `Promise<StoreResponse>` | Alias for `.find()`.                                             |
| `.getByKey(key, options?)`            | `Promise<StoreResponse>` | Alias for `.find()`.                                             |
| `.getById(key, options?)`             | `Promise<StoreResponse>` | Alias for `.find()`.                                             |
| `.findAll()`                          | `Promise<StoreResponse>` | Returns all items from the current default engine.               |
| `.getAll()`                           | `Promise<StoreResponse>` | Alias for `.findAll()`.                                          |
| `.destroy(key)`                       | `Promise<StoreResponse>` | Deletes one item by key.                                         |
| `.delete(key)`                        | `Promise<StoreResponse>` | Alias for `.destroy()`.                                          |
| `.remove(key)`                        | `Promise<StoreResponse>` | Alias for `.destroy()`.                                          |
| `.truncate()`                         | `Promise<StoreResponse>` | Clears all data in the current default engine/database scope.    |
| `.clear()`                            | `Promise<StoreResponse>` | Alias for `.truncate()`.                                         |
| `.saveMany(items)`                    | `Promise<StoreResponse>` | Upserts multiple items.                                          |
| `.setMany(items)`                     | `Promise<StoreResponse>` | Alias for `.saveMany()`.                                         |
| `.createMany(items)`                  | `Promise<StoreResponse>` | Inserts multiple items; existing keys are reported as failures.  |
| `.updateMany(items)`                  | `Promise<StoreResponse>` | Updates multiple items; missing keys are reported as failures.   |
| `.findMany(keys, options?)`           | `Promise<StoreResponse>` | Finds multiple items by key list.                                |
| `.getMany(keys, options?)`            | `Promise<StoreResponse>` | Alias for `.findMany()`.                                         |
| `.destroyMany(keys)`                  | `Promise<StoreResponse>` | Deletes multiple items by key list.                              |
| `.deleteMany(keys)`                   | `Promise<StoreResponse>` | Alias for `.destroyMany()`.                                      |
| `.transaction(callback, engineType?)` | `Promise<StoreResponse>` | Runs a group of operations in a transaction-like callback.       |
| `.describe(key)`                      | `Promise<StoreResponse>` | Returns metadata for one key, such as estimated size and engine. |
| `.getMeta(key)`                       | `Promise<StoreResponse>` | Alias for `.describe()`.                                         |
| `.getStatistic(engineType?)`          | `Promise<StoreResponse>` | Returns storage statistics for one engine or all engines.        |
| `.getStatistics()`                    | `Promise<StoreResponse>` | Alias for `.getStatistic()` without an engine type.              |
| `.getActivityLogs(limit?)`            | `Promise<StoreResponse>` | Returns activity logs captured by OmniStorage.                   |
| `.getLogs(limit?)`                    | `Promise<StoreResponse>` | Alias for `.getActivityLogs()`.                                  |
| `.clearActivityLogs()`                | `Promise<StoreResponse>` | Clears all activity logs.                                        |
| `.watch(key, callback)`               | `() => void`             | Watches one key and returns an unwatch function.                 |
| `.on(event, callback)`                | `StoreManager`           | Registers a global hook listener.                                |

### Find options

```typescript
interface FindOptions<T = unknown> {
  validator?: (value: T) => boolean;
  defaultValue?: T;
  type?: string;
}
```

- `validator`: custom validation function. If it returns `false`, the response becomes `ok: false`.
- `defaultValue`: value returned as `data` when the key is missing or validation fails.
- `type`: optional type check using the supported predicates from the internal `is` package, such as `string`, `number`, `object`, or `array`.

### Configured store interface

`store.engine(engineType)` returns a temporary operation interface bound to that engine. It does not permanently change the global default engine. `store.config(engineType)` returns the same interface as a backward-compatible alias.

```typescript
interface ConfiguredStore {
  create(key: string, value: unknown): Promise<StoreResponse>;
  update(key: string, value: unknown): Promise<StoreResponse>;
  save(key: string, value: unknown): Promise<StoreResponse>;
  find(key: string, options?: FindOptions): Promise<StoreResponse>;
  findOne(key: string, options?: FindOptions): Promise<StoreResponse>;
  findMany(keys: string[], options?: FindOptions): Promise<StoreResponse>;
  findAll(): Promise<unknown[]>;
  saveMany(items: Record<string, unknown>): Promise<StoreResponse>;
  destroy(key: string): Promise<StoreResponse>;
  destroyMany(keys: string[]): Promise<StoreResponse>;
  truncate(): Promise<StoreResponse>;
  describe(key: string): Promise<StoreResponse>;
  watch(key: string, callback: WatchCallback): () => void;
  transaction(callback: TransactionCallback): Promise<StoreResponse>;
  namespace(name: string): NamespaceStore;
  command(payload: CommandPayload): Promise<StoreResponse>;
  execute(payload: CommandPayload): Promise<StoreResponse>;
  run(payload: CommandPayload): Promise<StoreResponse>;
}
```

### Namespace store interface

`store.namespace(name)` prefixes all keys with `name:` and returns these methods:

```typescript
interface NamespaceStore {
  create(key: string, value: unknown): Promise<StoreResponse>;
  update(key: string, value: unknown): Promise<StoreResponse>;
  save(key: string, value: unknown): Promise<StoreResponse>;
  find(key: string, options?: FindOptions): Promise<StoreResponse>;
  findOne(key: string, options?: FindOptions): Promise<StoreResponse>;
  findAll(): Promise<StoreResponse>;
  createMany(items: Record<string, unknown>): Promise<StoreResponse>;
  updateMany(items: Record<string, unknown>): Promise<StoreResponse>;
  saveMany(items: Record<string, unknown>): Promise<StoreResponse>;
  findMany(keys: string[], options?: FindOptions): Promise<StoreResponse>;
  destroy(key: string): Promise<StoreResponse>;
  destroyMany(keys: string[]): Promise<StoreResponse>;
  truncate(): Promise<StoreResponse>;
  describe(key: string): Promise<StoreResponse>;
  watch(key: string, callback: WatchCallback): () => void;
  transaction(callback: TransactionCallback): Promise<StoreResponse>;
}
```

### Hooks, watchers, and transactions

```typescript
type HookEvent = "onSet" | "onGet" | "onDelete" | "onClear";
type WatchCallback = (newValue: unknown, oldValue: unknown) => void;

type TransactionStore = {
  create(key: string, value: unknown): Promise<StoreResponse>;
  update(key: string, value: unknown): Promise<StoreResponse>;
  save(key: string, value: unknown): Promise<StoreResponse>;
  destroy(key: string): Promise<StoreResponse>;
};

type TransactionCallback = (
  trx: TransactionStore,
) => Promise<unknown> | unknown;
```
