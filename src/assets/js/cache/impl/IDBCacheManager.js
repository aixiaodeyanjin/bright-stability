import CacheManager from '../CacheManager';
import IDBStoreObjectCache from '../impl/IDBStoreObjectCache';

function connectToIndexedDB(dbName) {
  const idbRequest = window.indexedDB.open(dbName);
  return new Promise((resolve) => {
    idbRequest.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
}

export default class IDBCacheManager extends CacheManager {
  constructor(dbName) {
    super();
    this.dbName = dbName;
    this.dbPromise = connectToIndexedDB(dbName);
    this.cacheMap = new Map();
  }

  geOrUpgradetDB(name) {
    let that = this;
    this.dbPromise = this.dbPromise.then((db) => {
      if (!db.objectStoreNames.contains(name)) {
        db.close();
        let idbRequest = window.indexedDB.open(that.dbName, db.version + 1);
        return new Promise((resolve) => {
          idbRequest.onupgradeneeded = (e) => {
            let db = e.target.result;
            db.createObjectStore(name);
            e.target.transaction.oncomplete = () => {
              resolve(db);
            };
          };
        });
      }
      return db;
    });
    return this.dbPromise;
  }

  getCache(name) {
    let cache = this.cacheMap.get(name);
    if (!cache) {
      cache = new IDBStoreObjectCache(name, () => this.geOrUpgradetDB(name));
      this.cacheMap.set(name, cache);
    }
    return cache;
  }
}
