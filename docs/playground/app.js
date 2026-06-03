const memoryStore = new Map();
const idbConnections = new Map();
const logs = [];
const watchers = new Set();
const runnableEngines = new Set([
  "memory",
  "local",
  "session",
  "cookie",
  "cache",
  "indexeddb",
  "sqlite-client",
]);
const sqliteConnections = new Map();
const cacheConnections = new Map();
let sqlite3Module = null;

const ENGINE_LIMITS = {
  local: 5 * 1024 * 1024,
  session: 5 * 1024 * 1024,
  cookie: 20 * 4096,
  cache: 50 * 1024 * 1024,
  memory: 50 * 1024 * 1024,
  indexeddb: 500 * 1024 * 1024,
  "sqlite-client": 256 * 1024 * 1024,
};

const ITEM_LIMITS = {
  cookie: 4096,
};
let editors = null;
let isApplyingPreset = false;

const el = {
  preset: document.querySelector("#preset"),
  engine: document.querySelector("#engine"),
  codePreview: document.querySelector("#code-preview"),
  command: document.querySelector("#command"),
  result: document.querySelector("#result"),
  status: document.querySelector("#status"),
  dataList: document.querySelector("#data-list"),
  dataCount: document.querySelector("#data-count"),
  activityLog: document.querySelector("#activity-log"),
  logCount: document.querySelector("#log-count"),
};

const base = { engine: "memory", dbName: "demo_app", namespace: "default" };
const presets = {
  create: [
    "create(key, value)",
    {
      ...base,
      operation: "create",
      key: "user:1",
      value: { name: "Kang Cahya", role: "admin", active: true },
    },
  ],
  save: [
    "save(key, value)",
    {
      ...base,
      operation: "save",
      key: "user:1",
      value: { name: "Kang Cahya", role: "developer", active: true },
    },
  ],
  update: [
    "update(key, value)",
    {
      ...base,
      operation: "update",
      key: "user:1",
      value: { name: "Kang Cahya Updated", role: "maintainer", active: true },
    },
  ],
  insert: [
    "insert(key, value)",
    {
      ...base,
      operation: "insert",
      key: "user:3",
      value: { name: "Inserted User", role: "guest", active: false },
    },
  ],
  set: [
    "set(key, value)",
    {
      ...base,
      operation: "set",
      key: "settings:theme",
      value: { mode: "dark", accent: "purple" },
    },
  ],
  find: ["find(key)", { ...base, operation: "find", key: "user:1" }],
  findOne: ["findOne(key)", { ...base, operation: "findOne", key: "user:1" }],
  findAll: ["findAll()", { ...base, operation: "findAll" }],
  saveMany: [
    "saveMany(items)",
    {
      ...base,
      operation: "saveMany",
      items: {
        "product:1": { name: "Laptop", price: 1000 },
        "product:2": { name: "Mouse", price: 25 },
      },
    },
  ],
  createMany: [
    "createMany(items)",
    {
      ...base,
      operation: "createMany",
      items: { "batch:1": { value: "A" }, "batch:2": { value: "B" } },
    },
  ],
  findMany: [
    "findMany(keys)",
    { ...base, operation: "findMany", keys: ["user:1", "user:2", "product:1"] },
  ],
  destroy: ["destroy(key)", { ...base, operation: "destroy", key: "user:1" }],
  delete: ["delete(key)", { ...base, operation: "delete", key: "user:1" }],
  remove: ["remove(key)", { ...base, operation: "remove", key: "user:1" }],
  destroyMany: [
    "destroyMany(keys)",
    { ...base, operation: "destroyMany", keys: ["user:1", "user:2"] },
  ],
  truncate: ["truncate()", { ...base, operation: "truncate" }],
  describe: [
    "describe(key)",
    { ...base, operation: "describe", key: "user:1" },
  ],
  getStatistic: [
    "getStatistic(engine)",
    { ...base, operation: "getStatistic" },
  ],
  getStatistics: ["getStatistics()", { ...base, operation: "getStatistics" }],
  namespace: [
    "namespace(name).save(key, value)",
    {
      ...base,
      operation: "namespace",
      namespace: "auth",
      key: "token",
      value: "secure-token-value",
    },
  ],
  transaction: [
    "transaction(callback)",
    {
      ...base,
      operation: "transaction",
      items: { "trx:1": { value: "A" }, "trx:2": { value: "B" } },
    },
  ],
  watch: [
    "watch(key, callback)",
    {
      ...base,
      operation: "watch",
      key: "settings:theme",
      value: { mode: "dark", accent: "purple" },
    },
  ],
};

const presetGroups = [
  ["Write operations", ["create", "save", "update", "insert", "set"]],
  ["Read operations", ["find", "findOne", "findAll", "findMany"]],
  ["Batch operations", ["saveMany", "createMany", "destroyMany"]],
  ["Delete operations", ["destroy", "delete", "remove", "truncate"]],
  ["Utility operations", ["describe", "getStatistic", "getStatistics"]],
  ["Advanced operations", ["namespace", "transaction", "watch"]],
];

function init() {
  el.preset.innerHTML = presetGroups
    .map(([groupName, keys]) => {
      const options = keys
        .map((key) => `<option value="${key}">${presets[key][0]}</option>`)
        .join("");
      return `<optgroup label="${groupName}">${options}</optgroup>`;
    })
    .join("");
  initCodeEditors();
  reset();
}

function initCodeEditors() {
  editors = {
    codePreview: CodeMirror.fromTextArea(el.codePreview, {
      mode: "javascript",
      theme: "eclipse",
      lineNumbers: true,
      lineWrapping: true,
      matchBrackets: true,
      styleActiveLine: true,
      viewportMargin: Infinity,
    }),
    command: CodeMirror.fromTextArea(el.command, {
      mode: { name: "javascript", json: true },
      theme: "eclipse",
      lineNumbers: true,
      lineWrapping: true,
      matchBrackets: true,
      styleActiveLine: true,
      viewportMargin: Infinity,
    }),
  };

  editors.command.on("change", () => {
    if (isApplyingPreset) return;
    try {
      const data = command();
      el.engine.value = data.engine;
      setCodePreview(buildCodePreview(data));
      renderData(data).catch(() => {});
    } catch {
      // Keep invalid JSON editable; Run Command will show the parse error.
    }
  });
}

function getPayloadText() {
  return editors?.command ? editors.command.getValue() : el.command.value;
}

function setPayload(data) {
  const text = JSON.stringify(data, null, 2);
  if (editors?.command) editors.command.setValue(text);
  else el.command.value = text;
}

function setCodePreview(code) {
  if (editors?.codePreview) editors.codePreview.setValue(code);
  else el.codePreview.value = code;
}

function command() {
  const parsed = JSON.parse(getPayloadText());
  return {
    engine: parsed.engine || el.engine.value,
    dbName: parsed.dbName || "demo_app",
    namespace: parsed.namespace || "default",
    ...parsed,
  };
}

function safeCommand() {
  try {
    return command();
  } catch {
    return { ...base, operation: "invalid", engine: el.engine.value };
  }
}

function applyPreset() {
  const data = structuredClone(presets[el.preset.value][1]);
  data.engine = el.engine.value;
  isApplyingPreset = true;
  setPayload(data);
  setCodePreview(buildCodePreview(data));
  isApplyingPreset = false;
  renderData(data).catch(() => {});
}

function syncEngine() {
  try {
    const data = command();
    data.engine = el.engine.value;
    isApplyingPreset = true;
    setPayload(data);
    setCodePreview(buildCodePreview(data));
    isApplyingPreset = false;
    renderData(data).catch(() => {});
  } catch {}
}

function js(value) {
  return JSON.stringify(value, null, 2);
}

function storeExpr(cmd) {
  const baseExpr = `store.db(${JSON.stringify(cmd.dbName)}).config(${JSON.stringify(cmd.engine)})`;
  return cmd.namespace && cmd.namespace !== "default"
    ? `${baseExpr}.namespace(${JSON.stringify(cmd.namespace)})`
    : baseExpr;
}

function buildCodePreview(cmd) {
  const target = storeExpr(cmd);
  const op = cmd.operation;

  if (["create", "save", "update", "insert", "set"].includes(op)) {
    return `import store from "@x-labs-myid/omnistorage";\n\nconst result = await ${target}.${op}(\n  ${JSON.stringify(cmd.key)},\n  ${js(cmd.value)}\n);\n\nconsole.log(result);`;
  }

  if (
    ["find", "findOne", "destroy", "delete", "remove", "describe"].includes(op)
  ) {
    return `import store from "@x-labs-myid/omnistorage";\n\nconst result = await ${target}.${op}(${JSON.stringify(cmd.key)});\n\nconsole.log(result);`;
  }

  if (["findAll", "truncate", "getStatistic", "getStatistics"].includes(op)) {
    return `import store from "@x-labs-myid/omnistorage";\n\nconst result = await ${target}.${op}();\n\nconsole.log(result);`;
  }

  if (["saveMany", "createMany"].includes(op)) {
    return `import store from "@x-labs-myid/omnistorage";\n\nconst result = await ${target}.${op}(${js(cmd.items || {})});\n\nconsole.log(result);`;
  }

  if (["findMany", "destroyMany"].includes(op)) {
    return `import store from "@x-labs-myid/omnistorage";\n\nconst result = await ${target}.${op}(${js(cmd.keys || [])});\n\nconsole.log(result);`;
  }

  if (op === "namespace") {
    return `import store from "@x-labs-myid/omnistorage";\n\nconst authStorage = store\n  .db(${JSON.stringify(cmd.dbName)})\n  .config(${JSON.stringify(cmd.engine)})\n  .namespace(${JSON.stringify(cmd.namespace)});\n\nconst result = await authStorage.save(\n  ${JSON.stringify(cmd.key)},\n  ${js(cmd.value)}\n);\n\nconsole.log(result);`;
  }

  if (op === "transaction") {
    return `import store from "@x-labs-myid/omnistorage";\n\nconst result = await store.transaction(async (trx) => {\n${Object.entries(
      cmd.items || {},
    )
      .map(
        ([key, value]) =>
          `  await trx.save(${JSON.stringify(key)}, ${js(value).replaceAll("\n", "\n  ")});`,
      )
      .join("\n")}\n}, ${JSON.stringify(cmd.engine)});\n\nconsole.log(result);`;
  }

  if (op === "watch") {
    return `import store from "@x-labs-myid/omnistorage";\n\nconst unwatch = ${target}.watch(${JSON.stringify(cmd.key)}, (newValue, oldValue) => {\n  console.log({ newValue, oldValue });\n});\n\nawait ${target}.save(\n  ${JSON.stringify(cmd.key)},\n  ${js(cmd.value)}\n);\n\n// Later, stop watching:\n// unwatch();`;
  }

  return `// Unsupported operation preview: ${op}`;
}

function prefix(cmd) {
  return `${cmd.dbName}_${cmd.namespace}:`;
}
function fullKey(cmd, key) {
  return `${prefix(cmd)}${key}`;
}
function parseStored(value) {
  if (value == null) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

async function openDb(dbName) {
  if (idbConnections.has(dbName)) return idbConnections.get(dbName);
  const db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains("kv"))
        req.result.createObjectStore("kv", { keyPath: "key" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  idbConnections.set(dbName, db);
  return db;
}

async function idb(cmd, mode, cb) {
  const db = await openDb(cmd.dbName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction("kv", mode);
    const req = cb(tx.objectStore("kv"));
    if (req) {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } else {
      tx.oncomplete = () => resolve(undefined);
    }
    tx.onerror = () => reject(tx.error);
  });
}

function ensureRunnable(cmd) {
  if (!runnableEngines.has(cmd.engine)) {
    throw new Error(
      `Engine "${cmd.engine}" is not runnable on GitHub Pages/static browser demo.`,
    );
  }
}

function estimateBytes(value) {
  return new TextEncoder().encode(String(value ?? "")).length;
}

async function estimateCurrentStorageSize(cmd) {
  let total = 0;
  for (const key of await keys(cmd)) {
    const item = await rawGet(cmd, key);
    if (item) total += estimateBytes(item);
  }
  return total;
}

async function validateStorageLimit(cmd, key, value, oldStored = null) {
  const stored = JSON.stringify(value);
  const itemLimit = ITEM_LIMITS[cmd.engine];

  if (cmd.engine === "cookie") {
    const serialized = serializeCookie(fullKey(cmd, key), stored);
    const cookieSize = estimateBytes(serialized);
    if (itemLimit && cookieSize > itemLimit) {
      throw new Error(
        `Cookie item too large. Limit: ${(itemLimit / 1024).toFixed(
          2,
        )}KB. Actual: ${(cookieSize / 1024).toFixed(2)}KB.`,
      );
    }
  }

  const limit = ENGINE_LIMITS[cmd.engine];
  if (!limit) return;

  const currentSize = await estimateCurrentStorageSize(cmd);
  const oldSize = oldStored ? estimateBytes(oldStored) : 0;
  const newDataSize = estimateBytes(stored);
  const totalSize = currentSize - oldSize + newDataSize;

  if (totalSize > limit) {
    throw new Error(
      `Storage capacity full for engine "${cmd.engine}". Limit: ${(
        limit /
        1024 /
        1024
      ).toFixed(2)}MB. Current: ${(currentSize / 1024 / 1024).toFixed(
        2,
      )}MB. New data: ${(newDataSize / 1024).toFixed(2)}KB.`,
    );
  }
}

function encodeCookiePart(value) {
  return encodeURIComponent(value);
}

function decodeCookiePart(value) {
  return decodeURIComponent(value);
}

function serializeCookie(name, value, options = {}) {
  const settings = { path: "/", sameSite: "Lax", ...options };
  const parts = [`${encodeCookiePart(name)}=${encodeCookiePart(value)}`];

  if (settings.maxAge !== undefined) parts.push(`Max-Age=${settings.maxAge}`);
  if (settings.expires) parts.push(`Expires=${settings.expires.toUTCString()}`);
  if (settings.path) parts.push(`Path=${settings.path}`);
  if (settings.sameSite) parts.push(`SameSite=${settings.sameSite}`);
  if (settings.secure) parts.push("Secure");

  return parts.join("; ");
}

function cookieEntries() {
  if (!document.cookie) return [];
  return document.cookie.split("; ").map((cookie) => {
    const separatorIndex = cookie.indexOf("=");
    const rawName =
      separatorIndex >= 0 ? cookie.slice(0, separatorIndex) : cookie;
    const rawValue =
      separatorIndex >= 0 ? cookie.slice(separatorIndex + 1) : "";
    return [decodeCookiePart(rawName), decodeCookiePart(rawValue)];
  });
}

function cookieGet(key) {
  return cookieEntries().find(([name]) => name === key)?.[1] ?? null;
}

function cookieSet(key, value) {
  document.cookie = serializeCookie(key, value);
}

function cookieRemove(key) {
  document.cookie = serializeCookie(key, "", {
    expires: new Date(0),
    maxAge: 0,
  });
}

async function cacheStorage(cmd) {
  if (!("caches" in window)) {
    throw new Error("Cache Storage API is not available in this browser.");
  }

  const cacheName = `omnistorage-${cmd.dbName}`;
  if (!cacheConnections.has(cacheName)) {
    cacheConnections.set(cacheName, await caches.open(cacheName));
  }
  return cacheConnections.get(cacheName);
}

function cacheUrl(key) {
  return `${location.origin}${location.pathname.replace(/\/[^/]*$/, "/")}__omnistorage__/${encodeURIComponent(key)}`;
}

function keyFromCacheUrl(url) {
  const marker = "/__omnistorage__/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

async function sqliteDb(cmd) {
  if (sqliteConnections.has(cmd.dbName))
    return sqliteConnections.get(cmd.dbName);

  if (!sqlite3Module) {
    const { default: sqlite3InitModule } =
      await import("./vendor/sqlite-wasm/jswasm/sqlite3-bundler-friendly.mjs");
    sqlite3Module = await sqlite3InitModule({
      locateFile: (file) => `./vendor/sqlite-wasm/jswasm/${file}`,
    });
  }

  const sqlite3 = sqlite3Module;
  const db = new sqlite3.oo1.DB(`${cmd.dbName}.sqlite3`, "ct");

  db.exec(`
    CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  sqliteConnections.set(cmd.dbName, db);
  return db;
}

async function rawGet(cmd, key) {
  ensureRunnable(cmd);
  if (cmd.engine === "memory") return memoryStore.get(key) ?? null;
  if (cmd.engine === "local") return localStorage.getItem(key);
  if (cmd.engine === "session") return sessionStorage.getItem(key);
  if (cmd.engine === "cookie") return cookieGet(key);
  if (cmd.engine === "cache") {
    const cache = await cacheStorage(cmd);
    const response = await cache.match(cacheUrl(key));
    return response ? response.text() : null;
  }
  if (cmd.engine === "indexeddb") {
    const row = await idb(cmd, "readonly", (store) => store.get(key));
    return row ? row.value : null;
  }
  const db = await sqliteDb(cmd);
  let value = null;
  db.exec({
    sql: "SELECT value FROM kv WHERE key = ?",
    bind: [key],
    callback: (row) => {
      value = row[0];
    },
  });
  return value;
}
async function getItem(cmd, key) {
  return rawGet(cmd, fullKey(cmd, key));
}

async function setItem(cmd, key, value) {
  ensureRunnable(cmd);
  const fk = fullKey(cmd, key);
  const oldStored = await rawGet(cmd, fk);
  await validateStorageLimit(cmd, key, value, oldStored);
  const oldValue = parseStored(oldStored);
  const stored = JSON.stringify(value);
  if (cmd.engine === "memory") memoryStore.set(fk, stored);
  else if (cmd.engine === "local") localStorage.setItem(fk, stored);
  else if (cmd.engine === "session") sessionStorage.setItem(fk, stored);
  else if (cmd.engine === "cookie") cookieSet(fk, stored);
  else if (cmd.engine === "cache") {
    const cache = await cacheStorage(cmd);
    await cache.put(
      cacheUrl(fk),
      new Response(stored, { headers: { "Content-Type": "application/json" } }),
    );
  } else if (cmd.engine === "indexeddb")
    await idb(cmd, "readwrite", (store) =>
      store.put({ key: fk, value: stored }),
    );
  else {
    const db = await sqliteDb(cmd);
    db.exec({
      sql: "INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)",
      bind: [fk, stored],
    });
  }
  triggerWatcher(cmd, key, value, oldValue);
}

async function removeItem(cmd, key) {
  ensureRunnable(cmd);
  const fk = fullKey(cmd, key);
  const oldValue = parseStored(await rawGet(cmd, fk));
  if (cmd.engine === "memory") memoryStore.delete(fk);
  else if (cmd.engine === "local") localStorage.removeItem(fk);
  else if (cmd.engine === "session") sessionStorage.removeItem(fk);
  else if (cmd.engine === "cookie") cookieRemove(fk);
  else if (cmd.engine === "cache") {
    const cache = await cacheStorage(cmd);
    await cache.delete(cacheUrl(fk));
  } else if (cmd.engine === "indexeddb")
    await idb(cmd, "readwrite", (store) => store.delete(fk));
  else {
    const db = await sqliteDb(cmd);
    db.exec({
      sql: "DELETE FROM kv WHERE key = ?",
      bind: [fk],
    });
  }
  triggerWatcher(cmd, key, null, oldValue);
  return oldValue;
}

async function keys(cmd) {
  ensureRunnable(cmd);
  const p = prefix(cmd);
  if (cmd.engine === "memory")
    return Array.from(memoryStore.keys()).filter((key) => key.startsWith(p));
  if (cmd.engine === "local")
    return Object.keys(localStorage).filter((key) => key.startsWith(p));
  if (cmd.engine === "session")
    return Object.keys(sessionStorage).filter((key) => key.startsWith(p));
  if (cmd.engine === "cookie")
    return cookieEntries()
      .map(([key]) => key)
      .filter((key) => key.startsWith(p));
  if (cmd.engine === "cache") {
    const cache = await cacheStorage(cmd);
    const requests = await cache.keys();
    return requests
      .map((request) => keyFromCacheUrl(request.url))
      .filter((key) => key && key.startsWith(p));
  }
  if (cmd.engine === "indexeddb")
    return (await idb(cmd, "readonly", (store) => store.getAllKeys()))
      .map(String)
      .filter((key) => key.startsWith(p));

  const db = await sqliteDb(cmd);
  const found = [];
  db.exec({
    sql: "SELECT key FROM kv WHERE key LIKE ?",
    bind: [`${p}%`],
    callback: (row) => found.push(row[0]),
  });
  return found;
}

async function allData(cmd) {
  const p = prefix(cmd);
  const data = {};
  for (const key of await keys(cmd))
    data[key.replace(p, "")] = parseStored(await rawGet(cmd, key));
  return data;
}

function response(cmd, ok, data, message, extra = {}) {
  return {
    ok,
    operation: cmd.operation,
    engine: cmd.engine,
    dbName: cmd.dbName,
    namespace: cmd.namespace,
    data,
    message,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}
function requireKey(cmd) {
  if (!cmd.key) throw new Error(`Operation "${cmd.operation}" requires a key.`);
}
function watcherId(cmd, key) {
  return `${cmd.engine}|${cmd.dbName}|${cmd.namespace}|${key}`;
}
function triggerWatcher(cmd, key, newValue, oldValue) {
  if (!watchers.has(watcherId(cmd, key))) return;
  addLog(
    response(
      { ...cmd, operation: "watch:callback" },
      true,
      { key, newValue, oldValue },
      "Watcher callback triggered.",
    ),
  );
}

async function execute(cmd) {
  ensureRunnable(cmd);
  const op = cmd.operation;
  if (["create", "insert"].includes(op)) {
    requireKey(cmd);
    if ((await getItem(cmd, cmd.key)) !== null)
      return response(cmd, false, null, "Key already exists.", {
        key: cmd.key,
      });
    await setItem(cmd, cmd.key, cmd.value);
    return response(cmd, true, cmd.value, "Data created.", { key: cmd.key });
  }
  if (["save", "set", "namespace"].includes(op)) {
    requireKey(cmd);
    await setItem(cmd, cmd.key, cmd.value);
    return response(cmd, true, cmd.value, "Data saved.", { key: cmd.key });
  }
  if (op === "update") {
    requireKey(cmd);
    if ((await getItem(cmd, cmd.key)) === null)
      return response(cmd, false, null, "Key not found.", { key: cmd.key });
    await setItem(cmd, cmd.key, cmd.value);
    return response(cmd, true, cmd.value, "Data updated.", { key: cmd.key });
  }
  if (["find", "findOne"].includes(op)) {
    requireKey(cmd);
    const stored = await getItem(cmd, cmd.key);
    return response(
      cmd,
      stored !== null,
      parseStored(stored),
      stored === null ? "Key not found." : "Data found.",
      { key: cmd.key },
    );
  }
  if (op === "findAll") {
    const data = await allData(cmd);
    return response(
      cmd,
      true,
      data,
      `${Object.keys(data).length} item(s) found.`,
    );
  }
  if (op === "saveMany") {
    for (const [key, value] of Object.entries(cmd.items || {}))
      await setItem(cmd, key, value);
    return response(
      cmd,
      true,
      cmd.items || {},
      `${Object.keys(cmd.items || {}).length} item(s) saved.`,
    );
  }
  if (op === "createMany") {
    const created = {},
      skipped = [];
    for (const [key, value] of Object.entries(cmd.items || {})) {
      if ((await getItem(cmd, key)) !== null) skipped.push(key);
      else {
        await setItem(cmd, key, value);
        created[key] = value;
      }
    }
    return response(
      cmd,
      skipped.length === 0,
      { created, skipped },
      `${Object.keys(created).length} item(s) created.`,
    );
  }
  if (op === "findMany") {
    const found = {};
    for (const key of cmd.keys || [])
      found[key] = parseStored(await getItem(cmd, key));
    return response(
      cmd,
      true,
      found,
      `${(cmd.keys || []).length} key(s) read.`,
    );
  }
  if (["destroy", "delete", "remove"].includes(op)) {
    requireKey(cmd);
    const oldValue = await removeItem(cmd, cmd.key);
    return response(
      cmd,
      oldValue !== null,
      oldValue,
      oldValue === null ? "Key not found." : "Data deleted.",
      { key: cmd.key },
    );
  }
  if (op === "destroyMany") {
    const removed = {};
    for (const key of cmd.keys || []) removed[key] = await removeItem(cmd, key);
    return response(
      cmd,
      true,
      removed,
      `${(cmd.keys || []).length} key(s) deleted.`,
    );
  }
  if (op === "truncate") {
    const allKeys = await keys(cmd);
    for (const key of allKeys)
      await removeItem(cmd, key.replace(prefix(cmd), ""));
    return response(
      cmd,
      true,
      { deleted: allKeys.length },
      "Namespace truncated.",
    );
  }
  if (op === "describe") {
    requireKey(cmd);
    const stored = await getItem(cmd, cmd.key);
    const data = parseStored(stored);
    return response(
      cmd,
      stored !== null,
      {
        key: cmd.key,
        exists: stored !== null,
        type:
          data === null ? "null" : Array.isArray(data) ? "array" : typeof data,
        estimatedBytes: stored ? new Blob([stored]).size : 0,
      },
      stored === null ? "Key not found." : "Metadata generated.",
    );
  }
  if (["getStatistic", "getStatistics"].includes(op)) {
    const data = await allData(cmd);
    const bytes = new Blob([JSON.stringify(data)]).size;
    return response(
      cmd,
      true,
      {
        totalKeys: Object.keys(data).length,
        estimatedBytes: bytes,
        estimatedKb: Number((bytes / 1024).toFixed(2)),
      },
      "Statistics generated.",
    );
  }
  if (op === "transaction") {
    for (const [key, value] of Object.entries(cmd.items || {}))
      await setItem(cmd, key, value);
    return response(
      cmd,
      true,
      cmd.items || {},
      "Transaction simulation completed.",
    );
  }
  if (op === "watch") {
    requireKey(cmd);
    watchers.add(watcherId(cmd, cmd.key));
    await setItem(cmd, cmd.key, cmd.value);
    return response(
      cmd,
      true,
      { watchedKey: cmd.key, savedValue: cmd.value },
      "Watcher registered and triggered.",
    );
  }
  throw new Error(`Unsupported operation "${op}".`);
}

async function run() {
  try {
    const cmd = command();
    el.engine.value = cmd.engine;
    const result = await execute(cmd);
    setResult(result);
    addLog(result);
    await renderData(cmd);
  } catch (error) {
    const result = response(safeCommand(), false, null, error.message);
    setResult(result);
    addLog(result);
  }
}

async function seed() {
  const cmd = { ...safeCommand(), operation: "seed" };
  if (!runnableEngines.has(cmd.engine)) cmd.engine = "memory";
  const data = {
    "user:1": { name: "Kang Cahya", role: "admin", active: true },
    "user:2": { name: "Dedy", role: "user", active: true },
    "product:1": { name: "Laptop", price: 1000 },
    "settings:theme": { mode: "dark", accent: "purple" },
  };
  for (const [key, value] of Object.entries(data))
    await setItem(cmd, key, value);
  const result = response(cmd, true, data, "Demo data inserted.");
  setResult(result);
  addLog(result);
  await renderData(cmd);
}

async function renderData(cmd = safeCommand()) {
  if (!runnableEngines.has(cmd.engine)) {
    el.dataCount.textContent = "0 items";
    el.dataList.className = "data-list empty";
    el.dataList.textContent =
      "Selected engine cannot run in this static playground.";
    return;
  }
  const data = await allData(cmd);
  const entries = Object.entries(data);
  el.dataCount.textContent = `${entries.length} items`;
  if (entries.length === 0) {
    el.dataList.className = "data-list empty";
    el.dataList.textContent = "No data in the selected namespace.";
    return;
  }
  el.dataList.className = "data-list";
  el.dataList.innerHTML = entries
    .map(
      ([key, value]) =>
        `<article class="data-item"><div class="data-head"><span>${esc(key)}</span><small>${esc(cmd.engine)}</small></div><pre>${esc(JSON.stringify(value, null, 2))}</pre></article>`,
    )
    .join("");
}

function setResult(result) {
  el.result.textContent = JSON.stringify(result, null, 2);
  el.status.textContent = result.ok ? "Success" : "Error";
  el.status.className = `badge ${result.ok ? "success" : "error"}`;
}
function addLog(result) {
  logs.unshift(result);
  logs.splice(40);
  el.logCount.textContent = `${logs.length} logs`;
  el.activityLog.innerHTML = logs
    .map(
      (item) =>
        `<li><strong>${esc(item.operation)}</strong> Â· ${esc(item.engine)}<br><small>${esc(item.message)} Â· ${new Date(item.timestamp).toLocaleTimeString()}</small></li>`,
    )
    .join("");
}
function reset() {
  el.preset.value = "save";
  el.engine.value = "memory";
  applyPreset();
  el.status.textContent = "Ready";
  el.status.className = "badge";
  el.result.textContent = "Choose a preset and click Run Command.";
}
function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

init();
el.preset.addEventListener("change", applyPreset);
el.engine.addEventListener("change", syncEngine);
document.querySelector("#run").addEventListener("click", run);
document.querySelector("#seed").addEventListener("click", seed);
document
  .querySelector("#refresh")
  .addEventListener("click", () => renderData());
document.querySelector("#clear-log").addEventListener("click", () => {
  logs.length = 0;
  el.activityLog.innerHTML = "";
  el.logCount.textContent = "0 logs";
});
document.querySelector("#reset").addEventListener("click", reset);
renderData();
