import FileEngine from "../src/engines/file/index.js";
import fs from "fs/promises";
import path from "path";

describe("FileEngine", () => {
  let engine;
  const DB_NAME = "FileTestDB";
  const TEST_DIR = path.resolve(process.cwd(), ".omnistorage_test");

  beforeEach(async () => {
    // Clean up test directory before each test
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch (e) {}

    engine = new FileEngine(DB_NAME);
    engine.storageDir = TEST_DIR;
    engine.filePath = path.join(TEST_DIR, `${DB_NAME}.json`);
  });

  afterAll(async () => {
    // Final cleanup
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch (e) {}
  });

  test("should set and get items from file", async () => {
    await engine.setItem("testKey", "testValue");
    const value = await engine.getItem("testKey");
    expect(value).toBe("testValue");

    // Check if file exists and contains data
    const content = await fs.readFile(engine.filePath, "utf-8");
    const data = JSON.parse(content);
    expect(data[`${DB_NAME}_testKey`]).toBe("testValue");
  });

  test("should remove items from file", async () => {
    await engine.setItem("testKey", "testValue");
    await engine.removeItem("testKey");
    const value = await engine.getItem("testKey");
    expect(value).toBe(null);
  });

  test("should truncate items", async () => {
    await engine.setItem("key1", "value1");
    await engine.setItem("key2", "value2");
    await engine.truncate();
    const all = await engine.getAll();
    expect(Object.keys(all).length).toBe(0);
  });

  test("should get all items", async () => {
    await engine.setItem("a", 1);
    await engine.setItem("b", 2);
    const all = await engine.getAll();
    expect(all).toEqual({ a: 1, b: 2 });
  });
});
