import {
  estimateSize,
  formatPayload,
  formatOutputData,
  formatStandardResponse,
  validateLimit,
} from "../src/utils/index.js";

describe("Utils", () => {
  describe("estimateSize", () => {
    test("should return 0 for null or undefined", () => {
      expect(estimateSize(null)).toBe(0);
      expect(estimateSize(undefined)).toBe(0);
    });

    test("should estimate size of string", () => {
      expect(estimateSize("abc")).toBe(3);
    });

    test("should estimate size of object", () => {
      const data = { a: 1 };
      const expectedSize = new TextEncoder().encode(
        JSON.stringify(data),
      ).length;
      expect(estimateSize(data)).toBe(expectedSize);
    });
  });

  describe("formatPayload", () => {
    test("should trim strings", () => {
      expect(formatPayload("  hello  ")).toBe("hello");
    });

    test("should return other data as is", () => {
      const data = { a: 1 };
      expect(formatPayload(data)).toBe(data);
    });
  });

  describe("formatOutputData", () => {
    test("should return null for undefined", () => {
      expect(formatOutputData(undefined)).toBe(null);
    });

    test("should return data as is if not undefined", () => {
      expect(formatOutputData("data")).toBe("data");
      expect(formatOutputData(0)).toBe(0);
      expect(formatOutputData(false)).toBe(false);
    });
  });

  describe("formatStandardResponse", () => {
    test("should return standard response structure", () => {
      const response = formatStandardResponse({
        ok: true,
        data: "test",
        message: "success",
        engine: "local",
      });
      expect(response).toHaveProperty("ok", true);
      expect(response).toHaveProperty("data", "test");
      expect(response).toHaveProperty("message", "success");
      expect(response).toHaveProperty("engine", "local");
      expect(response).toHaveProperty("timestamp");
      expect(typeof response.timestamp).toBe("number");
    });
  });

  describe("validateLimit", () => {
    test("should return ok true if within limit", () => {
      const result = validateLimit(100, 200, "local");
      expect(result.ok).toBe(true);
    });

    test("should return ok false if exceeds limit", () => {
      const limit = 5 * 1024 * 1024;
      const result = validateLimit(limit, 1, "local");
      expect(result.ok).toBe(false);
      expect(result.message).toContain("Storage capacity full");
    });

    test.each([
      ["local", 5 * 1024 * 1024],
      ["session", 5 * 1024 * 1024],
      ["cookie", 20 * 4096],
      ["cache", 50 * 1024 * 1024],
      ["memory", 50 * 1024 * 1024],
      ["file", 100 * 1024 * 1024],
      ["indexeddb", 500 * 1024 * 1024],
      ["sqlite-server", 1024 * 1024 * 1024],
      ["sqlite-client", 256 * 1024 * 1024],
    ])("should enforce the configured total limit for %s", (engine, limit) => {
      expect(validateLimit(limit - 1, 1, engine).ok).toBe(true);

      const result = validateLimit(limit, 1, engine);
      expect(result.ok).toBe(false);
      expect(result.message).toContain(`engine "${engine}"`);
      expect(result.message).toContain("Storage capacity full");
    });

    test("should fall back to the local limit for unknown engines", () => {
      const localLimit = 5 * 1024 * 1024;

      expect(validateLimit(localLimit - 1, 1, "unknown-engine").ok).toBe(true);

      const result = validateLimit(localLimit, 1, "unknown-engine");
      expect(result.ok).toBe(false);
      expect(result.message).toContain('engine "unknown-engine"');
    });

    test("should reject oversized cookie items", () => {
      expect(validateLimit(0, 4096, "cookie").ok).toBe(true);

      const result = validateLimit(0, 4097, "cookie");
      expect(result.ok).toBe(false);
      expect(result.message).toContain("Storage item too large");
      expect(result.message).toContain('engine "cookie"');
    });

    test("should reject cookie total storage over the practical origin budget", () => {
      const result = validateLimit(20 * 4096, 1, "cookie");
      expect(result.ok).toBe(false);
      expect(result.message).toContain("Storage capacity full");
    });
  });
});
