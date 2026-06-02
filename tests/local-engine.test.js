/**
 * @jest-environment jsdom
 */
import LocalEngine from "../src/engines/local/index.js";

describe("LocalEngine", () => {
  let engine;
  const DB_NAME = "LocalTestDB";

  beforeEach(() => {
    window.localStorage.clear();
    engine = new LocalEngine(DB_NAME);
  });

  test("should set and get items from localStorage", async () => {
    await engine.setItem("testKey", "testValue");
    const value = await engine.getItem("testKey");
    expect(value).toBe("testValue");
    expect(window.localStorage.getItem(`${DB_NAME}_testKey`)).toBe("testValue");
  });

  test("should remove items from localStorage", async () => {
    await engine.setItem("testKey", "testValue");
    await engine.removeItem("testKey");
    const value = await engine.getItem("testKey");
    expect(value).toBe(null);
  });

  test("should truncate items", async () => {
    await engine.setItem("key1", "value1");
    await engine.setItem("key2", "value2");
    await engine.truncate();
    const keys = await engine.keys();
    const prefixedKeys = keys.filter((k) => k.startsWith(`${DB_NAME}_`));
    expect(prefixedKeys.length).toBe(0);
  });
});
