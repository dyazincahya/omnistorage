import is from "is";
import { BaseEngine } from "../base.js";

export default class LocalEngine extends BaseEngine {
  constructor(dbName) {
    super(dbName, 'local');
    this.storage = !is.undefined(globalThis.window) ? window.localStorage : null;
  }

  async getItemRaw(fullKey) {
    return this.storage ? this.storage.getItem(fullKey) : null;
  }

  async getItem(key) {
    return this.storage ? this.storage.getItem(this._applyPrefix(key)) : null;
  }

  async setItem(key, value) {
    if (this.storage) this.storage.setItem(this._applyPrefix(key), value);
  }

  async removeItem(key) {
    if (this.storage) this.storage.removeItem(this._applyPrefix(key));
  }

  async truncate() {
    if (this.storage) {
      const keys = await this.keys();
      const prefix = `${this.dbName}_`;
      for (const key of keys) {
        if (key.startsWith(prefix)) {
          this.storage.removeItem(key);
        }
      }
    }
  }

  async getAll() {
    const results = {};
    if (!this.storage) return results;
    
    const keys = await this.keys();
    const prefix = `${this.dbName}_`;
    for (const key of keys) {
      if (key.startsWith(prefix)) {
        const cleanKey = key.replace(prefix, '');
        results[cleanKey] = JSON.parse(this.storage.getItem(key));
      }
    }
    return results;
  }

  async keys() {
    return this.storage ? Object.keys(this.storage) : [];
  }
}
