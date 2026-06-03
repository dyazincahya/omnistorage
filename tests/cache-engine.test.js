/**
 * @jest-environment jsdom
 */
import CacheEngine from "../src/engines/cache/index.js";

class MockResponse {
  constructor(body) {
    this.body = body;
  }

  async text() {
    return this.body;
  }
}

class MockCache {
  constructor() {
    this.store = new Map();
  }

  async match(request) {
    const url = typeof request === "string" ? request : request.url;
    return this.store.get(url) || null;
  }

  async put(request, response) {
    const url = typeof request === "string" ? request : request.url;
    this.store.set(url, response);
  }

  async delete(request) {
    const url = typeof request === "string" ? request : request.url;
    return this.store.delete(url);
  }

  async keys() {
    return Array.from(this.store.keys()).map((url) => ({ url }));
  }
}

describe("CacheEngine", () => {
  let engine;
  let cachesMock;
  const DB_NAME = "CacheTestDB";

  beforeEach(async () => {
    cachesMock = new Map();
    globalThis.Response = MockResponse;
    globalThis.caches = {
      open: async (name) => {
        if (!cachesMock.has(name)) {
          cachesMock.set(name, new MockCache());
        }
        return cachesMock.get(name);
      },
    };

    engine = new CacheEngine(DB_NAME);
    await engine.truncate();
  });

  afterEach(() => {
    delete globalThis.caches;
    delete globalThis.Response;
  });

  test("should set and get items from Cache Storage", async () => {
    await engine.setItem("testKey", "testValue");

    const value = await engine.getItem("testKey");

    expect(value).toBe("testValue");
  });

  test("should remove items from Cache Storage", async () => {
    await engine.setItem("testKey", "testValue");
    await engine.removeItem("testKey");

    const value = await engine.getItem("testKey");

    expect(value).toBe(null);
  });

  test("should truncate prefixed cache entries", async () => {
    await engine.setItem("key1", "value1");
    await engine.setItem("key2", "value2");
    await engine.truncate();

    const keys = await engine.keys();
    const prefixedKeys = keys.filter((key) => key.startsWith(`${DB_NAME}_`));

    expect(prefixedKeys.length).toBe(0);
  });

  test("should return parsed values from getAll", async () => {
    await engine.setItem("key1", JSON.stringify({ value: 1 }));
    await engine.setItem("key2", JSON.stringify({ value: 2 }));

    const data = await engine.getAll();

    expect(data).toEqual({
      key1: { value: 1 },
      key2: { value: 2 },
    });
  });
});
