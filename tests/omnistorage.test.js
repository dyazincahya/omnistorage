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

  test("should use sqlite engine by default", () => {
    expect(store.defaultEngine.engineType).toBe("sqlite-server");
  });

  test("should configure activity log engine", () => {
    store.configureLogs("auto");
    const config = store.getLogConfig();
    expect(config.mode).toBe("auto");
    expect(typeof config.databaseExists).toBe("boolean");
  });

  test("should include log source in activity log response", async () => {
    await store.save("logSourceKey", "value");
    const result = await store.getActivityLogs(1);

    expect(result.source).toBe("server");
    expect(result.data[0].source).toBe("server");
  });

  test("should initialize global config", async () => {
    const result = await store.init({
      db: {
        name: "omnistorage",
        engine: "sqlite",
      },
      logs: "server",
    });

    expect(result).toBe(store);
    expect(store.getDbName()).toBe("omnistorage");
    expect(store.defaultEngine.engineType).toBe("sqlite-server");
    expect(store.getLogConfig().mode).toBe("server");
  });

  test("should keep legacy init config", async () => {
    await store.init({
      dbName: "legacy",
      engine: "memory",
      logs: "auto",
    });

    expect(store.getDbName()).toBe("legacy");
    expect(store.defaultEngine.engineType).toBe("memory");
    expect(store.getLogConfig().mode).toBe("auto");
  });

  test("should initialize default global config", async () => {
    await store.init();

    expect(store.getDbName()).toBe("omnistorage");
    expect(store.defaultEngine.engineType).toBe("sqlite-server");
    expect(store.getLogConfig().mode).toBe("auto");
  });

  test("should keep chainable global config", () => {
    const result = store.db("app").use("memory").configureLogs("auto");

    expect(result).toBe(store);
    expect(store.getDbName()).toBe("app");
    expect(store.defaultEngine.engineType).toBe("memory");
    expect(store.getLogConfig().mode).toBe("auto");
  });

  test("should support semantic chainable config", () => {
    const result = store
      .use({
        db: {
          name: "omnistorage",
          engine: "sqlite",
        },
      })
      .configureLogs("auto");

    expect(result).toBe(store);
    expect(store.getDbName()).toBe("omnistorage");
    expect(store.defaultEngine.engineType).toBe("sqlite-server");
    expect(store.getLogConfig().mode).toBe("auto");
  });

  test("should keep flat chainable config compatibility", () => {
    store.use({ dbName: "legacy", engine: "memory" });

    expect(store.getDbName()).toBe("legacy");
    expect(store.defaultEngine.engineType).toBe("memory");
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

  test("should switch engines using engine", async () => {
    const memoryStore = store.engine("memory");
    await memoryStore.save("memKey", "memValue");
    const result = await memoryStore.find("memKey");
    expect(result.ok).toBe(true);
    expect(result.data).toBe("memValue");
    expect(result.engine).toBe("memory");
  });

  test("should keep config as an alias for engine", async () => {
    const memoryConfig = store.config("memory");
    await memoryConfig.save("configKey", "configValue");
    const result = await memoryConfig.find("configKey");
    expect(result.ok).toBe(true);
    expect(result.data).toBe("configValue");
    expect(result.engine).toBe("memory");
  });

  test("should execute save and find with JSON payload", async () => {
    const saveResult = await store.command({
      engine: "memory",
      dbName: "demo_app",
      namespace: "default",
      operation: "save",
      key: "user:1",
      value: { name: "Kang Cahya", active: true },
    });

    expect(saveResult.ok).toBe(true);
    expect(saveResult.data).toEqual({ name: "Kang Cahya", active: true });
    expect(saveResult.command).toEqual({
      operation: "save",
      engine: "memory",
      dbName: "demo_app",
      namespace: "default",
    });

    const findResult = await store.command({
      engine: "memory",
      dbName: "demo_app",
      operation: "find",
      key: "user:1",
    });

    expect(findResult.ok).toBe(true);
    expect(findResult.data).toEqual({ name: "Kang Cahya", active: true });
  });

  test("should execute JSON payload inside a namespace", async () => {
    await store.command({
      engine: "memory",
      dbName: "demo_app",
      namespace: "auth",
      operation: "save",
      key: "token",
      value: "secure-token-value",
    });

    const authResult = await store.command({
      engine: "memory",
      dbName: "demo_app",
      namespace: "auth",
      operation: "find",
      key: "token",
    });

    const defaultResult = await store.command({
      engine: "memory",
      dbName: "demo_app",
      namespace: "default",
      operation: "find",
      key: "token",
    });

    expect(authResult.ok).toBe(true);
    expect(authResult.data).toBe("secure-token-value");
    expect(defaultResult.ok).toBe(false);
  });

  test("should expose execute and run as command aliases", async () => {
    const executeResult = await store.execute({
      operation: "save",
      key: "alias:1",
      value: "execute-value",
    });
    const runResult = await store.run({ operation: "find", key: "alias:1" });

    expect(executeResult.ok).toBe(true);
    expect(runResult.ok).toBe(true);
    expect(runResult.data).toBe("execute-value");
  });

  test("should return standard error response for invalid JSON payload", async () => {
    const result = await store.command({ operation: "save" });

    expect(result.ok).toBe(false);
    expect(result.message).toContain('requires a non-empty "key"');
    expect(result.command.operation).toBe("save");
  });
});
