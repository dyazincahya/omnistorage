import {
  filterInput,
  filterOutput,
  estimateSize,
  validateLimit,
} from "../utils/index.js";

export class BaseEngine {
  constructor(dbName = "MyStoreDB", engineType = "unknown") {
    this.dbName = dbName;
    this.engineType = engineType;
  }

  getDbName() {
    return this.dbName;
  }

  _applyPrefix(key) {
    return `${this.dbName}_${key}`;
  }

  /**
   * Calculate total size of prefixed keys in this engine
   */
  async getTotalSize() {
    const keys = await this.keys();
    let total = 0;
    const prefix = `${this.dbName}_`;

    for (const key of keys) {
      if (key.startsWith(prefix)) {
        const item = await this.getItemRaw(key);
        if (item) total += estimateSize(item);
      }
    }
    return total;
  }

  /**
   * Get basic stats for this engine
   */
  async getStats() {
    const keys = await this.keys();
    const prefixedKeys = keys.filter((k) => k.startsWith(`${this.dbName}_`));
    const totalSize = await this.getTotalSize();

    return {
      engine: this.engineType,
      dbName: this.dbName,
      totalKeys: prefixedKeys.length,
      totalSize: totalSize,
      totalSizeFormatted: `${(totalSize / 1024).toFixed(2)} KB`,
    };
  }

  // To be implemented by children to get data without prefixing logic
  async getItemRaw(fullKey) {
    throw new Error("Not implemented");
  }

  async getItem(key) {
    throw new Error("Not implemented");
  }
  async setItem(key, value) {
    throw new Error("Not implemented");
  }
  async removeItem(key) {
    throw new Error("Not implemented");
  }
  async truncate() {
    throw new Error("Not implemented");
  }
  async getAll() {
    throw new Error("Not implemented");
  }
  async keys() {
    throw new Error("Not implemented");
  }
}
