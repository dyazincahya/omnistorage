import Database from "better-sqlite3";
import { BaseEngine } from "../base.js";

export default class SQLiteServerEngine extends BaseEngine {
  constructor(dbName) {
    super(dbName, "sqlite-server");
    this.dbFile = `${dbName}.sqlite`;
    this._db = null;
  }

  _getDb() {
    if (!this._db) {
      this._db = new Database(this.dbFile);
      this._db.exec(`
        CREATE TABLE IF NOT EXISTS kv (
          key TEXT PRIMARY KEY,
          value TEXT
        )
      `);
    }
    return this._db;
  }

  async getItemRaw(fullKey) {
    const db = this._getDb();
    const row = db.prepare("SELECT value FROM kv WHERE key = ?").get(fullKey);
    return row ? row.value : null;
  }

  async getItem(key) {
    return await this.getItemRaw(this._applyPrefix(key));
  }

  async setItem(key, value) {
    const db = this._getDb();
    db.prepare("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)")
      .run(this._applyPrefix(key), value);
  }

  async removeItem(key) {
    const db = this._getDb();
    db.prepare("DELETE FROM kv WHERE key = ?").run(this._applyPrefix(key));
  }

  async setItems(items) {
    const db = this._getDb();
    const insert = db.prepare("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)");
    const transaction = db.transaction((data) => {
      for (const [k, v] of Object.entries(data)) {
        insert.run(this._applyPrefix(k), v);
      }
    });
    transaction(items);
  }

  async removeItems(keys) {
    const db = this._getDb();
    const del = db.prepare("DELETE FROM kv WHERE key = ?");
    const transaction = db.transaction((ks) => {
      for (const k of ks) {
        del.run(this._applyPrefix(k));
      }
    });
    transaction(keys);
  }

  async truncate() {
    const db = this._getDb();
    const prefix = `${this.dbName}_%`;
    db.prepare("DELETE FROM kv WHERE key LIKE ?").run(prefix);
  }

  async getAll() {
    const db = this._getDb();
    const prefix = `${this.dbName}_`;
    const rows = db.prepare("SELECT key, value FROM kv WHERE key LIKE ?").all(`${prefix}%`);
    const results = {};
    rows.forEach((row) => {
      const cleanKey = row.key.replace(prefix, "");
      results[cleanKey] = JSON.parse(row.value);
    });
    return results;
  }

  async keys() {
    const db = this._getDb();
    const rows = db.prepare("SELECT key FROM kv").all();
    return rows.map((row) => row.key);
  }
}
