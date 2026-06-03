/**
 * @jest-environment jsdom
 */
import CookieEngine from "../src/engines/cookie/index.js";

describe("CookieEngine", () => {
  let engine;
  const DB_NAME = "CookieTestDB";

  beforeEach(async () => {
    engine = new CookieEngine(DB_NAME);
    await engine.truncate();
  });

  afterEach(async () => {
    await engine.truncate();
  });

  test("should set and get items from cookies", async () => {
    await engine.setItem("testKey", "testValue");

    const value = await engine.getItem("testKey");

    expect(value).toBe("testValue");
    expect(document.cookie).toContain(`${DB_NAME}_testKey=testValue`);
  });

  test("should remove items from cookies", async () => {
    await engine.setItem("testKey", "testValue");
    await engine.removeItem("testKey");

    const value = await engine.getItem("testKey");

    expect(value).toBe(null);
  });

  test("should truncate prefixed cookies", async () => {
    await engine.setItem("key1", "value1");
    await engine.setItem("key2", "value2");
    await engine.truncate();

    const keys = await engine.keys();
    const prefixedKeys = keys.filter((key) => key.startsWith(`${DB_NAME}_`));

    expect(prefixedKeys.length).toBe(0);
  });
});
