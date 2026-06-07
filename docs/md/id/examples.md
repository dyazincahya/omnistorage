# <i class="ri-lightbulb-flash-line"></i> Contoh Kasus

Halaman ini menyediakan pola implementasi praktis untuk kebutuhan aplikasi umum menggunakan `OmniStorage`. Setiap contoh dimulai dari import agar mudah disalin ke project dan disesuaikan.

<h2 id="auth"><i class="ri-user-settings-line"></i> Alur Autentikasi Aman</h2>

Gunakan engine `session` untuk data sesi browser dan namespace agar key autentikasi tetap terisolasi.

:::code-tabs
@tab Basic API

```javascript
import store from "@x-labs-myid/omnistorage";

const auth = store.engine("session").namespace("v1/auth");

async function handleLogin(token, userProfile) {
  const tokenRes = await auth.save("jwt", token);
  const profileRes = await auth.save("me", userProfile);

  if (tokenRes.ok && profileRes.ok) {
    console.log("Sesi dimulai menggunakan engine:", tokenRes.engine);
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

@tab JSON Payload

```javascript
import store from "@x-labs-myid/omnistorage";

const authCommand = {
  engine: "session",
  dbName: "my_app",
  namespace: "v1/auth",
};

async function handleLogin(token, userProfile) {
  const tokenRes = await store.command({
    ...authCommand,
    operation: "save",
    key: "jwt",
    value: token,
  });

  const profileRes = await store.command({
    ...authCommand,
    operation: "save",
    key: "me",
    value: userProfile,
  });

  if (tokenRes.ok && profileRes.ok) {
    console.log("Sesi dimulai menggunakan engine:", tokenRes.engine);
  }
}

async function handleLogout() {
  await store.command({ ...authCommand, operation: "truncate" });
}

await handleLogin("session-token", {
  name: "Kang Cahya",
  address: "Jawa Barat, Indonesia",
  email: "cahya.dev@random.com",
});
```

:::

---

<h2 id="preferences"><i class="ri-palette-line"></i> Preferensi Pengguna</h2>

Gunakan `local` untuk preferensi kecil yang harus tetap tersedia setelah reload atau browser restart.

```javascript
import store from "@x-labs-myid/omnistorage";

const preferences = store.engine("local").namespace("app/preferences");

async function savePreferences() {
  await preferences.save("theme", "dark");
  await preferences.save("language", "id");
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

<h2 id="multi-tab"><i class="ri-refresh-line"></i> Sinyal State Antar Tab</h2>

Gunakan namespace bersama untuk menulis sinyal kecil ketika satu tab mengubah sesuatu yang penting. Bagian aplikasi lain dapat memantau key tersebut.

```javascript
import store from "@x-labs-myid/omnistorage";

const sharedState = store.engine("local").namespace("cloud/sync");

sharedState.watch("last_activity", (data) => {
  console.log("Aktivitas terdeteksi:", data.action);
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

<h2 id="shopping-cart"><i class="ri-shopping-cart-2-line"></i> Keranjang Belanja Offline-First</h2>

Gunakan `indexeddb` untuk keranjang sisi browser yang durable dan bisa disinkronkan nanti.

```javascript
import store from "@x-labs-myid/omnistorage";

const cart = store.engine("indexeddb").namespace("shop/cart");

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

<h2 id="api-cache"><i class="ri-speed-mini-line"></i> Cache Response API</h2>

Gunakan `cache` untuk snapshot API yang ramah offline atau `memory` untuk cache runtime yang sangat singkat.

```javascript
import store from "@x-labs-myid/omnistorage";

const apiCache = store.engine("cache").namespace("api/products");

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

<h2 id="form-draft"><i class="ri-file-edit-line"></i> Draft Form Multi-Step</h2>

Gunakan `session` ketika draft hanya perlu hidup selama tab/sesi browser saat ini.

```javascript
import store from "@x-labs-myid/omnistorage";

const formDraft = store.engine("session").namespace("checkout/draft");

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

<h2 id="cookie-consent"><i class="ri-cookie-line"></i> Flag Persetujuan Cookie</h2>

Gunakan `cookie` hanya untuk nilai sangat kecil yang mungkin perlu diketahui server. Hindari data besar atau sensitif.

```javascript
import store from "@x-labs-myid/omnistorage";

const consent = store.engine("cookie").namespace("site/consent");

async function acceptCookies() {
  await consent.save("analytics", "accepted");
}

async function canLoadAnalytics() {
  const result = await consent.find("analytics", { defaultValue: "rejected" });
  return result.data === "accepted";
}
```

---

<h2 id="server-settings"><i class="ri-folder-open-line"></i> File Pengaturan Lokal Node.js</h2>

Gunakan `file` untuk persistensi server-side sederhana ketika tidak membutuhkan database server.

```javascript
import store from "@x-labs-myid/omnistorage";

const settings = store.engine("file").namespace("service/settings");

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

<h2 id="audit-log"><i class="ri-shield-check-line"></i> Audit Log Durable</h2>

Gunakan `sqlite-server` untuk data server-side durable yang harus bertahan setelah restart dengan reliabilitas database.

```javascript
import store from "@x-labs-myid/omnistorage";

const audit = store.engine("sqlite-server").namespace("audit/events");

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

<h2 id="browser-sqlite"><i class="ri-database-2-line"></i> Workspace SQLite Browser</h2>

Gunakan `sqlite-client` ketika aplikasi browser mendapat manfaat dari persistensi lokal berbasis SQLite dan siap menerima biaya tambahan WebAssembly.

```javascript
import store from "@x-labs-myid/omnistorage";

const workspace = store.engine("sqlite-client").namespace("workspace/docs");

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

<h2 id="command-runner"><i class="ri-terminal-box-line"></i> Admin JSON Command Runner</h2>

Gunakan `store.command(payload)` ketika aplikasi membutuhkan storage console berbasis JSON, panel admin, workflow automation, runner fixture test, atau tool low-code. UI dapat mengirim payload terstruktur tanpa harus membuat percabangan manual untuk setiap method OmniStorage.

Pola ini berguna ketika command berasal dari form, preset tersimpan, konfigurasi remote, atau interface seperti playground.

```javascript
import store from "@x-labs-myid/omnistorage";

const allowedOperations = new Set([
  "save",
  "find",
  "findAll",
  "saveMany",
  "destroy",
  "truncate",
]);

async function runAdminStorageCommand(inputPayload) {
  if (!allowedOperations.has(inputPayload.operation)) {
    return {
      ok: false,
      message: `Operation "${inputPayload.operation}" tidak diizinkan di sini.`,
    };
  }

  // Opsional: konfirmasi operasi destruktif di UI sebelum titik ini.
  return await store.command({
    engine: inputPayload.engine || "memory",
    dbName: inputPayload.dbName || "admin_tools",
    namespace: inputPayload.namespace || "sandbox",
    ...inputPayload,
  });
}

const result = await runAdminStorageCommand({
  operation: "save",
  engine: "memory",
  key: "user:1",
  value: {
    name: "Kang Cahya",
    role: "developer",
    active: true,
  },
});

console.log(result.command);
console.log(result.data);
```

Contoh payload preset dapat disimpan dan digunakan ulang:

```javascript
const presets = {
  saveUser: {
    operation: "save",
    engine: "local",
    dbName: "demo_app",
    namespace: "users",
    key: "user:1",
    value: { name: "Ayu", role: "admin" },
  },
  listUsers: {
    operation: "findAll",
    engine: "local",
    dbName: "demo_app",
    namespace: "users",
  },
};

await store.command(presets.saveUser);
const users = await store.command(presets.listUsers);
```

> Untuk tool yang dapat diakses publik, whitelist operasi yang boleh dijalankan dan minta konfirmasi sebelum command destruktif seperti `destroy`, `destroyMany`, `truncate`, atau `clear`.

---

<h2 id="testing"><i class="ri-flask-line"></i> Penyimpanan Test dan Demo</h2>

Gunakan `memory` untuk test, demo, dan state sementara yang hilang ketika runtime berakhir.

```javascript
import store from "@x-labs-myid/omnistorage";

const demoStore = store.engine("memory").namespace("demo/users");

async function seedDemoUsers() {
  await demoStore.saveMany({
    "user:1": { name: "Ayu", role: "admin" },
    "user:2": { name: "Budi", role: "viewer" },
  });

  return await demoStore.findAll();
}
```
