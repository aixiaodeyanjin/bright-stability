import Cache from '../Cache';
export default class IDBStorageObjectCache extends Cache {
  constructor(name, db) {
    super(name);
    this.db = db;
  }

  getName() {
    return this.name;
  }

  getNativeCache() {
    return this.db();
  }

  get(key) {
    let { name } = this;
    return this.getNativeCache().then((db) => {
      let request = db.transaction(name).objectStore(name).get(key);
      return new Promise((resolve, reject) => {
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = reject;
      });
    });
  }

  getAll() {
    let { name } = this;
    return this.getNativeCache().then((db) => {
      let request = db.transaction(name).objectStore(name).getAll();
      return new Promise((resolve, reject) => {
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = reject;
      });
    });
  }

  async put(key, object) {
    let isUpdate = await this.contains(key);
    if (isUpdate) {
      return this.update(key, object);
    } else {
      return this.add(key, object);
    }
  }

  add(key, object) {
    let { name } = this;
    return this.getNativeCache().then((db) => {
      let request = db.transaction(name, 'readwrite').objectStore(name).add(object, key);
      return new Promise((resolve, reject) => {
        request.onsuccess = (e) => resolve(e);
        request.onerror = (e) => reject(e);
      });
    });
  }

  update(key, object) {
    let { name } = this;
    return this.getNativeCache().then((db) => {
      let request = db.transaction(name, 'readwrite').objectStore(name).put(object, key);
      return new Promise((resolve, reject) => {
        request.onsuccess = (e) => resolve(e);
        request.onerror = (e) => reject(e);
      });
    });
  }

  evict(key) {
    let { name } = this;
    return this.getNativeCache().then((db) => {
      let request = db.transaction(name, 'readwrite').objectStore(name).delete(key);
      return new Promise((resolve, reject) => {
        request.onsuccess = resolve;
        request.onerror = reject;
      });
    });
  }

  contains(key) {
    return this.get(key).then((result) => {
      return result !== undefined;
    });
  }

  async putIfAbsent(key, object) {
    if (!(await this.contains(key))) {
      this.add(key, object);
    }
  }
}
