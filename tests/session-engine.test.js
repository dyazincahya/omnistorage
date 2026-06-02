/**
 * @jest-environment jsdom
 */
import SessionEngine from "../src/engines/session/index.js";

describe("SessionEngine", () => {
  let engine;
  const DB_NAME = "SessionTestDB";

  beforeEach(() => {
    window.sessionStorage.clear();
    engine = new SessionEngine(DB_NAME);
  });

  test("should set and get items from sessionStorage", async () => {
    await engine.setItem("testKey", "testValue");
    const value = await engine.getItem("testKey");
    expect(value).toBe("testValue");
    expect(window.sessionStorage.getItem(`${DB_NAME}_testKey`)).toBe(
      "testValue",
    );
  });

  test("should remove items from sessionStorage", async () => {
    await engine.setItem("testKey", "testValue");
    await engine.removeItem("testKey");
    const value = await engine.getItem("testKey");
    expect(value).toBe(null);
  });
});
