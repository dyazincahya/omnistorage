import Database from "better-sqlite3";
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import is from "is";

class Logger {
  constructor() {
    this.dbName = "store_activities.sqlite";
    this._db = null;
    this._isNode = is.undefined(globalThis.window);
    this._promise = this._init();
  }

  async _init() {
    if (this._isNode) {
      // Server-side (Node.js)
      this._db = new Database(this.dbName);
      this._db.exec(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          operation TEXT,
          engine TEXT,
          key TEXT,
          namespace TEXT,
          status TEXT,
          message TEXT
        )
      `);
    } else {
      // Client-side (Browser WASM)
      try {
        const sqlite3 = await sqlite3InitModule();
        if ("opfs" in sqlite3) {
          this._db = new sqlite3.oo1.OpfsDb(this.dbName);
        } else {
          this._db = new sqlite3.oo1.DB(this.dbName, "ct");
        }
        this._db.exec(`
          CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            operation TEXT,
            engine TEXT,
            key TEXT,
            namespace TEXT,
            status TEXT,
            message TEXT
          )
        `);
      } catch (e) {
        console.error("Logger SQLite WASM init error:", e);
      }
    }
  }

  async log({ operation, engine, key, namespace = "default", status, message = "" }) {
    await this._promise;
    if (!this._db) return;

    if (this._isNode) {
      const stmt = this._db.prepare(`
        INSERT INTO activity_logs (operation, engine, key, namespace, status, message)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(operation, engine, key, namespace, status, message);
    } else {
      this._db.exec({
        sql: `INSERT INTO activity_logs (operation, engine, key, namespace, status, message)
              VALUES (?, ?, ?, ?, ?, ?)`,
        bind: [operation, engine, key, namespace, status, message]
      });
    }
  }

  async getLogs(limit = 100) {
    await this._promise;
    if (!this._db) return [];

    if (this._isNode) {
      return this._db.prepare("SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ?").all(limit);
    } else {
      const logs = [];
      this._db.exec({
        sql: "SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ?",
        bind: [limit],
        callback: (row) => {
          logs.push({
            id: row[0],
            timestamp: row[1],
            operation: row[2],
            engine: row[3],
            key: row[4],
            namespace: row[5],
            status: row[6],
            message: row[7]
          });
        }
      });
      return logs;
    }
  }

  async clearLogs() {
    await this._promise;
    if (!this._db) return;
    this._db.exec("DELETE FROM activity_logs");
  }
}

export const logger = new Logger();
