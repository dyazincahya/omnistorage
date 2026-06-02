const memoryStore = new Map();
const idbConnections = new Map();
const activity = [];
const watchers = new Map();

const el = {
  operation: document.querySelector("#operation"),
  engine: document.querySelector("#engine"),
  dbName: document.querySelector("#db-name"),
  namespace: document.querySelector("#namespace"),
  key: document.querySelector("#key"),
  value: document.querySelector("#value"),
  keys: document.querySelector("#keys"),
  result: document.querySelector("#result"),
  status: document.querySelector("#status-pill"),
  dataList: document.querySelector("#data-list"),
  dataCount: document.querySelector("#data-count"),
  activityLog: document.querySelector("#activity-log"),
  logCount: document.querySelector("#log-count"),
};

const presets = {
  create: {
    key: "user:1",
    value: { name: "Kang Cahya", role: "admin", active: true },
    keys: ["user:1", "user:2"],
  },
  save: {
    key: "user:1",
    value: { name: "Kang Cahya", role: "developer", active: true },
    keys: ["user:1", "user:2"],
  },
  update: {
    key: "user:1",
    value: { name: "Kang Cahya Updated", role: "maintainer", active: true },
    keys: ["user:1", "user:2"],
  },
  insert: {
    key: "user:3",
    value: { name: "Inserted User", role: "guest", active: false },
    keys: ["user:1", "user:3"],
  },
  set: {
    key: "settings:theme",
    value: { mode: "dark", accent: "purple" },
    keys: ["settings:theme"],
  },
  find: { key: "user:1", value: null, keys: ["user:1", "user:2"] },
  findOne: { key: "user:1", value: null, keys: ["user:1", "user:2"] },
  findAll: { key: "", value: null, keys: [] },
  saveMany: {
    key: "",
    value: {
      "product:1": { name: "Laptop", price: 1000 },
      "product:2": { name: "Mouse", price: 25 },
    },
    keys: ["product:1", "product:2"],
  },
  createMany: {
    key: "",
    value: {
      "batch:1": { value: "A" },
      "batch:2": { value: "B" },
    },
    keys: ["batch:1", "batch:2"],
  },
  findMany: { key: "", value: null, keys: ["user:1", "user:2", "product:1"] },
  destroy: { key: "user:1", value: null, keys: ["user:1"] },
  delete: { key: "user:1", value: null, keys: ["user:1"] },
  remove: { key: "user:1", value: null, keys: ["user:1"] },
  destroyMany: { key: "", value: null, keys: ["user:1", "user:2"] },
  truncate: { key: "", value: null, keys: [] },
  describe: { key: "user:1", value: null, keys: ["user:1"] },
  getStatistic: { key: "", value: null, keys: [] },
  getStatistics: { key: "", value: null, keys: [] },
  namespace: {
    key: "token",
    value: "secure-token-value",
    keys: ["token"],
  },
  transaction: {
    key: "",
    value: {
      "trx:1": { value: "A" },
      "trx:2": { value: "B" },
    },
    keys: ["trx:1", "trx:2"],
  },
  watch: {
    key: "settings:theme",
    value: { mode: "light", accent: "blue" },
    keys: ["settings:theme"],
  },
};

function config() {
  return {
    engine: el.engine.value,
    dbName: el.dbName.value.trim() || "demo_app",
    namespace: el.namespace.value.trim() || "default",
    key: el.key.value.trim(),
  };
}

function namespacePrefix() {
  const cfg = config();
  return cfg.dbName + "_" + cfg.namespace + ":";
}

function storageKey(key) {
  return namespacePrefix() + key;
}

function parseJsonField(field, fallback) {
  const raw = field.value.trim();
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function valuePayload() {
  return parseJsonField(el.value, null);
}

function keyList() {
  const parsed = parseJsonField(el.keys, []);
  return Array.isArray(parsed) ? parsed : [];
}

function stringify(value) {
  return JSON.stringify(value);
}

function parseStored(value) {
  if (value === null || value === undefined) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

async function openIndexedDb(dbName) {
  if (idbConnections.has(dbName)) return idbConnections.get(dbName);

  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("kv")) {
        db.createObjectStore("kv", { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  idbConnections.set(dbName, db);
  return db;
}

async function idb(mode, callback) {
  const db = await openIndexedDb(config().dbName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction("kv", mode);
    const store = tx.objectStore("kv");
    const request = callback(store);
    if (request) {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } else {
      tx.oncomplete = () => resolve(undefined);
    }
    tx.onerror = () => reject(tx.error);
  });
}

async function rawGet(fullKey) {
  const engine = config().engine;
  if (engine === "memory") return memoryStore.get(fullKey) ?? null;
  if (engine === "local") return localStorage.getItem(fullKey);
  if (engine === "session") return sessionStorage.getItem(fullKey);
  if (engine === "indexeddb") {
    const entry = await idb("readonly", (store) => store.get(fullKey));
    return entry ? entry.value : null;
  }
  return null;
}

async function getItem(key) {
  return rawGet(storageKey(key));
}

async function setItem(key, value) {
  const engine = config().engine;
  const fullKey = storageKey(key);
  const stored = stringify(value);
  const oldValue = parseStored(await rawGet(fullKey));

  if (engine === "memory") memoryStore.set(fullKey, stored);
  if (engine === "local") localStorage.setItem(fullKey, stored);
  if (engine === "session") sessionStorage.setItem(fullKey, stored);
  if (engine === "indexeddb") {
    await idb("readwrite", (store) =>
      store.put({ key: fullKey, value: stored }),
    );
  }

  triggerWatchers(key, value, oldValue);
}

async function removeItem(key) {
  const engine = config().engine;
  const fullKey = storageKey(key);
  const oldValue = parseStored(await rawGet(fullKey));

  if (engine === "memory") memoryStore.delete(fullKey);
  if (engine === "local") localStorage.removeItem(fullKey);
  if (engine === "session") sessionStorage.removeItem(fullKey);
  if (engine === "indexeddb")
    await idb("readwrite", (store) => store.delete(fullKey));

  triggerWatchers(key, null, oldValue);
  return oldValue;
}

async function allFullKeys() {
  const engine = config().engine;
  const prefix = namespacePrefix();

  if (engine === "memory") {
    return Array.from(memoryStore.keys()).filter((key) =>
      key.startsWith(prefix),
    );
  }
  if (engine === "local")
    return Object.keys(localStorage).filter((key) => key.startsWith(prefix));
  if (engine === "session")
    return Object.keys(sessionStorage).filter((key) => key.startsWith(prefix));
  if (engine === "indexeddb") {
    const keys = await idb("readonly", (store) => store.getAllKeys());
    return keys.map(String).filter((key) => key.startsWith(prefix));
  }

  return [];
}

async function allData() {
  const prefix = namespacePrefix();
  const data = {};
  for (const fullKey of await allFullKeys()) {
    const cleanKey = fullKey.replace(prefix, "");
    data[cleanKey] = parseStored(await rawGet(fullKey));
  }
  return data;
}

function createResponse(ok, operation, data, message, extra = {}) {
  return {
    ok,
    operation,
    data,
    message,
    engine: config().engine,
    dbName: config().dbName,
    namespace: config().namespace,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

function setResult(result) {
  el.result.textContent = JSON.stringify(result, null, 2);
  el.status.textContent = result.ok ? "Success" : "Error";
  el.status.className = "pill " + (result.ok ? "success" : "error");
}

function addLog(result) {
  activity.unshift(result);
  activity.splice(40);
  el.logCount.textContent = activity.length + " logs";
  el.activityLog.innerHTML = activity
    .map((item) => {
      const time = new Date(item.timestamp).toLocaleTimeString();
      return (
        "<li><strong>" +
        escapeHtml(item.operation) +
        "</strong> · " +
        escapeHtml(item.engine) +
        "<br><small>" +
        escapeHtml(item.message) +
        " · " +
        time +
        "</small></li>"
      );
    })
    .join("");
}

function triggerWatchers(key, newValue, oldValue) {
  const watcherKey =
    config().engine +
    "|" +
    config().dbName +
    "|" +
    config().namespace +
    "|" +
    key;
  if (!watchers.has(watcherKey)) return;

  const log = createResponse(
    true,
    "watch:callback",
    { key, newValue, oldValue },
    "Watcher callback triggered.",
  );
  addLog(log);
}

async function runOperation() {
  const operation = el.operation.value;
  const key = config().key;
  const value = valuePayload();
  const keys = keyList();
  let result;

  if (
    [
      "create",
      "save",
      "update",
      "insert",
      "set",
      "find",
      "findOne",
      "destroy",
      "delete",
      "remove",
      "describe",
      "watch",
    ].includes(operation) &&
    !key
  ) {
    throw new Error("Key is required for this operation.");
  }

  if (operation === "create" || operation === "insert") {
    const existing = await getItem(key);
    if (existing !== null) {
      result = createResponse(false, operation, null, "Key already exists.", {
        key,
      });
    } else {
      await setItem(key, value);
      result = createResponse(true, operation, value, "Data created.", { key });
    }
  } else if (operation === "save" || operation === "set") {
    await setItem(key, value);
    result = createResponse(true, operation, value, "Data saved.", { key });
  } else if (operation === "update") {
    const existing = await getItem(key);
    if (existing === null) {
      result = createResponse(false, operation, null, "Key not found.", {
        key,
      });
    } else {
      await setItem(key, value);
      result = createResponse(true, operation, value, "Data updated.", { key });
    }
  } else if (operation === "find" || operation === "findOne") {
    const stored = await getItem(key);
    result = createResponse(
      stored !== null,
      operation,
      parseStored(stored),
      stored === null ? "Key not found." : "Data found.",
      { key },
    );
  } else if (operation === "findAll") {
    const data = await allData();
    result = createResponse(
      true,
      operation,
      data,
      Object.keys(data).length + " item(s) found.",
    );
  } else if (operation === "saveMany") {
    for (const [itemKey, itemValue] of Object.entries(value || {}))
      await setItem(itemKey, itemValue);
    result = createResponse(
      true,
      operation,
      value,
      Object.keys(value || {}).length + " item(s) saved.",
    );
  } else if (operation === "createMany") {
    const created = {};
    const skipped = [];
    for (const [itemKey, itemValue] of Object.entries(value || {})) {
      if ((await getItem(itemKey)) !== null) skipped.push(itemKey);
      else {
        await setItem(itemKey, itemValue);
        created[itemKey] = itemValue;
      }
    }
    result = createResponse(
      skipped.length === 0,
      operation,
      { created, skipped },
      Object.keys(created).length + " item(s) created.",
    );
  } else if (operation === "findMany") {
    const found = {};
    for (const itemKey of keys)
      found[itemKey] = parseStored(await getItem(itemKey));
    result = createResponse(
      true,
      operation,
      found,
      keys.length + " key(s) read.",
    );
  } else if (
    operation === "destroy" ||
    operation === "delete" ||
    operation === "remove"
  ) {
    const oldValue = await removeItem(key);
    result = createResponse(
      oldValue !== null,
      operation,
      oldValue,
      oldValue === null ? "Key not found." : "Data deleted.",
      { key },
    );
  } else if (operation === "destroyMany") {
    const removed = {};
    for (const itemKey of keys) removed[itemKey] = await removeItem(itemKey);
    result = createResponse(
      true,
      operation,
      removed,
      keys.length + " key(s) deleted.",
    );
  } else if (operation === "truncate") {
    const keysToDelete = await allFullKeys();
    const prefix = namespacePrefix();
    for (const fullKey of keysToDelete)
      await removeItem(fullKey.replace(prefix, ""));
    result = createResponse(
      true,
      operation,
      { deleted: keysToDelete.length },
      "Namespace truncated.",
    );
  } else if (operation === "describe") {
    const stored = await getItem(key);
    const data = parseStored(stored);
    result = createResponse(
      stored !== null,
      operation,
      {
        key,
        exists: stored !== null,
        type:
          data === null ? "null" : Array.isArray(data) ? "array" : typeof data,
        estimatedBytes: stored ? new Blob([stored]).size : 0,
      },
      stored === null ? "Key not found." : "Metadata generated.",
      { key },
    );
  } else if (operation === "getStatistic" || operation === "getStatistics") {
    const data = await allData();
    const bytes = new Blob([JSON.stringify(data)]).size;
    result = createResponse(
      true,
      operation,
      {
        engine: config().engine,
        totalKeys: Object.keys(data).length,
        estimatedBytes: bytes,
        estimatedKb: Number((bytes / 1024).toFixed(2)),
      },
      "Statistics generated.",
    );
  } else if (operation === "namespace") {
    await setItem(key, value);
    result = createResponse(
      true,
      operation,
      { namespace: config().namespace, key, value },
      "Saved data inside the selected namespace.",
      { key },
    );
  } else if (operation === "transaction") {
    for (const [itemKey, itemValue] of Object.entries(value || {}))
      await setItem(itemKey, itemValue);
    result = createResponse(
      true,
      operation,
      value,
      "Transaction simulation completed.",
    );
  } else if (operation === "watch") {
    const watcherKey =
      config().engine +
      "|" +
      config().dbName +
      "|" +
      config().namespace +
      "|" +
      key;
    watchers.set(watcherKey, true);
    await setItem(key, value);
    result = createResponse(
      true,
      operation,
      { watchedKey: key, savedValue: value },
      "Watcher registered and triggered by save.",
      { key },
    );
  }

  setResult(result);
  addLog(result);
  await renderData();
}

async function seedData() {
  const seed = {
    "user:1": { name: "Kang Cahya", role: "admin", active: true },
    "user:2": { name: "Dedy", role: "user", active: true },
    "product:1": { name: "Laptop", price: 1000 },
    "settings:theme": { mode: "dark", accent: "purple" },
  };
  for (const [key, value] of Object.entries(seed)) await setItem(key, value);
  const result = createResponse(true, "seed", seed, "Demo data inserted.");
  setResult(result);
  addLog(result);
  await renderData();
}

async function renderData() {
  const data = await allData();
  const entries = Object.entries(data);
  el.dataCount.textContent = entries.length + " items";

  if (entries.length === 0) {
    el.dataList.className = "data-list empty";
    el.dataList.textContent = "No data in this namespace.";
    return;
  }

  el.dataList.className = "data-list";
  el.dataList.innerHTML = entries
    .map(([key, value]) => {
      return (
        '<article class="data-item"><div class="data-key"><span>' +
        escapeHtml(key) +
        "</span><small>" +
        escapeHtml(config().engine) +
        '</small></div><pre class="data-value">' +
        escapeHtml(JSON.stringify(value, null, 2)) +
        "</pre></article>"
      );
    })
    .join("");
}

function applyPreset() {
  const preset = presets[el.operation.value] || presets.save;
  el.key.value = preset.key;
  el.value.value =
    preset.value === null ? "" : JSON.stringify(preset.value, null, 2);
  el.keys.value = JSON.stringify(preset.keys, null, 2);
}

function resetPlayground() {
  el.operation.value = "save";
  el.engine.value = "memory";
  el.dbName.value = "demo_app";
  el.namespace.value = "default";
  applyPreset();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.querySelector("#run-operation").addEventListener("click", async () => {
  try {
    await runOperation();
  } catch (error) {
    const result = createResponse(
      false,
      el.operation.value,
      null,
      error.message,
    );
    setResult(result);
    addLog(result);
  }
});

document.querySelector("#seed").addEventListener("click", seedData);
document.querySelector("#refresh-data").addEventListener("click", renderData);
document.querySelector("#clear-log").addEventListener("click", () => {
  activity.length = 0;
  el.activityLog.innerHTML = "";
  el.logCount.textContent = "0 logs";
});
document
  .querySelector("#reset-demo")
  .addEventListener("click", resetPlayground);
el.operation.addEventListener("change", applyPreset);
for (const field of [el.engine, el.dbName, el.namespace]) {
  field.addEventListener("change", renderData);
  field.addEventListener("input", renderData);
}

resetPlayground();
renderData();
