import { Cacheable } from "cacheable";
import is from "is";
import { BaseEngine } from "../base.js";

export default class MemoryEngine extends BaseEngine {
  constructor(dbName) {
    super(dbName, "memory");
    this.cache = new Cacheable();
    this._fallbackStore = new Map();
  }

  async getItemRaw(fullKey) {
    let value = await this.cache.get(fullKey);
    if (is.undefined(value)) {
      value = this._fallbackStore.get(fullKey);
    }
    return !is.undefined(value) ? value : null;
  }

  async getItem(key) {
    const fullKey = this._applyPrefix(key);
    let value = await this.cache.get(fullKey);
    if (is.undefined(value)) {
      value = this._fallbackStore.get(fullKey);
    }
    return !is.undefined(value) ? value : null;
  }

  async setItem(key, value) {
    const fullKey = this._applyPrefix(key);
    await this.cache.set(fullKey, value);
    this._fallbackStore.set(fullKey, value);
  }

  async removeItem(key) {
    const fullKey = this._applyPrefix(key);
    await this.cache.delete(fullKey);
    this._fallbackStore.delete(fullKey);
  }

  async truncate() {
    this._fallbackStore.clear();
    // Cacheable has clear() method to remove all items
    if (is.fn(this.cache.clear)) {
      await this.cache.clear();
    } else {
      const keys = await this.keys();
      for (const key of keys) {
        await this.cache.delete(key);
      }
    }
  }

  async getAll() {
    const results = {};
    const keys = await this.keys();
    const prefix = `${this.dbName}_`;

    for (const key of keys) {
      if (key.startsWith(prefix)) {
        const cleanKey = key.replace(prefix, "");
        results[cleanKey] = await this.getItemRaw(key);
      }
    }
    return results;
  }

  async keys() {
    const keys = new Set(this._fallbackStore.keys());
    
    if (is.fn(this.cache.keys)) {
      const cacheKeys = await this.cache.keys();
      cacheKeys.forEach(k => keys.add(k));
    }

    // Fallback: If it's a new version, it might be an async iterator
    try {
      if (this.cache.iterator && is.fn(this.cache.iterator)) {
        for await (const [key] of this.cache.iterator()) {
          keys.add(key);
        }
      }
    } catch (e) {}

    return Array.from(keys);
  }
}
