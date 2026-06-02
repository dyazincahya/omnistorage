/**
 * @jest-environment jsdom
 */
import "fake-indexeddb/auto";
import IndexedDBEngine from "../src/engines/indexeddb/index.js";

describe("IndexedDBEngine", () => {
  let engine;
  const DB_NAME = "IDBTestDB";

  beforeEach(() => {
    engine = new IndexedDBEngine(DB_NAME);
  });

  afterEach(async () => {
    // Clear the database after each test
    await engine.truncate();
  });

  test("should set and get items from IndexedDB", async () => {
    await engine.setItem("testKey", "testValue");
    const value = await engine.getItem("testKey");
    expect(value).toBe("testValue");
  });

  test("should remove items from IndexedDB", async () => {
    await engine.setItem("testKey", "testValue");
    await engine.removeItem("testKey");
    const value = await engine.getItem("testKey");
    expect(value).toBe(null);
  });

  test("should handle batch operations (setItems)", async () => {
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
