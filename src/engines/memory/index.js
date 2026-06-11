import { BaseEngine } from "../base.js";

export default class MemoryEngine extends BaseEngine {
  constructor(dbName) {
    super(dbName, "memory");
    this._store = new Map();
  }

  async getItemRaw(fullKey) {
    const value = this._store.get(fullKey);
    return value !== undefined ? value : null;
  }

  async getItem(key) {
    return await this.getItemRaw(this._applyPrefix(key));
  }

  async setItem(key, value) {
    this._store.set(this._applyPrefix(key), value);
  }

  async removeItem(key) {
    this._store.delete(this._applyPrefix(key));
  }

  async truncate() {
    this._store.clear();
  }

  async getAll() {
    const results = {};
    const prefix = `${this.dbName}_`;

    for (const [key, value] of this._store.entries()) {
      if (key.startsWith(prefix)) {
        const cleanKey = key.replace(prefix, "");
        results[cleanKey] = value;
      }
    }

    return results;
  }

  async keys() {
    return Array.from(this._store.keys());
  }
}
