# <i class="ri-lightbulb-flash-line"></i> Advanced Use Cases

This page provides detailed implementation patterns for complex application requirements using `OmniStorage`.

## <i class="ri-user-settings-line"></i> 1. Secure Authentication Flow

Manage user sessions with automatic cleanup and namespacing.

```javascript
import store from "@x-labs-myid/omnistorage";

// Configure dedicated session storage for auth
const auth = store.config("session").namespace("v1/auth");

/**
 * Handles post-login data persistence
 */
async function handleLogin(token, userProfile) {
  // Save token and profile atomically
  const tokenRes = await auth.save("jwt", token);
  const profileRes = await auth.save("me", {
    name: "Kang Cahya",
    address: "Jawa Barat, Indonesia",
    email: "cahya.dev@random.com"
  });

  if (tokenRes.ok && profileRes.ok) {
    console.log("Session started on engine:", tokenRes.engine);
  }
}

/**
 * Reactive theme switching based on stored preference
 */
const settings = store.namespace("app/settings");
settings.watch("theme", (newTheme) => {
  document.documentElement.setAttribute("data-theme", newTheme);
});
```

---

## <i class="ri-refresh-line"></i> 2. Multi-Tab Real-time Sync

Synchronize state across multiple browser tabs using the built-in watcher system.

```javascript
const sharedState = store.namespace("cloud/sync");

// This runs on all open tabs
sharedState.watch("last_activity", (data) => {
  console.log("Activity detected in another tab:", data.action);
  updateUI(data.payload);
});

// Trigger sync from any tab
async function broadcastAction(actionName, data) {
  await sharedState.save("last_activity", {
    action: actionName,
    payload: data,
    timestamp: Date.now(),
  });
}
```

---

## <i class="ri-shopping-cart-2-line"></i> 3. Offline-First Shopping Cart

Using `indexeddb` for large, persistent datasets that work without internet.

```javascript
const cart = store.config("indexeddb").namespace("shop/cart");

async function syncCartWithServer() {
  const itemsRes = await cart.findAll();

  if (itemsRes.data.length > 0) {
    const success = await api.post("/sync", itemsRes.data);
    if (success) {
      // Clear local cart after successful server sync
      await cart.truncate();
    }
  }
}

// Add item with validation
async function addItem(product) {
  const current = await cart.find("items", { defaultValue: [] });
  const updated = [...current.data, product];

  const res = await cart.save("items", updated);
  console.log(`Saved ${updated.length} items to ${res.engine}`);
}
```

---

## <i class="ri-speed-mini-line"></i> 4. Performance API Caching

Implementing a Time-To-Live (TTL) pattern using the `memory` engine for lightning-fast responses.

```javascript
const cache = store.config("memory").namespace("api/v2");

async function fetchWithCache(endpoint) {
  // 1. Check local memory first
  const cached = await cache.find(endpoint);

  // 2. Return if still fresh (custom logic)
  if (cached.ok && Date.now() - cached.timestamp < 60000) {
    return cached.data;
  }

  // 3. Fetch from network
  const response = await fetch(endpoint);
  const freshData = await response.json();

  // 4. Update cache
  await cache.save(endpoint, freshData);
  return freshData;
}
```
