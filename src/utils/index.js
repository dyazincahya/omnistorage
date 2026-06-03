import is from "is";

/**
 * Engine Utilities
 * Provides data filtering and storage limit validation.
 */

const DEFAULT_LIMITS = {
  local: 5 * 1024 * 1024, // 5MB, common Web Storage practical limit
  session: 5 * 1024 * 1024, // 5MB, common Web Storage practical limit
  cookie: 20 * 4096, // ~80KB, conservative 20 cookies/origin × 4KB each
  cache: 50 * 1024 * 1024, // 50MB soft guard; browser quota is best-effort
  memory: 50 * 1024 * 1024, // 50MB soft guard for in-process runtime cache
  file: 100 * 1024 * 1024, // 100MB soft guard for JSON file-backed storage
  indexeddb: 500 * 1024 * 1024, // 500MB soft guard; real quota is browser-dependent
  "sqlite-server": 1024 * 1024 * 1024, // 1GB soft guard for local SQLite files
  "sqlite-client": 256 * 1024 * 1024, // 256MB soft guard; OPFS/browser quota varies
};

const ITEM_LIMITS = {
  cookie: 4096, // 4KB, common practical maximum for a single cookie
};

/**
 * Estimate size of data in bytes
 */
export const estimateSize = (data) => {
  if (is.undefined(data) || is.null(data)) return 0;
  try {
    const stringified = is.string(data) ? data : JSON.stringify(data);
    return new TextEncoder().encode(stringified).length;
  } catch (e) {
    return 0;
  }
};

/**
 * Format payload before insertion/update (Standard Input)
 * Useful for normalization, cleaning, or adding common fields
 */
export const formatPayload = (data) => {
  // Example standardization: ensure data is always an object if it's not a primitive
  // This is where you can change the input format for the whole library
  if (is.string(data)) return data.trim();
  return data;
};

/**
 * Format output data before returning to user (Standard Output Data)
 */
export const formatOutputData = (data) => {
  // Example standardization: ensure we never return undefined
  // This is where you can change the output format for the whole library
  if (is.undefined(data)) return null;
  return data;
};

/**
 * Internal standard response formatter (Standard JSON Structure)
 */
export const formatStandardResponse = ({
  ok = true,
  data = null,
  message = "Success",
  engine = "unknown",
}) => {
  return {
    ok,
    data: formatOutputData(data),
    message,
    engine,
    timestamp: Date.now(),
  };
};

/**
 * Alias for backward compatibility or filtering logic
 */
export const filterInput = (data) => formatPayload(data);
export const filterOutput = (data) => formatOutputData(data);

/**
 * Validate if adding new data exceeds the engine limit
 * @returns { { ok: boolean, message?: string } }
 */
export const validateLimit = (
  currentSize,
  newDataSize,
  engineType = "local",
) => {
  const limit = DEFAULT_LIMITS[engineType] || DEFAULT_LIMITS.local;
  const itemLimit = ITEM_LIMITS[engineType];
  const totalSize = currentSize + newDataSize;

  if (itemLimit && newDataSize > itemLimit) {
    return {
      ok: false,
      message: `Storage item too large for engine "${engineType}". Item limit: ${(
        itemLimit / 1024
      ).toFixed(2)}KB. New data: ${(newDataSize / 1024).toFixed(2)}KB.`,
    };
  }

  if (totalSize > limit) {
    return {
      ok: false,
      message: `Storage capacity full for engine "${engineType}". Limit: ${(
        limit /
        1024 /
        1024
      ).toFixed(2)}MB. Current: ${(currentSize / 1024 / 1024).toFixed(
        2,
      )}MB. New data: ${(newDataSize / 1024).toFixed(2)}KB.`,
    };
  }

  return { ok: true };
};
