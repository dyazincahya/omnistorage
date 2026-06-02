import SQLiteServerEngine from "../src/engines/sqlite-server/index.js";
import fs from "fs/promises";
import path from "path";

describe("SQLiteServerEngine", () => {
  let engine;
  const DB_NAME = "SQLiteTestDB";
  const DB_FILE = `${DB_NAME}.sqlite`;

  beforeEach(async () => {
    // Clean up db file if exists
    try {
      await fs.unlink(DB_FILE);
    } catch (e) {}
    engine = new SQLiteServerEngine(DB_NAME);
  });

  afterEach(async () => {
    // Close DB connection if possible and cleanup
    if (engine._db) {
      engine._db.close();
    }
    try {
      await fs.unlink(DB_FILE);
    } catch (e) {}
  });

  test("should set and get items from sqlite", async () => {
    await engine.setItem("testKey", "testValue");
    const value = await engine.getItem("testKey");
    expect(value).toBe("testValue");
  });

  test("should remove items from sqlite", async () => {
    await engine.setItem("testKey", "testValue");
    await engine.removeItem("testKey");
    const value = await engine.getItem("testKey");
    expect(value).toBe(null);
  });

  test("should handle multiple items (setItems)", async () => {
    const items = {
      k1: "v1",
      k2: "v2",
    };
    await engine.setItems(items);
    expect(await engine.getItem("k1")).toBe("v1");
    expect(await engine.getItem("k2")).toBe("v2");
  });

  test("should truncate items", async () => {
    await engine.setItem("key1", "value1");
    await engine.truncate();
    const all = await engine.getAll();
    expect(Object.keys(all).length).toBe(0);
  });
});
