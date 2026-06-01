import Dexie from "dexie";
import { openDB } from "idb";
import { BaseEngine } from "../base.js";

export default class IndexedDBEngine extends BaseEngine {
  constructor(dbName = "MyStoreDB") {
    super(dbName, "indexeddb");

    // Initialize Dexie for Reading/Searching
    this.dexie = new Dexie(dbName);
    this.dexie.version(1).stores({
      kv: "key",
    });

    this.storeName = "kv";
  }

  /**
   * Internal helper to get idb instance for Writing/Editing/Deleting
   */
  async _getIdb() {
    return openDB(this.dbName, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("kv")) {
          db.createObjectStore("kv", { keyPath: "key" });
        }
      },
    });
  }

  async getItemRaw(fullKey) {
    // Using Dexie for Reading
    const entry = await this.dexie.kv.get(fullKey);
    return entry ? entry.value : null;
  }

  async getItem(key) {
    // Using Dexie for Reading
    const entry = await this.dexie.kv.get(key);
    return entry ? entry.value : null;
  }

  async setItem(key, value) {
    // Using idb for Inserting/Editing
    const db = await this._getIdb();
    await db.put(this.storeName, { key, value });
  }

  async removeItem(key) {
    // Using idb for Deleting
    const db = await this._getIdb();
    await db.delete(this.storeName, key);
  }

  async setItems(items) {
    const db = await this._getIdb();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    for (const [key, value] of Object.entries(items)) {
      await store.put({ key, value });
    }
    await tx.done;
  }

  async removeItems(keys) {
    const db = await this._getIdb();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    for (const key of keys) {
      await store.delete(key);
    }
    await tx.done;
  }

  async truncate() {
    // Using idb for Clearing
    const db = await this._getIdb();
    const tx = db.transaction(this.storeName, "readwrite");
    await tx.objectStore(this.storeName).clear();
    await tx.done;
  }

  async getAll() {
    // Using Dexie for Reading all
    const all = await this.dexie.kv.toArray();
    const results = {};
    all.forEach((item) => {
      results[item.key] = item.value;
    });
    return results;
  }

  async keys() {
    // Using Dexie for Searching/Listing keys
    const all = await this.dexie.kv.toArray();
    return all.map((item) => item.key);
  }
}
