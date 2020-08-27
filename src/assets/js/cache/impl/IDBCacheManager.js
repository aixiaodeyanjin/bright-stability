import CacheManager from '../CacheManager'
import IDBStoreObjectCache from '../impl/IDBStoreObjectCache'
function openDB (name, version) {
  return new Promise((resolve, reject) => {
    const IDBRequest = window.indexedDB.open(name, version)
    IDBRequest.onerror = (e) => {
      throw new Error(e)
    }
    IDBRequest.onsuccess = resolve
    IDBRequest.onupgradeneeded = resolve
  })
}
export default class IDBCacheManager extends CacheManager {
  constructor (dbName) {
    super()
    this.dbName = dbName
    const idbRequest = window.indexedDB.open(dbName)
    idbRequest.onerror = e => {
    //   throw new Error(e)
    }
    this.dbPromise = Promise.race([new Promise(resolve => {
      idbRequest.onsuccess = resolve
    }), new Promise(resolve => {
      idbRequest.onupgradeneeded = resolve
    })]).then(event => {
      return event.target.result
    })
    this.cacheMap = new Map()
  }

  getCache (name) {
    let cache = this.cacheMap.get(name)
    if (!cache) {
      cache = new IDBStoreObjectCache(name, this.connectDB(name))
      this.cacheMap.set(name, cache)
    }
    return cache
  }

  connectDB (name) {
    let dbName = this.dbName
    return this.dbPromise.then(db => {
      let dbVersion = db.version
      if (!db.objectStoreNames.contains(name)) {
        db.close()
        let idbRequest = window.indexedDB.open(dbName, dbVersion + 1)
        return new Promise((resolve) => {
          idbRequest.onupgradeneeded = e => {
            let db = e.target.result
            db.createObjectStore(name)
            var transaction = e.target.transaction

            transaction.oncomplete =
            function (event) {
              resolve(db)
            }
          }
        })
      } else {
        return Promise.resolve(db)
      }
    })
  }
}
