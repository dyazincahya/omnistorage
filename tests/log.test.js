import { logger } from "../src/log/index.js";
import fs from "fs/promises";
import path from "path";

describe("Logger", () => {
  const DB_FILE = "store_activities.sqlite";

  beforeEach(async () => {
    // Clean up log db if exists
    try {
      await fs.unlink(DB_FILE);
    } catch (e) {}
    // Re-initialize or ensure it's clean for test
    // Note: Since logger is a singleton, we might need to be careful with global state
  });

  afterAll(async () => {
    // Final cleanup
    try {
      await fs.unlink(DB_FILE);
    } catch (e) {}
  });

  test("should log an activity and retrieve it", async () => {
    const logData = {
      operation: "SET",
      engine: "memory",
      key: "testKey",
      namespace: "testNS",
      status: "success",
      message: "Item saved"
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
      message: "Item saved"
    });
  });

  test("should clear logs", async () => {
    await logger.log({ operation: "TEST", engine: "mock", key: "k", status: "ok" });
    let logs = await logger.getLogs();
    expect(logs.length).toBeGreaterThan(0);

    await logger.clearLogs();
    logs = await logger.getLogs();
    expect(logs.length).toBe(0);
  });
});
