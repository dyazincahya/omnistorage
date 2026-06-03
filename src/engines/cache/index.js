import is from "is";
import { BaseEngine } from "../base.js";

export default class CacheEngine extends BaseEngine {
  constructor(dbName) {
    super(dbName, "cache");
    this.cacheName = `omnistorage-${dbName}`;
    this.baseUrl = this._getBaseUrl();
  }

  _isAvailable() {
    return !is.undefined(globalThis.caches);
  }

  _getBaseUrl() {
    if (!is.undefined(globalThis.location) && location.origin) {
      return location.origin;
    }

    return "https://omnistorage.local";
  }

  _toUrl(fullKey) {
    return `${this.baseUrl}/__omnistorage__/${encodeURIComponent(fullKey)}`;
  }

  _fromUrl(url) {
    const prefix = `${this.baseUrl}/__omnistorage__/`;
    if (!url.startsWith(prefix)) return null;
    return decodeURIComponent(url.slice(prefix.length));
  }

  async _getCache() {
    if (!this._isAvailable()) return null;
    return caches.open(this.cacheName);
  }

  async getItemRaw(fullKey) {
    const cache = await this._getCache();
    if (!cache) return null;

    const response = await cache.match(this._toUrl(fullKey));
    return response ? response.text() : null;
  }

  async getItem(key) {
    return this.getItemRaw(this._applyPrefix(key));
  }

  async setItem(key, value) {
    const cache = await this._getCache();
    if (!cache) return;

    await cache.put(
      this._toUrl(this._applyPrefix(key)),
      new Response(value, {
        headers: { "Content-Type": "application/json" },
      }),
    );
  }

  async removeItem(key) {
    const cache = await this._getCache();
    if (!cache) return;
    await cache.delete(this._toUrl(this._applyPrefix(key)));
  }

  async truncate() {
    const cache = await this._getCache();
    if (!cache) return;

    const prefix = `${this.dbName}_`;
    const requests = await cache.keys();

    for (const request of requests) {
      const key = this._fromUrl(request.url);
      if (key && key.startsWith(prefix)) {
        await cache.delete(request);
      }
    }
  }

  async getAll() {
    const cache = await this._getCache();
    const results = {};
    if (!cache) return results;

    const prefix = `${this.dbName}_`;
    const requests = await cache.keys();

    for (const request of requests) {
      const key = this._fromUrl(request.url);
      if (key && key.startsWith(prefix)) {
        const response = await cache.match(request);
        if (response) {
          results[key.replace(prefix, "")] = JSON.parse(await response.text());
        }
      }
    }

    return results;
  }

  async keys() {
    const cache = await this._getCache();
    if (!cache) return [];

    const requests = await cache.keys();
    return requests
      .map((request) => this._fromUrl(request.url))
      .filter((key) => !is.null(key));
  }
}
