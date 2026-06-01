import is from "is";
import {
  formatPayload,
  formatOutputData,
  formatStandardResponse,
  estimateSize,
  validateLimit,
} from "./utils/index.js";
import LocalEngine from "./engines/local/index.js";
import SessionEngine from "./engines/session/index.js";
import MemoryEngine from "./engines/memory/index.js";
import FileEngine from "./engines/file/index.js";
import IndexedDBEngine from "./engines/indexeddb/index.js";
import SQLiteServerEngine from "./engines/sqlite-server/index.js";
import SQLiteClientEngine from "./engines/sqlite-client/index.js";
import { logger } from "./log/index.js";

/**
 * store
 * A simple, universal, type-safe wrapper for storage with pluggable engines.
 */

class StoreManager {
  constructor() {
    this._dbName = this._initDbName();
    this._initEngines();
    this._hooks = {
      onSet: [],
      onGet: [],
      onDelete: [],
      onClear: [],
    };
    this._watchers = new Map();
  }

  /**
   * Add a hook listener
   * @param {'onSet' | 'onGet' | 'onDelete' | 'onClear'} event
   * @param {Function} callback
   */
  on(event, callback) {
    if (this._hooks[event]) {
      this._hooks[event].push(callback);
    }
    return this;
  }

  /**
   * Watch for changes on a specific key
   * @param {string} key
   * @param {Function} callback
   */
  watch(key, callback) {
    if (!this._watchers.has(key)) {
      this._watchers.set(key, []);
    }
    this._watchers.get(key).push(callback);
    return () => {
      const listeners = this._watchers.get(key);
      this._watchers.set(
        key,
        listeners.filter((cb) => cb !== callback),
      );
    };
  }

  _triggerHook(event, data) {
    if (this._hooks[event]) {
      this._hooks[event].forEach((cb) => cb(data));
    }

    // Specific key watcher for set/delete
    if ((event === "onSet" || event === "onDelete") && data.key) {
      const watchers = this._watchers.get(data.key);
      if (watchers) {
        watchers.forEach((cb) => cb(data.value, data.oldValue));
      }
    }
  }

  /**
   * Internal standard response formatter
   */
  _formatResponse(options) {
    return formatStandardResponse(options);
  }

  /**
   * Initialize engines with current dbName
   */
  _initEngines() {
    this.engines = {
      local: new LocalEngine(this._dbName),
      session: new SessionEngine(this._dbName),
      memory: new MemoryEngine(this._dbName),
      file: new FileEngine(this._dbName),
      indexeddb: new IndexedDBEngine(this._dbName),
      "sqlite-server": new SQLiteServerEngine(this._dbName),
      "sqlite-client": new SQLiteClientEngine(this._dbName),
    };

    // Auto-detect default engine
    this.defaultEngine =
      !is.undefined(globalThis.window) && window.localStorage
        ? this.engines.local
        : this.engines.memory;
  }

  /**
   * Manually set database name (Chainable)
   * @param {string} name
   */
  db(name) {
    if (is.string(name)) {
      this._dbName = name;
      // Persist if in browser
      if (!is.undefined(globalThis.window) && window.localStorage) {
        window.localStorage.setItem("__my_js_lib_store_dbname__", name);
      }
      // Re-initialize engines with new dbName
      this._initEngines();
    }
    return this;
  }

  /**
   * Initialize dbName: recover from localStorage or generate new one
   */
  _initDbName() {
    const PERSIST_KEY = "__my_js_lib_store_dbname__";

    // 1. Try to recover from localStorage (Browser)
    if (!is.undefined(globalThis.window) && window.localStorage) {
      const savedName = window.localStorage.getItem(PERSIST_KEY);
      if (savedName && savedName.length === 5) {
        return savedName;
      }

      // 2. Generate new and save
      const newName = this._generateRandomString(5);
      window.localStorage.setItem(PERSIST_KEY, newName);
      return newName;
    }

    // 3. Fallback for Node.js or if localStorage is unavailable
    return this._generateRandomString(5);
  }

  _generateRandomString(length) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  getDbName() {
    return this._dbName;
  }

  /**
   * Temporary switch to a specific engine (Chainable)
   * @param {'local' | 'session' | 'memory' | 'file' | 'indexeddb'} type
   */
  config(type) {
    const engine = this.engines[type];
    if (!engine) {
      console.warn(`Engine ${type} not found, using default.`);
      return this;
    }

    return {
      create: async (key, value) =>
        await this._set(key, value, engine, "insert"),
      update: async (key, value) =>
        await this._set(key, value, engine, "update"),
      save: async (key, value) => await this._set(key, value, engine, "upsert"),
      find: async (key, options) => await this._get(key, options, engine),
      findOne: async (key, options) => await this._get(key, options, engine),
      findMany: async (keys, options) =>
        await this.findMany(keys, options, engine),
      findAll: async () => await engine.findAll(),
      saveMany: async (items) => await this.saveMany(items, engine),
      destroy: async (key) => await this.destroy(key, engine),
      destroyMany: async (keys) => await this.destroyMany(keys, engine),
      truncate: async () => await this.truncate(engine),
      describe: async (key) => await this.describe(key, engine),
      watch: (key, cb) => this.watch(key, cb),
      transaction: async (callback) => await this.transaction(callback, type),
      namespace: (ns) => this.namespace(ns, engine),
    };
  }

  /**
   * Set the default engine globally
   */
  use(type) {
    if (this.engines[type]) {
      this.defaultEngine = this.engines[type];
    }
    return this;
  }

  async _set(key, value, engine = this.defaultEngine, mode = "upsert") {
    try {
      const existingRaw = await engine.getItem(key);
      const existing = existingRaw ? JSON.parse(existingRaw) : null;

      // 1. Logic for Smart SQL modes
      if (mode === "insert" || mode === "update") {
        if (mode === "insert" && !is.null(existing)) {
          const msg = `Create failed: Key "${key}" already exists.`;
          await logger.log({
            operation: mode,
            engine: engine.engineType,
            key,
            status: "error",
            message: msg,
          });
          return this._formatResponse({
            ok: false,
            message: msg,
            engine: engine.engineType,
          });
        }
        if (mode === "update" && is.null(existing)) {
          const msg = `Update failed: Key "${key}" not found.`;
          await logger.log({
            operation: mode,
            engine: engine.engineType,
            key,
            status: "error",
            message: msg,
          });
          return this._formatResponse({
            ok: false,
            message: msg,
            engine: engine.engineType,
          });
        }
      }

      const filteredValue = formatPayload(value);
      const data = JSON.stringify(filteredValue);

      // 2. Capacity Validation
      const currentSize = await engine.getTotalSize();
      const newDataSize = estimateSize(data);
      const validation = validateLimit(
        currentSize,
        newDataSize,
        engine.engineType,
      );

      if (!validation.ok) {
        await logger.log({
          operation: mode,
          engine: engine.engineType,
          key,
          status: "error",
          message: validation.message,
        });
        return this._formatResponse({
          ok: false,
          message: validation.message,
          engine: engine.engineType,
        });
      }

      // 3. Execution
      await engine.setItem(key, data);

      // 4. Trigger Hooks
      this._triggerHook("onSet", {
        key,
        value: filteredValue,
        oldValue: existing,
        engine: engine.engineType,
        mode,
      });

      await logger.log({
        operation: mode,
        engine: engine.engineType,
        key,
        status: "success",
      });

      return this._formatResponse({
        ok: true,
        data: filteredValue,
        message: `${mode.charAt(0).toUpperCase() + mode.slice(1)} successful`,
        engine: engine.engineType,
      });
    } catch (e) {
      console.error("store.save error:", e);
      await logger.log({
        operation: mode,
        engine: engine.engineType,
        key,
        status: "error",
        message: e.message,
      });
      return this._formatResponse({
        ok: false,
        message: e.message,
        engine: engine.engineType,
      });
    }
  }

  /**
   * Create data. Fails if key already exists.
   * @param {string} key
   * @param {any} value
   */
  async create(key, value) {
    return await this._set(key, value, this.defaultEngine, "insert");
  }

  /**
   * Update data. Fails if key does not exist.
   * @param {string} key
   * @param {any} value
   */
  async update(key, value) {
    return await this._set(key, value, this.defaultEngine, "update");
  }

  /**
   * Upsert data (Insert or Update).
   * @param {string} key
   * @param {any} value
   */
  async save(key, value) {
    return await this._set(key, value, this.defaultEngine, "upsert");
  }

  // Aliases for convenience
  async insert(key, value) {
    return await this.create(key, value);
  }
  async set(key, value) {
    return await this.save(key, value);
  }

  async _get(
    key,
    { validator = null, defaultValue = null, type = null } = {},
    engine = this.defaultEngine,
  ) {
    try {
      const item = await engine.getItem(key);

      if (is.null(item)) {
        this._triggerHook("onGet", {
          key,
          value: null,
          engine: engine.engineType,
        });
        return this._formatResponse({
          ok: false,
          data: defaultValue,
          message: `Key "${key}" not found`,
          engine: engine.engineType,
        });
      }

      const parsed = JSON.parse(item);
      const filteredValue = formatOutputData(parsed);

      // Type validation using 'is' library
      if (type && is.fn(is[type])) {
        if (!is[type](filteredValue)) {
          const msg = `Type mismatch: Expected "${type}" but got "${typeof filteredValue}"`;
          console.warn(`store.find: ${msg}`);
          return this._formatResponse({
            ok: false,
            data: defaultValue,
            message: msg,
            engine: engine.engineType,
          });
        }
      }

      if (validator && is.fn(validator)) {
        const isValid = validator(filteredValue);
        this._triggerHook("onGet", {
          key,
          value: filteredValue,
          isValid,
          engine: engine.engineType,
        });

        if (!isValid) {
          return this._formatResponse({
            ok: false,
            data: defaultValue,
            message: "Validation failed",
            engine: engine.engineType,
          });
        }
      }

      this._triggerHook("onGet", {
        key,
        value: filteredValue,
        engine: engine.engineType,
      });

      return this._formatResponse({
        ok: true,
        data: filteredValue,
        message: "Data found",
        engine: engine.engineType,
      });
    } catch (e) {
      console.error("store.find error:", e);
      return this._formatResponse({
        ok: false,
        data: defaultValue,
        message: e.message,
        engine: engine.engineType,
      });
    }
  }

  async find(key, options) {
    return await this._get(key, options);
  }

  async findOne(key, options) {
    return await this._get(key, options);
  }

  async findAll() {
    const data = await this.defaultEngine.findAll();
    return this._formatResponse({
      ok: true,
      data,
      engine: this.defaultEngine.engineType,
    });
  }

  // Aliases for convenience
  async get(key, options) {
    return await this.find(key, options);
  }
  async getByKey(key, options) {
    return await this.find(key, options);
  }
  async getById(key, options) {
    return await this.find(key, options);
  }
  async getAll() {
    return await this.findAll();
  }

  async destroy(key, engine = this.defaultEngine) {
    const existingRaw = await engine.getItem(key);
    const existing = existingRaw ? JSON.parse(existingRaw) : null;

    await engine.removeItem(key);

    this._triggerHook("onDelete", {
      key,
      oldValue: existing,
      engine: engine.engineType,
    });

    await logger.log({
      operation: "destroy",
      engine: engine.engineType,
      key,
      status: "success",
    });

    return this._formatResponse({
      ok: true,
      message: `Key "${key}" destroyed`,
      engine: engine.engineType,
    });
  }

  // Aliases for convenience
  async delete(key, engine = this.defaultEngine) {
    return await this.destroy(key, engine);
  }
  async remove(key, engine = this.defaultEngine) {
    return await this.destroy(key, engine);
  }

  async truncate(engine = this.defaultEngine) {
    await engine.truncate();
    this._triggerHook("onClear", { engine: engine.engineType });

    await logger.log({
      operation: "truncate",
      engine: engine.engineType,
      key: "*",
      status: "success",
    });

    return this._formatResponse({
      ok: true,
      message: "Storage truncated",
      engine: engine.engineType,
    });
  }

  async clear(engine = this.defaultEngine) {
    return await this.truncate(engine);
  }

  /**
   * Get all activity logs
   */
  async getActivityLogs(limit = 100) {
    const logs = await logger.getLogs(limit);
    return this._formatResponse({
      ok: true,
      data: logs,
      message: "Activity logs retrieved",
    });
  }

  /**
   * Alias for getActivityLogs
   */
  async getLogs(limit = 100) {
    return await this.getActivityLogs(limit);
  }

  /**
   * Clear all activity logs
   */
  async clearActivityLogs() {
    await logger.clearLogs();
    return this._formatResponse({
      ok: true,
      message: "Activity logs cleared",
    });
  }

  /**
   * Set multiple items at once
   * @param {Record<string, any>} items
   */
  async saveMany(items, engine = this.defaultEngine) {
    const results = [];
    const filteredItems = {};

    for (const [key, value] of Object.entries(items)) {
      const filteredValue = formatPayload(value);
      filteredItems[key] = JSON.stringify(filteredValue);
      results.push({ key, value: filteredValue, ok: true });
    }

    if (engine.setItems) {
      await engine.setItems(filteredItems);
    } else {
      for (const [key, value] of Object.entries(filteredItems)) {
        await engine.setItem(key, value);
      }
    }

    // Trigger hooks for each
    results.forEach((res) => {
      this._triggerHook("onSet", {
        key: res.key,
        value: res.value,
        engine: engine.engineType,
        mode: "upsert",
      });
    });

    return this._formatResponse({
      ok: true,
      data: results,
      message: "Batch save completed",
      engine: engine.engineType,
    });
  }

  /**
   * Create multiple items. Fails for keys that already exist.
   */
  async createMany(items, engine = this.defaultEngine) {
    const results = [];
    const toCreate = {};

    for (const [key, value] of Object.entries(items)) {
      const existing = await engine.getItem(key);
      if (!is.null(existing)) {
        results.push({ key, ok: false, message: "Already exists" });
      } else {
        const filteredValue = formatPayload(value);
        toCreate[key] = JSON.stringify(filteredValue);
        results.push({ key, value: filteredValue, ok: true });
      }
    }

    if (Object.keys(toCreate).length > 0) {
      if (engine.setItems) {
        await engine.setItems(toCreate);
      } else {
        for (const [key, value] of Object.entries(toCreate)) {
          await engine.setItem(key, value);
        }
      }

      // Trigger hooks
      results
        .filter((r) => r.ok)
        .forEach((res) => {
          this._triggerHook("onSet", {
            key: res.key,
            value: res.value,
            engine: engine.engineType,
            mode: "insert",
          });
        });
    }

    return this._formatResponse({
      ok: results.some((r) => r.ok),
      data: results,
      message: "Batch create processed",
      engine: engine.engineType,
    });
  }

  /**
   * Update multiple items. Fails for keys that don't exist.
   */
  async updateMany(items, engine = this.defaultEngine) {
    const results = [];
    const toUpdate = {};

    for (const [key, value] of Object.entries(items)) {
      const existing = await engine.getItem(key);
      if (is.null(existing)) {
        results.push({ key, ok: false, message: "Not found" });
      } else {
        const filteredValue = filterInput(value);
        toUpdate[key] = JSON.stringify(filteredValue);
        results.push({ key, value: filteredValue, ok: true });
      }
    }

    if (Object.keys(toUpdate).length > 0) {
      if (engine.setItems) {
        await engine.setItems(toUpdate);
      } else {
        for (const [key, value] of Object.entries(toUpdate)) {
          await engine.setItem(key, value);
        }
      }

      // Trigger hooks
      results
        .filter((r) => r.ok)
        .forEach((res) => {
          this._triggerHook("onSet", {
            key: res.key,
            value: res.value,
            engine: engine.engineType,
            mode: "update",
          });
        });
    }

    return this._formatResponse({
      ok: results.some((r) => r.ok),
      data: results,
      message: "Batch update processed",
      engine: engine.engineType,
    });
  }

  /**
   * Get multiple items at once
   * @param {string[]} keys
   */
  async findMany(keys, options, engine = this.defaultEngine) {
    const results = {};
    for (const key of keys) {
      const res = await this._get(key, options, engine);
      results[key] = res.data;
    }
    return this._formatResponse({
      ok: true,
      data: results,
      engine: engine.engineType,
    });
  }

  /**
   * Delete multiple items at once
   * @param {string[]} keys
   */
  async destroyMany(keys, engine = this.defaultEngine) {
    const results = [];

    if (engine.removeItems) {
      await engine.removeItems(keys);
      keys.forEach((key) => {
        results.push({ key, ok: true });
        this._triggerHook("onDelete", { key, engine: engine.engineType });
      });
    } else {
      for (const key of keys) {
        const res = await this.destroy(key, engine);
        results.push({ key, ok: res.ok });
      }
    }

    return this._formatResponse({
      ok: true,
      data: results,
      message: "Batch destroy completed",
      engine: engine.engineType,
    });
  }

  // Aliases for convenience
  async setMany(items, engine = this.defaultEngine) {
    return await this.saveMany(items, engine);
  }
  async createMany(items, engine = this.defaultEngine) {
    return await this.createMany(items, engine);
  }
  async updateMany(items, engine = this.defaultEngine) {
    return await this.updateMany(items, engine);
  }
  async getMany(keys, options, engine = this.defaultEngine) {
    return await this.findMany(keys, options, engine);
  }
  async deleteMany(keys, engine = this.defaultEngine) {
    return await this.destroyMany(keys, engine);
  }

  /**
   * Run multiple operations in a single transaction (Atomic where supported)
   * @param {Function} callback
   * @param {'local' | 'session' | 'memory' | 'file' | 'indexeddb'} [type]
   */
  async transaction(callback, type) {
    const engine = type ? this.engines[type] : this.defaultEngine;

    // We create a temporary manager context for the transaction
    const trx = {
      create: async (k, v) => await this._set(k, v, engine, "insert"),
      update: async (k, v) => await this._set(k, v, engine, "update"),
      save: async (k, v) => await this._set(k, v, engine, "upsert"),
      destroy: async (k) => await this.destroy(k, engine),
    };

    try {
      // If engine supports native transactions (like IndexedDB), we could wrap it here
      // For now, we execute the callback
      const result = await callback(trx);

      return this._formatResponse({
        ok: true,
        data: result,
        message: "Transaction completed",
        engine: engine.engineType,
      });
    } catch (e) {
      return this._formatResponse({
        ok: false,
        message: `Transaction failed: ${e.message}`,
        engine: engine.engineType,
      });
    }
  }

  /**
   * Get metadata for a key (Experimental)
   * @param {string} key
   */
  async describe(key, engine = this.defaultEngine) {
    const raw = await engine.getItemRaw(
      engine._applyPrefix ? engine._applyPrefix(key) : key,
    );
    if (!raw) {
      return this._formatResponse({
        ok: false,
        message: `Key "${key}" not found`,
        engine: engine.engineType,
      });
    }

    return this._formatResponse({
      ok: true,
      data: {
        size: estimateSize(raw),
        engine: engine.engineType,
      },
      engine: engine.engineType,
    });
  }

  // Alias for convenience
  async getMeta(key, engine = this.defaultEngine) {
    return await this.describe(key, engine);
  }

  /**
   * Get statistics for one or all engines
   * @param {'local' | 'session' | 'memory' | 'file' | 'indexeddb'} [type]
   */
  async getStatistic(type) {
    if (type) {
      const engine = this.engines[type];
      if (!engine) throw new Error(`Engine ${type} not found`);
      const stats = await engine.getStats();
      return this._formatResponse({
        ok: true,
        data: stats,
        engine: type,
      });
    }

    const stats = {};
    for (const [name, engine] of Object.entries(this.engines)) {
      try {
        stats[name] = await engine.getStats();
      } catch (e) {
        stats[name] = { error: e.message };
      }
    }
    return this._formatResponse({
      ok: true,
      data: stats,
    });
  }

  /**
   * Alias for getStatistic
   */
  async getStatistics() {
    return await this.getStatistic();
  }

  namespace(namespace, engine = this.defaultEngine) {
    const prefix = `${namespace}:`;
    return {
      create: async (key, value) =>
        await this._set(`${prefix}${key}`, value, engine, "insert"),
      update: async (key, value) =>
        await this._set(`${prefix}${key}`, value, engine, "update"),
      save: async (key, value) =>
        await this._set(`${prefix}${key}`, value, engine, "upsert"),
      find: async (key, options) =>
        await this._get(`${prefix}${key}`, options, engine),
      findOne: async (key, options) =>
        await this._get(`${prefix}${key}`, options, engine),
      createMany: async (items) => {
        const fullItems = {};
        for (const [k, v] of Object.entries(items)) {
          fullItems[`${prefix}${k}`] = v;
        }
        return await this.createMany(fullItems, engine);
      },
      updateMany: async (items) => {
        const fullItems = {};
        for (const [k, v] of Object.entries(items)) {
          fullItems[`${prefix}${k}`] = v;
        }
        return await this.updateMany(fullItems, engine);
      },
      findMany: async (keys, options) => {
        const fullKeys = keys.map((k) => `${prefix}${k}`);
        const res = await this.findMany(fullKeys, options, engine);
        const cleaned = {};
        for (const k of keys) {
          cleaned[k] = res.data[`${prefix}${k}`];
        }
        return { ...res, data: cleaned };
      },
      saveMany: async (items) => {
        const fullItems = {};
        for (const [k, v] of Object.entries(items)) {
          fullItems[`${prefix}${k}`] = v;
        }
        return await this.saveMany(fullItems, engine);
      },
      destroyMany: async (keys) => {
        const fullKeys = keys.map((k) => `${prefix}${k}`);
        return await this.destroyMany(fullKeys, engine);
      },
      findAll: async () => {
        const all = await engine.getAll();
        const filtered = {};
        for (const key in all) {
          if (key.startsWith(prefix)) {
            filtered[key.replace(prefix, "")] = all[key];
          }
        }
        return this._formatResponse({
          ok: true,
          data: filtered,
          engine: engine.engineType,
        });
      },
      destroy: async (key) => await this.destroy(`${prefix}${key}`, engine),
      truncate: async () => {
        const all = await engine.getAll();
        for (const key in all) {
          if (key.startsWith(prefix)) {
            await engine.removeItem(key);
          }
        }
        this._triggerHook("onClear", { engine: engine.engineType, namespace });
        await logger.log({
          operation: "truncate",
          engine: engine.engineType,
          key: "*",
          namespace,
          status: "success",
        });
        return this._formatResponse({
          ok: true,
          message: `Namespace "${namespace}" truncated`,
          engine: engine.engineType,
        });
      },
      describe: async (key) => await this.describe(`${prefix}${key}`, engine),
      watch: (key, cb) => this.watch(`${prefix}${key}`, cb),
      transaction: async (callback) => {
        // Namespace-aware transaction
        const nsTrx = {
          create: async (k, v) => {
            const res = await this._set(`${prefix}${k}`, v, engine, "insert");
            await logger.log({
              operation: "create",
              engine: engine.engineType,
              key: k,
              namespace,
              status: res.ok ? "success" : "error",
              message: res.message,
            });
            return res;
          },
          update: async (k, v) => {
            const res = await this._set(`${prefix}${k}`, v, engine, "update");
            await logger.log({
              operation: "update",
              engine: engine.engineType,
              key: k,
              namespace,
              status: res.ok ? "success" : "error",
              message: res.message,
            });
            return res;
          },
          save: async (k, v) => {
            const res = await this._set(`${prefix}${k}`, v, engine, "upsert");
            await logger.log({
              operation: "save",
              engine: engine.engineType,
              key: k,
              namespace,
              status: res.ok ? "success" : "error",
              message: res.message,
            });
            return res;
          },
          destroy: async (k) => {
            const res = await this.destroy(`${prefix}${k}`, engine);
            await logger.log({
              operation: "destroy",
              engine: engine.engineType,
              key: k,
              namespace,
              status: res.ok ? "success" : "error",
              message: res.message,
            });
            return res;
          },
        };
        try {
          const result = await callback(nsTrx);
          return this._formatResponse({
            ok: true,
            data: result,
            message: `Transaction in namespace "${namespace}" completed`,
            engine: engine.engineType,
          });
        } catch (e) {
          return this._formatResponse({
            ok: false,
            message: `Transaction in namespace "${namespace}" failed: ${e.message}`,
            engine: engine.engineType,
          });
        }
      },
    };
  }
}

const store = new StoreManager();

export default store;
export { store };
