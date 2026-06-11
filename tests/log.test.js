import { logger } from "../src/log/index.js";
import fs from "fs/promises";

describe("Logger", () => {
  const DB_FILE = "omnistorage_logs.sqlite";

  beforeEach(async () => {
    logger.configure("auto");
    await logger.clearLogs();
  });

  afterAll(async () => {
    await logger.close();

    try {
      await fs.unlink(DB_FILE);
    } catch (e) {}
  });

  test("should resolve auto logging to sqlite-server in Node.js", () => {
    const config = logger.getConfig();
    expect(config.mode).toBe("auto");
    expect(typeof config.databaseExists).toBe("boolean");
    expect(logger.resolvedEngine || logger._resolveEngine()).toBe(
      "sqlite-server",
    );
  });

  test("should allow manual server log configuration", async () => {
    logger.configure("server");
    await logger.clearLogs();
    const config = logger.getConfig();
    expect(config.mode).toBe("server");
    expect(typeof config.databaseExists).toBe("boolean");
    expect(logger.resolvedEngine).toBe("sqlite-server");
  });

  test("should allow object log configuration", () => {
    logger.configure({ mode: "auto" });
    const config = logger.getConfig();
    expect(config.mode).toBe("auto");
    expect(typeof config.databaseExists).toBe("boolean");
  });

  test("should reject unsupported log config options", () => {
    expect(() => logger.configure({ databaseExists: true })).toThrow(
      'Only "mode" can be configured.',
    );
  });

  test("should log an activity and retrieve it", async () => {
    const logData = {
      operation: "SET",
      engine: "memory",
      key: "testKey",
      namespace: "testNS",
      status: "success",
      message: "Item saved",
    };

    await logger.log(logData);
    const logs = await logger.getLogs(1);

    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0]).toMatchObject({
      operation: "SET",
      engine: "memory",
      key: "testKey",
      namespace: "testNS",
      status: "success",
      message: "Item saved",
      source: "server",
    });
  });

  test("should clear logs", async () => {
    await logger.log({
      operation: "TEST",
      engine: "mock",
      key: "k",
      status: "ok",
    });
    let logs = await logger.getLogs();
    expect(logs.length).toBeGreaterThan(0);

    await logger.clearLogs();
    logs = await logger.getLogs();
    expect(logs.length).toBe(0);
  });
});
