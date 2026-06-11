import MemoryEngine from "../src/engines/memory/index.js";

describe("MemoryEngine", () => {
  let engine;
  const DB_NAME = "TestDB";

  beforeEach(() => {
    engine = new MemoryEngine(DB_NAME);
  });

  test("should have correct engine type", () => {
    expect(engine.engineType).toBe("memory");
  });

  test("should use native Map storage", () => {
    expect(engine._store).toBeInstanceOf(Map);
  });

  test("should set and get items", async () => {
    await engine.setItem("testKey", "testValue");
    const value = await engine.getItem("testKey");
    expect(value).toBe("testValue");
  });

  test("should remove items", async () => {
    await engine.setItem("testKey", "testValue");
    await engine.removeItem("testKey");
    const value = await engine.getItem("testKey");
    expect(value).toBe(null);
  });

  test("should get all items", async () => {
    await engine.setItem("key1", "value1");
    await engine.setItem("key2", "value2");
    const all = await engine.getAll();
    expect(all).toEqual({
      key1: "value1",
      key2: "value2",
    });
  });

  test("should truncate items", async () => {
    await engine.setItem("key1", "value1");
    await engine.truncate();
    const all = await engine.getAll();
    expect(Object.keys(all).length).toBe(0);
  });

  test("should get stats", async () => {
    await engine.setItem("key1", "value1");
    const stats = await engine.getStats();
    expect(stats.engine).toBe("memory");
    expect(stats.totalKeys).toBe(1);
    expect(stats.totalSize).toBeGreaterThan(0);
  });
});
