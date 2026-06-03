# <i class="ri-lightbulb-flash-line"></i> Use Cases

This page provides practical implementation patterns for common application requirements using `OmniStorage`. Each example starts from the import so it can be copied into a project and adapted.

<h2 id="auth"><i class="ri-user-settings-line"></i> Secure Authentication Flow</h2>

Use `session` storage for browser session data and a namespace to keep authentication keys isolated.

```javascript
import store from "@x-labs-myid/omnistorage";

const auth = store.config("session").namespace("v1/auth");

async function handleLogin(token, userProfile) {
  const tokenRes = await auth.save("jwt", token);
  const profileRes = await auth.save("me", userProfile);

  if (tokenRes.ok && profileRes.ok) {
    console.log("Session started on engine:", tokenRes.engine);
  }
}

async function handleLogout() {
  await auth.truncate();
}

await handleLogin("session-token", {
  name: "Kang Cahya",
  address: "Jawa Barat, Indonesia",
  email: "cahya.dev@random.com",
});
```

---

<h2 id="preferences"><i class="ri-palette-line"></i> User Preferences</h2>

Use `local` for small preferences that should survive reloads and browser restarts.

```javascript
import store from "@x-labs-myid/omnistorage";

const preferences = store.config("local").namespace("app/preferences");

async function savePreferences() {
  await preferences.save("theme", "dark");
  await preferences.save("language", "en");
  await preferences.save("sidebar_collapsed", false);
}

async function applyTheme() {
  const theme = await preferences.find("theme", { defaultValue: "light" });
  document.documentElement.setAttribute("data-theme", theme.data);
}

preferences.watch("theme", (newTheme) => {
  document.documentElement.setAttribute("data-theme", newTheme);
});
```

---

<h2 id="multi-tab"><i class="ri-refresh-line"></i> Multi-Tab State Signal</h2>

Use a shared namespace to write a small signal whenever one tab changes something important. Other parts of the app can watch that key.

```javascript
import store from "@x-labs-myid/omnistorage";

const sharedState = store.config("local").namespace("cloud/sync");

sharedState.watch("last_activity", (data) => {
  console.log("Activity detected:", data.action);
  updateUI(data.payload);
});

async function broadcastAction(actionName, payload) {
  await sharedState.save("last_activity", {
    action: actionName,
    payload,
    timestamp: Date.now(),
  });
}
```

---

<h2 id="shopping-cart"><i class="ri-shopping-cart-2-line"></i> Offline-First Shopping Cart</h2>

Use `indexeddb` for a durable browser-side cart that can be synced later.

```javascript
import store from "@x-labs-myid/omnistorage";

const cart = store.config("indexeddb").namespace("shop/cart");

async function addItem(product) {
  const current = await cart.find("items", { defaultValue: [] });
  const updated = [...current.data, product];

  return await cart.save("items", updated);
}

async function syncCartWithServer(api) {
  const itemsRes = await cart.find("items", { defaultValue: [] });

  if (itemsRes.data.length === 0) return;

  const success = await api.post("/cart/sync", itemsRes.data);
  if (success) {
    await cart.destroy("items");
  }
}
```

---

<h2 id="api-cache"><i class="ri-speed-mini-line"></i> API Response Cache</h2>

Use `cache` for offline-friendly API snapshots or `memory` for very short-lived runtime cache.

```javascript
import store from "@x-labs-myid/omnistorage";

const apiCache = store.config("cache").namespace("api/products");

async function fetchProducts() {
  const cached = await apiCache.find("list", { defaultValue: null });

  if (cached.ok && cached.data) {
    return cached.data;
  }

  const response = await fetch("/api/products");
  const products = await response.json();

  await apiCache.save("list", products);
  return products;
}
```

---

<h2 id="form-draft"><i class="ri-file-edit-line"></i> Multi-Step Form Draft</h2>

Use `session` when draft data should only live for the current tab/session.

```javascript
import store from "@x-labs-myid/omnistorage";

const formDraft = store.config("session").namespace("checkout/draft");

async function saveStep(step, data) {
  await formDraft.save(`step:${step}`, data);
  await formDraft.save("current_step", step);
}

async function loadDraft() {
  const currentStep = await formDraft.find("current_step", { defaultValue: 1 });
  const data = await formDraft.find(`step:${currentStep.data}`, {
    defaultValue: {},
  });

  return {
    currentStep: currentStep.data,
    data: data.data,
  };
}
```

---

<h2 id="cookie-consent"><i class="ri-cookie-line"></i> Cookie Consent Flag</h2>

Use `cookie` only for very small values that may need server awareness. Avoid large or sensitive data.

```javascript
import store from "@x-labs-myid/omnistorage";

const consent = store.config("cookie").namespace("site/consent");

async function acceptCookies() {
  await consent.save("analytics", "accepted");
}

async function canLoadAnalytics() {
  const result = await consent.find("analytics", { defaultValue: "rejected" });
  return result.data === "accepted";
}
```

---

<h2 id="server-settings"><i class="ri-folder-open-line"></i> Node.js Local Settings File</h2>

Use `file` for simple server-side persistence when you do not need a database server.

```javascript
import store from "@x-labs-myid/omnistorage";

const settings = store.config("file").namespace("service/settings");

async function saveServiceConfig(config) {
  await settings.save("runtime", {
    port: config.port,
    logLevel: config.logLevel,
    updatedAt: new Date().toISOString(),
  });
}

async function loadServiceConfig() {
  const result = await settings.find("runtime", {
    defaultValue: { port: 3000, logLevel: "info" },
  });

  return result.data;
}
```

---

<h2 id="audit-log"><i class="ri-shield-check-line"></i> Durable Audit Log</h2>

Use `sqlite-server` for durable server-side data that should survive restarts with database reliability.

```javascript
import store from "@x-labs-myid/omnistorage";

const audit = store.config("sqlite-server").namespace("audit/events");

async function recordAuditEvent(event) {
  const key = `${Date.now()}:${event.type}`;

  await audit.create(key, {
    ...event,
    recordedAt: new Date().toISOString(),
  });
}

async function listAuditEvents() {
  return await audit.findAll();
}
```

---

<h2 id="browser-sqlite"><i class="ri-database-2-line"></i> Browser SQLite Workspace</h2>

Use `sqlite-client` when a browser app benefits from SQLite-backed local persistence and can tolerate the extra WASM cost.

```javascript
import store from "@x-labs-myid/omnistorage";

const workspace = store.config("sqlite-client").namespace("workspace/docs");

async function saveDocument(documentId, content) {
  await workspace.save(documentId, {
    content,
    updatedAt: Date.now(),
  });
}

async function loadDocument(documentId) {
  return await workspace.find(documentId, {
    defaultValue: { content: "", updatedAt: null },
  });
}
```

---

<h2 id="testing"><i class="ri-flask-line"></i> Test and Demo Storage</h2>

Use `memory` for tests, demos, and temporary state that should be cleared when the runtime ends.

```javascript
import store from "@x-labs-myid/omnistorage";

const demoStore = store.config("memory").namespace("demo/users");

async function seedDemoUsers() {
  await demoStore.saveMany({
    "user:1": { name: "Ayu", role: "admin" },
    "user:2": { name: "Budi", role: "viewer" },
  });

  return await demoStore.findAll();
}
```
