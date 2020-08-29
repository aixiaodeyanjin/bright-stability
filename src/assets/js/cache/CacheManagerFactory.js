import LocalStorageManager from './impl/LocalStorageManager';
import IDBCacheManager from './impl/IDBCacheManager';
export default class CacheManagerFactory {
  static DEFAULT_CACHE_MANAGER;
  static DEFAULT_DB_NAME = 'bright-stability';
  static getDefaultCacheManager() {
    if (!CacheManagerFactory.DEFAULT_CACHE_MANAGER) {
      let isSupportIDB = window.indexedDB;
      if (isSupportIDB) {
        try {
          CacheManagerFactory.DEFAULT_CACHE_MANAGER = CacheManagerFactory.getIDBCacheManager(CacheManagerFactory.DEFAULT_DB_NAME);
        } catch (error) {
          CacheManagerFactory.DEFAULT_CACHE_MANAGER = CacheManagerFactory.getLocalStorageCacheManager();
        }
      } else {
        CacheManagerFactory.DEFAULT_CACHE_MANAGER = CacheManagerFactory.getLocalStorageCacheManager();
      }
    }
    return this.DEFAULT_CACHE_MANAGER;
  }

  static getLocalStorageCacheManager() {
    return new LocalStorageManager();
  }

  static getIDBCacheManager(dbName) {
    return new IDBCacheManager(dbName);
  }
}
