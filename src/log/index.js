import is from "is";

const DEFAULT_LOG_DB_NAME = "omnistorage_logs.sqlite";
const DEFAULT_LOG_TABLE_NAME = "omnistorage_logs";
const LOG_MODES = new Set(["auto", "client", "server"]);

class Logger {
  constructor() {
    this.dbName = DEFAULT_LOG_DB_NAME;
    this.tableName = DEFAULT_LOG_TABLE_NAME;
    this.engine = "auto";
    this.resolvedEngine = null;
    this.databaseExists = false;
    this._db = null;
    this._Database = null;
    this._fs = null;
    this._promise = null;
  }

  configure(config = "auto") {
    let nextMode = this.engine;

    if (is.string(config)) {
      nextMode = config;
    } else if (is.object(config) && !is.array(config)) {
      const unsupportedOptions = Object.keys(config).filter(
        (option) => option !== "mode",
      );
      if (unsupportedOptions.length) {
        throw new Error(
          `Invalid log config option "${unsupportedOptions[0]}". Only "mode" can be configured.`,
        );
      }

      if (config.mode !== undefined) nextMode = config.mode;
    } else {
      throw new Error(
        'Invalid log config. Use "auto", "client", "server", or { mode }.',
      );
    }

    if (!LOG_MODES.has(nextMode)) {
      throw new Error(
        `Invalid log mode "${nextMode}". Use "auto", "client", or "server".`,
      );
    }

    this.engine = nextMode;

    const previousPromise = this._promise;
    this._promise = this._reinitialize(previousPromise);
    return this;
  }

  getConfig() {
    return {
      mode: this.engine,
      databaseExists: this.databaseExists,
    };
  }

  _isNodeRuntime() {
    return typeof process !== "undefined" && Boolean(process.versions?.node);
  }

  _isBrowserRuntime() {
    return typeof globalThis.window !== "undefined";
  }

  _isTestRuntime() {
    return typeof process !== "undefined" && process.env.NODE_ENV === "test";
  }

  _resolveEngine() {
    if (this.engine === "client") return "sqlite-client";
    if (this.engine === "server") return "sqlite-server";
    if (this._isTestRuntime()) return "sqlite-server";
    return this._isBrowserRuntime() ? "sqlite-client" : "sqlite-server";
  }

  getSource() {
    const engine = this.resolvedEngine || this._resolveEngine();
    return engine === "sqlite-server" ? "server" : "client";
  }

  async _loadNodeModules() {
    if (this._Database && this._fs) return;
    const dynamicImport = new Function("specifier", "return import(specifier)");
    const [{ default: Database }, fs] = await Promise.all([
      dynamicImport("better-sqlite3"),
      dynamicImport("node:fs"),
    ]);
    this._Database = Database;
    this._fs = fs;
  }

  async _ensureInit() {
    if (!this._promise) {
      this._promise = this._init();
    }
    await this._promise;
  }

  async _reinitialize(previousPromise = null) {
    if (previousPromise) {
      await previousPromise.catch(() => {});
    }

    if (this._db && typeof this._db.close === "function") {
      this._db.close();
    }

    this._db = null;
    this.databaseExists = false;
    this.resolvedEngine = null;
    await this._init();
  }

  async _init() {
    const engine = this._resolveEngine();
    this.resolvedEngine = engine;

    if (engine === "sqlite-server") {
      await this._initServer();
      return;
    }

    await this._initClient();
  }

  async _initServer() {
    if (!this._isNodeRuntime()) {
      throw new Error(
        "SQLite server logging is only available in Node.js runtimes.",
      );
    }

    try {
      await this._loadNodeModules();
      this.databaseExists = this._fs.existsSync(this.dbName);
      this._db = new this._Database(this.dbName);
      this._db.exec(`
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
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
      console.error("Logger SQLite Node init error:", e);
    }
  }

  async _initClient() {
    try {
      const { default: sqlite3InitModule } =
        await import("@sqlite.org/sqlite-wasm");
      const sqlite3 = await sqlite3InitModule();
      if ("opfs" in sqlite3) {
        this.databaseExists = this._opfsDatabaseExists(sqlite3);
        this._db = new sqlite3.oo1.OpfsDb(this.dbName, "c");
      } else {
        this._db = new sqlite3.oo1.DB(this.dbName, "c");
      }
      this._db.exec(`
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
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

  _opfsDatabaseExists(sqlite3) {
    if (typeof sqlite3?.capi?.sqlite3_js_opfs_exists !== "function") {
      return false;
    }

    try {
      return Boolean(sqlite3.capi.sqlite3_js_opfs_exists(this.dbName));
    } catch (_e) {
      return false;
    }
  }

  async log({
    operation,
    engine,
    key,
    namespace = "default",
    status,
    message = "",
  }) {
    await this._ensureInit();
    if (!this._db) return;

    if (this.resolvedEngine === "sqlite-server") {
      const stmt = this._db.prepare(`
        INSERT INTO ${this.tableName} (operation, engine, key, namespace, status, message)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(operation, engine, key, namespace, status, message);
    } else {
      this._db.exec({
        sql: `INSERT INTO ${this.tableName} (operation, engine, key, namespace, status, message)
              VALUES (?, ?, ?, ?, ?, ?)`,
        bind: [operation, engine, key, namespace, status, message],
      });
    }
  }

  async getLogs(limit = 100) {
    await this._ensureInit();
    if (!this._db) return [];

    const source = this.getSource();

    if (this.resolvedEngine === "sqlite-server") {
      return this._db
        .prepare(
          `SELECT * FROM ${this.tableName} ORDER BY timestamp DESC LIMIT ?`,
        )
        .all(limit)
        .map((log) => ({ ...log, source }));
    } else {
      const logs = [];
      this._db.exec({
        sql: `SELECT * FROM ${this.tableName} ORDER BY timestamp DESC LIMIT ?`,
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
            message: row[7],
            source,
          });
        },
      });
      return logs;
    }
  }

  async clearLogs() {
    await this._ensureInit();
    if (!this._db) return;
    this._db.exec(`DELETE FROM ${this.tableName}`);
  }

  async close() {
    if (this._promise) {
      const currentPromise = this._promise;
      this._promise = null;
      await currentPromise.catch(() => {});
    }

    if (!this._db || typeof this._db.close !== "function") {
      this._db = null;
      return;
    }

    this._db.close();
    this._db = null;
  }
}

export const logger = new Logger();
