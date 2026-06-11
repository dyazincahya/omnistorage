import { openDB } from "idb";
import { BaseEngine } from "../base.js";

const OMNISTORAGE_STORE_NAME = "omnistorage_kv";

export default class IndexedDBEngine extends BaseEngine {
  constructor(dbName = "MyStoreDB") {
    super(dbName, "indexeddb");

    this.storeName = OMNISTORAGE_STORE_NAME;
    this._dbPromise = null;
  }

  /**
   * Internal helper to get idb instance.
   */
  async _getIdb() {
    if (!this._dbPromise) {
      this._dbPromise = openDB(this.dbName, 2, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(OMNISTORAGE_STORE_NAME)) {
            db.createObjectStore(OMNISTORAGE_STORE_NAME, { keyPath: "key" });
          }
        },
      });
    }

    return this._dbPromise;
  }

  async getItemRaw(fullKey) {
    const db = await this._getIdb();
    const entry = await db.get(this.storeName, fullKey);
    return entry ? entry.value : null;
  }

  async getItem(key) {
    return this.getItemRaw(this._applyPrefix(key));
  }

  async setItem(key, value) {
    const db = await this._getIdb();
    await db.put(this.storeName, { key: this._applyPrefix(key), value });
  }

  async removeItem(key) {
    const db = await this._getIdb();
    await db.delete(this.storeName, this._applyPrefix(key));
  }

  async setItems(items) {
    const db = await this._getIdb();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    for (const [key, value] of Object.entries(items)) {
      await store.put({ key: this._applyPrefix(key), value });
    }
    await tx.done;
  }

  async removeItems(keys) {
    const db = await this._getIdb();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    for (const key of keys) {
      await store.delete(this._applyPrefix(key));
    }
    await tx.done;
  }

  async truncate() {
    const db = await this._getIdb();
    const tx = db.transaction(this.storeName, "readwrite");
    await tx.objectStore(this.storeName).clear();
    await tx.done;
  }

  async getAll() {
    const db = await this._getIdb();
    const all = await db.getAll(this.storeName);
    const prefix = `${this.dbName}_`;
    const results = {};

    all.forEach((item) => {
      if (item.key.startsWith(prefix)) {
        results[item.key.replace(prefix, "")] = item.value;
      }
    });

    return results;
  }

  async keys() {
    const db = await this._getIdb();
    const all = await db.getAllKeys(this.storeName);
    return all.map((key) => String(key));
  }
}
