import { Cacheable } from "cacheable";
import is from "is";
import { BaseEngine } from "../base.js";

export default class MemoryEngine extends BaseEngine {
  constructor(dbName) {
    super(dbName, "memory");
    this.cache = new Cacheable();
  }

  async getItemRaw(fullKey) {
    const value = await this.cache.get(fullKey);
    return !is.undefined(value) ? value : null;
  }

  async getItem(key) {
    const value = await this.cache.get(this._applyPrefix(key));
    return !is.undefined(value) ? value : null;
  }

  async setItem(key, value) {
    await this.cache.set(this._applyPrefix(key), value);
  }

  async removeItem(key) {
    await this.cache.delete(this._applyPrefix(key));
  }

  async truncate() {
    // Cacheable has clear() method to remove all items
    if (is.fn(this.cache.clear)) {
      await this.cache.clear();
    } else {
      const keys = await this.keys();
      const prefix = `${this.dbName}_`;
      for (const key of keys) {
        if (key.startsWith(prefix)) {
          await this.cache.delete(key);
        }
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
        const value = await this.cache.get(key);
        results[cleanKey] = !is.undefined(value) ? value : null;
      }
    }
    return results;
  }

  async keys() {
    // Cacheable uses Keyv internally. To get keys, we check the primary store.
    // In most versions, Cacheable or its primary store (CacheableMemory) supports keys().
    if (is.fn(this.cache.keys)) {
      return await this.cache.keys();
    }

    // Fallback: If it's a new version, it might be an async iterator
    try {
      const keys = [];
      if (this.cache.iterator && is.fn(this.cache.iterator)) {
        for await (const [key] of this.cache.iterator()) {
          keys.push(key);
        }
        return keys;
      }
    } catch (e) {
      // ignore
    }

    return [];
  }
}
