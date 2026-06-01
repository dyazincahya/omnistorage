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

## <i class="ri-settings-4-line"></i> Basic Operations

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

## <i class="ri-search-eye-line"></i> Data Retrieval

### <i class="ri-find-replace-line"></i> `.find(key, options?)`

Retrieves a single data entry. You can pass options to validate the returned data type.

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

## <i class="ri-delete-bin-line"></i> Deletion

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

## <i class="ri-rocket-2-line"></i> Advanced Features

### <i class="ri-eye-line"></i> `.watch(key, callback)`

Monitors changes to a specific key. Returns an `unwatch` function.
