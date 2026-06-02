import { BaseEngine } from "../src/engines/base.js";

describe("BaseEngine", () => {
  class MockEngine extends BaseEngine {
    constructor(dbName) {
      super(dbName, "mock");
      this.store = {};
    }
    async getItemRaw(key) { return this.store[key]; }
    async keys() { return Object.keys(this.store); }
  }

  let engine;
  beforeEach(() => {
    engine = new MockEngine("TestDB");
  });

  test("should apply prefix correctly", () => {
    expect(engine._applyPrefix("myKey")).toBe("TestDB_myKey");
  });

  test("should return dbName", () => {
    expect(engine.getDbName()).toBe("TestDB");
  });

  test("should calculate stats", async () => {
    engine.store["TestDB_k1"] = "v1";
    const stats = await engine.getStats();
    expect(stats.totalKeys).toBe(1);
    expect(stats.engine).toBe("mock");
  });
});
