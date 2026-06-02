const memoryStore = new Map();
const idbConnections = new Map();
const activity = [];

const elements = {
  form: document.querySelector("#storage-form"),
  engine: document.querySelector("#engine"),
  dbName: document.querySelector("#db-name"),
  namespace: document.querySelector("#namespace"),
  key: document.querySelector("#key"),
  value: document.querySelector("#value"),
  result: document.querySelector("#result"),
  statusPill: document.querySelector("#status-pill"),
  dataList: document.querySelector("#data-list"),
  activityLog: document.querySelector("#activity-log"),
};

const buttons = {
  create: document.querySelector("#create"),
  save: document.querySelector("#save"),
  update: document.querySelector("#update"),
  find: document.querySelector("#find"),
  remove: document.querySelector("#remove"),
  findAll: document.querySelector("#find-all"),
  seed: document.querySelector("#seed"),
  stats: document.querySelector("#stats"),
  truncate: document.querySelector("#truncate"),
  refreshData: document.querySelector("#refresh-data"),
  clearLog: document.querySelector("#clear-log"),
  resetDemo: document.querySelector("#reset-demo"),
};

function getConfig() {
  return {
    engine: elements.engine.value,
    dbName: elements.dbName.value.trim() || "demo_app",
    namespace: elements.namespace.value.trim() || "default",
    key: elements.key.value.trim(),
  };
}

function fullKey(key = getConfig().key) {
  const { dbName, namespace } = getConfig();
  return `${dbName}_${namespace}:${key}`;
}

function parseValue() {
  const raw = elements.value.value.trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function serialize(value) {
  return JSON.stringify(value);
}

function deserialize(value) {
  if (value === null || value === undefined) return null;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function response({ ok, operation, data = null, message = "", key = getConfig().key }) {
  return {
    ok,
    operation,
    key,
    data,
    message,
    engine: getConfig().engine,
    dbName: getConfig().dbName,
    namespace: getConfig().namespace,
    timestamp: new Date().toISOString(),
  };
}

function setResult(result) {
  elements.result.textContent = JSON.stringify(result, null, 2);
  elements.statusPill.textContent = result.ok ? "Success" : "Error";
  elements.statusPill.className = `pill ${result.ok ? "success" : "error"}`;
}

function addActivity(result) {
  activity.unshift(result);
  activity.splice(30);
  renderActivity();
}

function renderActivity() {
  elements.activityLog.innerHTML = activity
    .map(
      (item) => `
        <li>
          <strong>${item.operation}</strong> · ${item.engine} · ${item.key || "-"}<br>
          <small>${item.message} · ${new Date(item.timestamp).toLocaleTimeString()}</small>
        </li>
      `,
    )
    .join("");
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

async function idbRequest(mode, callback) {
  const db = await openIndexedDb(getConfig().dbName);

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

async function engineGet(key) {
  const { engine } = getConfig();
  const storageKey = fullKey(key);

  if (engine === "memory") return memoryStore.get(storageKey) ?? null;
  if (engine === "local") return localStorage.getItem(storageKey);
  if (engine === "session") return sessionStorage.getItem(storageKey);
  if (engine === "indexeddb") {
    const entry = await idbRequest("readonly", (store) => store.get(storageKey));
    return entry?.value ?? null;
  }

  return null;
}

async function engineSet(key, value) {
  const { engine } = getConfig();
  const storageKey = fullKey(key);
  const storedValue = serialize(value);

  if (engine === "memory") memoryStore.set(storageKey, storedValue);
  if (engine === "local") localStorage.setItem(storageKey, storedValue);
  if (engine === "session") sessionStorage.setItem(storageKey, storedValue);
  if (engine === "indexeddb") {
    await idbRequest("readwrite", (store) =>
      store.put({ key: storageKey, value: storedValue }),
    );
  }
}

async function engineRemove(key) {
  const { engine } = getConfig();
  const storageKey = fullKey(key);

  if (engine === "memory") memoryStore.delete(storageKey);
  if (engine === "local") localStorage.removeItem(storageKey);
  if (engine === "session") sessionStorage.removeItem(storageKey);
  if (engine === "indexeddb") {
    await idbRequest("readwrite", (store) => store.delete(storageKey));
  }
}

async function engineKeys() {
  const { engine, dbName, namespace } = getConfig();
  const prefix = `${dbName}_${namespace}:`;

  if (engine === "memory") {
    return Array.from(memoryStore.keys()).filter((key) => key.startsWith(prefix));
  }

  if (engine === "local") {
    return Object.keys(localStorage).filter((key) => key.startsWith(prefix));
  }

  if (engine === "session") {
    return Object.keys(sessionStorage).filter((key) => key.startsWith(prefix));
  }

  if (engine === "indexeddb") {
    const keys = await idbRequest("readonly", (store) => store.getAllKeys());
    return keys.map(String).filter((key) => key.startsWith(prefix));
  }

  return [];
}

async function engineAll() {
  const keys = await engineKeys();
  const { dbName, namespace } = getConfig();
  const prefix = `${dbName}_${namespace}:`;
  const data = {};

  for (const key of keys) {
    const cleanKey = key.replace(prefix, "");
    data[cleanKey] = deserialize(await engineGet(cleanKey));
  }

  return data;
}

async function runOperation(operation) {
  try {
    const { key } = getConfig();
    let result;

    if (["create", "save", "update", "find", "remove"].includes(operation) && !key) {
      throw new Error("Key is required for this operation.");
    }

    if (operation === "create") {
      const existing = await engineGet(key);
      if (existing !== null) {
        result = response({ ok: false, operation, message: "Key already exists.", key });
      } else {
        const value = parseValue();
        await engineSet(key, value);
        result = response({ ok: true, operation, data: value, message: "Data created.", key });
      }
    }

    if (operation === "save") {
      const value = parseValue();
      await engineSet(key, value);
      result = response({ ok: true, operation, data: value, message: "Data saved.", key });
    }

    if (operation === "update") {
      const existing = await engineGet(key);
      if (existing === null) {
        result = response({ ok: false, operation, message: "Key not found.", key });
      } else {
        const value = parseValue();
        await engineSet(key, value);
        result = response({ ok: true, operation, data: value, message: "Data updated.", key });
      }
    }

    if (operation === "find") {
      const stored = await engineGet(key);
      result = response({
        ok: stored !== null,
        operation,
        data: deserialize(stored),
        message: stored === null ? "Key not found." : "Data found.",
        key,
      });
    }

    if (operation === "remove") {
      const existing = await engineGet(key);
      await engineRemove(key);
      result = response({
        ok: existing !== null,
        operation,
        data: deserialize(existing),
        message: existing === null ? "Key not found." : "Data deleted.",
        key,
      });
    }

    if (operation === "findAll") {
      const data = await engineAll();
      result = response({ ok: true, operation, data, message: `${Object.keys(data).length} item(s) found.` });
    }

    if (operation === "truncate") {
      const keys = await engineKeys();
      for (const storageKey of keys) {
        const cleanKey = storageKey.split(":").slice(1).join(":");
        await engineRemove(cleanKey);
      }
      result = response({ ok: true, operation, data: { deleted: keys.length }, message: "Namespace truncated." });
    }

    if (operation === "stats") {
      const keys = await engineKeys();
      const data = await engineAll();
      const bytes = new Blob([JSON.stringify(data)]).size;
      result = response({
        ok: true,
        operation,
        data: {
          totalKeys: keys.length,
          estimatedBytes: bytes,
          estimatedKb: Number((bytes / 1024).toFixed(2)),
        },
        message: "Statistics calculated.",
      });
    }

    setResult(result);
    addActivity(result);
    await renderDataList();
  } catch (error) {
    const result = response({ ok: false, operation, message: error.message });
    setResult(result);
    addActivity(result);
  }
}

async function seedDemoData() {
  const users = {
    "user:1": { name: "Kang Cahya", role: "admin", active: true },
    "user:2": { name: "Dedy", role: "user", active: true },
    "settings:theme": { mode: "dark", accent: "blue" },
  };

  for (const [key, value] of Object.entries(users)) {
    await engineSet(key, value);
  }

  const result = response({ ok: true, operation: "seed", data: users, message: "Demo data inserted." });
  setResult(result);
  addActivity(result);
  await renderDataList();
}

async function renderDataList() {
  const data = await engineAll();
  const entries = Object.entries(data);

  if (entries.length === 0) {
    elements.dataList.className = "data-list empty";
    elements.dataList.textContent = "No data in this namespace.";
    return;
  }

  elements.dataList.className = "data-list";
  elements.dataList.innerHTML = entries
    .map(
      ([key, value]) => `
        <article class="data-item">
          <div class="data-key">
            <span>${key}</span>
            <small>${getConfig().engine}</small>
          </div>
          <pre class="data-value">${escapeHtml(JSON.stringify(value, null, 2))}</pre>
        </article>
      `,
    )
    .join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function resetDemoForm() {
  elements.engine.value = "memory";
  elements.dbName.value = "demo_app";
  elements.namespace.value = "default";
  elements.key.value = "user:1";
  elements.value.value = JSON.stringify(
    { name: "Kang Cahya", role: "developer", active: true },
    null,
    2,
  );
}

buttons.create.addEventListener("click", () => runOperation("create"));
buttons.save.addEventListener("click", () => runOperation("save"));
buttons.update.addEventListener("click", () => runOperation("update"));
buttons.find.addEventListener("click", () => runOperation("find"));
buttons.remove.addEventListener("click", () => runOperation("remove"));
buttons.findAll.addEventListener("click", () => runOperation("findAll"));
buttons.truncate.addEventListener("click", () => runOperation("truncate"));
buttons.stats.addEventListener("click", () => runOperation("stats"));
buttons.seed.addEventListener("click", seedDemoData);
buttons.refreshData.addEventListener("click", renderDataList);
buttons.clearLog.addEventListener("click", () => {
  activity.length = 0;
  renderActivity();
});
buttons.resetDemo.addEventListener("click", resetDemoForm);

for (const field of [elements.engine, elements.dbName, elements.namespace]) {
  field.addEventListener("change", renderDataList);
  field.addEventListener("input", renderDataList);
}

renderDataList();
