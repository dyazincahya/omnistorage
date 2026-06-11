import { BaseEngine } from "../base.js";

const OMNISTORAGE_TABLE_NAME = "omnistorage_kv";

export default class SQLiteServerEngine extends BaseEngine {
  constructor(dbName) {
    super(dbName, "sqlite-server");
    this.dbFile = this._resolveDbFile(dbName);
    this.databaseExists = false;
    this._db = null;
    this._Database = null;
    this._fs = null;
  }

  _resolveDbFile(dbName) {
    const sqliteExtension = /\.(sqlite|sqlite3|db)$/i;
    const looksLikePath = /[\\/]/.test(dbName);
    return sqliteExtension.test(dbName) || looksLikePath
      ? dbName
      : `${dbName}.sqlite`;
  }

  async _loadNodeModules() {
    if (this._Database && this._fs) return;
    if (typeof process === "undefined" || !process.versions?.node) {
      throw new Error(
        "SQLite server engine is only available in Node.js runtimes.",
      );
    }

    const dynamicImport = new Function("specifier", "return import(specifier)");
    const [{ default: Database }, fs] = await Promise.all([
      dynamicImport("better-sqlite3"),
      dynamicImport("node:fs"),
    ]);
    this._Database = Database;
    this._fs = fs;
  }

  async _getDb() {
    if (!this._db) {
      await this._loadNodeModules();
      this.databaseExists = this._fs.existsSync(this.dbFile);
      this._db = new this._Database(this.dbFile);
      this._db.exec(`
        CREATE TABLE IF NOT EXISTS ${OMNISTORAGE_TABLE_NAME} (
          key TEXT PRIMARY KEY,
          value TEXT
        )
      `);
    }
    return this._db;
  }

  async getItemRaw(fullKey) {
    const db = await this._getDb();
    const row = db
      .prepare(`SELECT value FROM ${OMNISTORAGE_TABLE_NAME} WHERE key = ?`)
      .get(fullKey);
    return row ? row.value : null;
  }

  async getItem(key) {
    return await this.getItemRaw(this._applyPrefix(key));
  }

  async setItem(key, value) {
    const db = await this._getDb();
    db.prepare(
      `INSERT OR REPLACE INTO ${OMNISTORAGE_TABLE_NAME} (key, value) VALUES (?, ?)`,
    ).run(this._applyPrefix(key), value);
  }

  async removeItem(key) {
    const db = await this._getDb();
    db.prepare(`DELETE FROM ${OMNISTORAGE_TABLE_NAME} WHERE key = ?`).run(
      this._applyPrefix(key),
    );
  }

  async setItems(items) {
    const db = await this._getDb();
    const insert = db.prepare(
      `INSERT OR REPLACE INTO ${OMNISTORAGE_TABLE_NAME} (key, value) VALUES (?, ?)`,
    );
    const transaction = db.transaction((data) => {
      for (const [k, v] of Object.entries(data)) {
        insert.run(this._applyPrefix(k), v);
      }
    });
    transaction(items);
  }

  async removeItems(keys) {
    const db = await this._getDb();
    const del = db.prepare(
      `DELETE FROM ${OMNISTORAGE_TABLE_NAME} WHERE key = ?`,
    );
    const transaction = db.transaction((ks) => {
      for (const k of ks) {
        del.run(this._applyPrefix(k));
      }
    });
    transaction(keys);
  }

  async truncate() {
    const db = await this._getDb();
    const prefix = `${this.dbName}_%`;
    db.prepare(`DELETE FROM ${OMNISTORAGE_TABLE_NAME} WHERE key LIKE ?`).run(
      prefix,
    );
  }

  async getAll() {
    const db = await this._getDb();
    const prefix = `${this.dbName}_`;
    const rows = db
      .prepare(
        `SELECT key, value FROM ${OMNISTORAGE_TABLE_NAME} WHERE key LIKE ?`,
      )
      .all(`${prefix}%`);
    const results = {};
    rows.forEach((row) => {
      const cleanKey = row.key.replace(prefix, "");
      results[cleanKey] = JSON.parse(row.value);
    });
    return results;
  }

  async keys() {
    const db = await this._getDb();
    const rows = db.prepare(`SELECT key FROM ${OMNISTORAGE_TABLE_NAME}`).all();
    return rows.map((row) => row.key);
  }
}
