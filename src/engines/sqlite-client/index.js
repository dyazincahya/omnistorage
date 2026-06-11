import is from "is";
import { BaseEngine } from "../base.js";

const OMNISTORAGE_TABLE_NAME = "omnistorage_kv";

export default class SQLiteClientEngine extends BaseEngine {
  constructor(dbName) {
    super(dbName, "sqlite-client");
    this.dbFile = this._resolveDbFile(dbName);
    this.databaseExists = false;
    this._db = null;
    this._promise = this._init();
  }

  _resolveDbFile(dbName) {
    const sqliteExtension = /\.(sqlite|sqlite3|db)$/i;
    return sqliteExtension.test(dbName) ? dbName : `${dbName}.sqlite3`;
  }

  _opfsDatabaseExists(sqlite3) {
    if (typeof sqlite3?.capi?.sqlite3_js_opfs_exists !== "function") {
      return false;
    }

    try {
      return Boolean(sqlite3.capi.sqlite3_js_opfs_exists(this.dbFile));
    } catch (_e) {
      return false;
    }
  }

  async _init() {
    if (
      is.undefined(globalThis.window) ||
      (typeof process !== "undefined" && process.env.NODE_ENV === "test")
    ) {
      return;
    }

    try {
      const { default: sqlite3InitModule } =
        await import("@sqlite.org/sqlite-wasm");
      const sqlite3 = await sqlite3InitModule({
        print: console.log,
        printErr: console.error,
      });
      if ("opfs" in sqlite3) {
        this.databaseExists = this._opfsDatabaseExists(sqlite3);
        this._db = new sqlite3.oo1.OpfsDb(this.dbFile, "c");
      } else {
        this._db = new sqlite3.oo1.DB(this.dbFile, "c");
      }
      this._db.exec(`
        CREATE TABLE IF NOT EXISTS omnistorage_kv (
          key TEXT PRIMARY KEY,
          value TEXT
        )
      `);
    } catch (e) {
      console.error("SQLite WASM init error:", e);
    }
  }

  async _getDb() {
    await this._promise;
    return this._db;
  }

  async getItemRaw(fullKey) {
    const db = await this._getDb();
    if (!db) return null;
    let value = null;
    db.exec({
      sql: `SELECT value FROM ${OMNISTORAGE_TABLE_NAME} WHERE key = ?`,
      bind: [fullKey],
      callback: (row) => {
        value = row[0];
      },
    });
    return value;
  }

  async getItem(key) {
    return await this.getItemRaw(this._applyPrefix(key));
  }

  async setItem(key, value) {
    const db = await this._getDb();
    if (!db) return;
    db.exec({
      sql: `INSERT OR REPLACE INTO ${OMNISTORAGE_TABLE_NAME} (key, value) VALUES (?, ?)`,
      bind: [this._applyPrefix(key), value],
    });
  }

  async removeItem(key) {
    const db = await this._getDb();
    if (!db) return;
    db.exec({
      sql: `DELETE FROM ${OMNISTORAGE_TABLE_NAME} WHERE key = ?`,
      bind: [this._applyPrefix(key)],
    });
  }

  async setItems(items) {
    const db = await this._getDb();
    if (!db) return;
    db.transaction((d) => {
      for (const [k, v] of Object.entries(items)) {
        d.exec({
          sql: `INSERT OR REPLACE INTO ${OMNISTORAGE_TABLE_NAME} (key, value) VALUES (?, ?)`,
          bind: [this._applyPrefix(k), v],
        });
      }
    });
  }

  async removeItems(keys) {
    const db = await this._getDb();
    if (!db) return;
    db.transaction((d) => {
      for (const k of keys) {
        d.exec({
          sql: `DELETE FROM ${OMNISTORAGE_TABLE_NAME} WHERE key = ?`,
          bind: [this._applyPrefix(k)],
        });
      }
    });
  }

  async truncate() {
    const db = await this._getDb();
    if (!db) return;
    const prefix = `${this.dbName}_%`;
    db.exec({
      sql: `DELETE FROM ${OMNISTORAGE_TABLE_NAME} WHERE key LIKE ?`,
      bind: [prefix],
    });
  }

  async getAll() {
    const db = await this._getDb();
    if (!db) return {};
    const prefix = `${this.dbName}_`;
    const results = {};
    db.exec({
      sql: `SELECT key, value FROM ${OMNISTORAGE_TABLE_NAME} WHERE key LIKE ?`,
      bind: [`${prefix}%`],
      callback: (row) => {
        const cleanKey = row[0].replace(prefix, "");
        results[cleanKey] = JSON.parse(row[1]);
      },
    });
    return results;
  }

  async keys() {
    const db = await this._getDb();
    if (!db) return [];
    const keys = [];
    db.exec({
      sql: `SELECT key FROM ${OMNISTORAGE_TABLE_NAME}`,
      callback: (row) => {
        keys.push(row[0]);
      },
    });
    return keys;
  }
}
