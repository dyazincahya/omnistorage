import { BaseEngine } from "../base.js";
import fs from "fs/promises";
import path from "path";

export default class FileEngine extends BaseEngine {
  constructor(dbName) {
    super(dbName, "file");
    this.storageDir = path.resolve(process.cwd(), ".storage");
    this.filePath = path.join(this.storageDir, `${this.dbName}.json`);
    this.data = null;
    this.isLoaded = false;
  }

  async getItemRaw(fullKey) {
    await this._ensureLoaded();
    return this.data[fullKey] || null;
  }

  async _ensureLoaded() {
    if (this.isLoaded) return;

    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      const content = await fs.readFile(this.filePath, "utf-8");
      this.data = JSON.parse(content);
    } catch (e) {
      this.data = {}; // File doesn't exist yet
    }
    this.isLoaded = true;
  }

  async _save() {
    await fs.mkdir(this.storageDir, { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2));
  }

  async getItem(key) {
    await this._ensureLoaded();
    return this.data[this._applyPrefix(key)] || null;
  }

  async setItem(key, value) {
    await this._ensureLoaded();
    this.data[this._applyPrefix(key)] = value;
    await this._save();
  }

  async removeItem(key) {
    await this._ensureLoaded();
    delete this.data[this._applyPrefix(key)];
    await this._save();
  }

  async truncate() {
    await this._ensureLoaded();
    const prefix = `${this.dbName}_`;
    let changed = false;
    for (const key in this.data) {
      if (key.startsWith(prefix)) {
        delete this.data[key];
        changed = true;
      }
    }
    if (changed) await this._save();
  }

  async getAll() {
    await this._ensureLoaded();
    const results = {};
    const prefix = `${this.dbName}_`;
    for (const key in this.data) {
      if (key.startsWith(prefix)) {
        const cleanKey = key.replace(prefix, "");
        results[cleanKey] = this.data[key];
      }
    }
    return results;
  }

  async keys() {
    await this._ensureLoaded();
    return Object.keys(this.data);
  }
}
