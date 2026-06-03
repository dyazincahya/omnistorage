import is from "is";
import { BaseEngine } from "../base.js";

const MAX_COOKIE_SIZE = 4096;

export default class CookieEngine extends BaseEngine {
  constructor(dbName) {
    super(dbName, "cookie");
    this.cookieOptions = {
      path: "/",
      sameSite: "Lax",
    };
  }

  _isAvailable() {
    return !is.undefined(globalThis.document) && is.string(document.cookie);
  }

  _encode(value) {
    return encodeURIComponent(value);
  }

  _decode(value) {
    return decodeURIComponent(value);
  }

  _estimateCookieSize(cookie) {
    return new TextEncoder().encode(cookie).length;
  }

  _serializeCookie(name, value, options = {}) {
    const settings = { ...this.cookieOptions, ...options };
    const parts = [`${this._encode(name)}=${this._encode(value)}`];

    if (settings.maxAge) parts.push(`Max-Age=${settings.maxAge}`);
    if (settings.expires)
      parts.push(`Expires=${settings.expires.toUTCString()}`);
    if (settings.path) parts.push(`Path=${settings.path}`);
    if (settings.domain) parts.push(`Domain=${settings.domain}`);
    if (settings.sameSite) parts.push(`SameSite=${settings.sameSite}`);
    if (settings.secure) parts.push("Secure");

    return parts.join("; ");
  }

  _getCookieEntries() {
    if (!this._isAvailable() || !document.cookie) return [];

    return document.cookie.split("; ").map((cookie) => {
      const separatorIndex = cookie.indexOf("=");
      const rawName =
        separatorIndex >= 0 ? cookie.slice(0, separatorIndex) : cookie;
      const rawValue =
        separatorIndex >= 0 ? cookie.slice(separatorIndex + 1) : "";

      return [this._decode(rawName), this._decode(rawValue)];
    });
  }

  async getItemRaw(fullKey) {
    const entry = this._getCookieEntries().find(([key]) => key === fullKey);
    return entry ? entry[1] : null;
  }

  async getItem(key) {
    return this.getItemRaw(this._applyPrefix(key));
  }

  async setItem(key, value) {
    if (!this._isAvailable()) return;

    const cookie = this._serializeCookie(this._applyPrefix(key), value);
    const cookieSize = this._estimateCookieSize(cookie);

    if (cookieSize > MAX_COOKIE_SIZE) {
      throw new Error(
        `Cookie item too large. Limit: ${(MAX_COOKIE_SIZE / 1024).toFixed(
          2,
        )}KB. Actual: ${(cookieSize / 1024).toFixed(2)}KB.`,
      );
    }

    document.cookie = cookie;
  }

  async removeItem(key) {
    if (!this._isAvailable()) return;
    document.cookie = this._serializeCookie(this._applyPrefix(key), "", {
      expires: new Date(0),
      maxAge: 0,
    });
  }

  async truncate() {
    const keys = await this.keys();
    const prefix = `${this.dbName}_`;

    for (const key of keys) {
      if (key.startsWith(prefix)) {
        document.cookie = this._serializeCookie(key, "", {
          expires: new Date(0),
          maxAge: 0,
        });
      }
    }
  }

  async getAll() {
    const results = {};
    const prefix = `${this.dbName}_`;

    for (const [key, value] of this._getCookieEntries()) {
      if (key.startsWith(prefix)) {
        results[key.replace(prefix, "")] = JSON.parse(value);
      }
    }

    return results;
  }

  async keys() {
    return this._getCookieEntries().map(([key]) => key);
  }
}
