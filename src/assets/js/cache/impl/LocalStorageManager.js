import CacheManager from '../CacheManager';
import LocalStorageCache from './LocalStorageCache';
export default class LocalStorageManager extends CacheManager {
  constructor() {
    super();
    this.cacheMap = new Map();
  }

  getCache(name) {
    let cache = this.cacheMap.get(name);
    if (cache) {
      cache = new LocalStorageCache(name);
      this.cacheMap.set(name, cache);
    }
    return cache;
  }
}
