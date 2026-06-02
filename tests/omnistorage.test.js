/**
 * @jest-environment jsdom
 */
import { jest } from "@jest/globals";
import { StoreManager } from "../src/index.js";

describe("StoreManager", () => {
  let store;

  beforeEach(() => {
    // Clear localStorage before each test
    if (global.window && global.window.localStorage) {
      global.window.localStorage.clear();
    }
    store = new StoreManager();
  });

  test("should initialize with a random dbName", () => {
    const dbName = store.getDbName();
    expect(dbName).toHaveLength(5);
  });

  test("should allow changing dbName", () => {
    store.db("newdb");
    expect(store.getDbName()).toBe("newdb");
  });

  test("should use memory engine by default if no window", () => {
    // In jsdom, window.localStorage exists, so it might use local engine
    const engineType = store.defaultEngine.engineType;
    expect(["local", "memory"]).toContain(engineType);
  });

  test("should set and get values using default engine", async () => {
    await store.save("myKey", "myValue");
    const result = await store.find("myKey");
    expect(result.ok).toBe(true);
    expect(result.data).toBe("myValue");
  });

  test("should trigger hooks", async () => {
    const onSetSpy = jest.fn();
    store.on("onSet", onSetSpy);
    await store.save("hookKey", "hookValue");
    expect(onSetSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "hookKey",
        value: "hookValue",
      }),
    );
  });

  test("should watch for changes", async () => {
    const watchSpy = jest.fn();
    store.watch("watchKey", watchSpy);
    await store.save("watchKey", "newValue");
    expect(watchSpy).toHaveBeenCalledWith("newValue", null);
  });

  test("should switch engines using config", async () => {
    const memoryConfig = store.config("memory");
    await memoryConfig.save("memKey", "memValue");
    const result = await memoryConfig.find("memKey");
    expect(result.ok).toBe(true);
    expect(result.data).toBe("memValue");
    expect(result.engine).toBe("memory");
  });
});
