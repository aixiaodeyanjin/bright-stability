import Cache from '../Cache';
export default class LocalStorageCache extends Cache {
  constructor(name) {
    super(name);
    this.name = name;
    this.keys = new Set(JSON.parse(this.getNativeCache().getItem(name) || '[]'));
  }

  getNativeCache() {
    return window.localStorage;
  }

  get(key) {
    return Promise.resolve(JSON.parse(this.getNativeCache().getItem(this.name + '-' + key)));
  }

  getAll() {
    return Promise.resolve(this.getNativeCache().getItem(this.name)).then((keys) => {
      return JSON.parse(keys).map((key) => JSON.parse(this.getNativeCache().getItem(this.name + '-' + key)));
    });
  }

  put(key, object) {
    this.keys.add(key);
    this.getNativeCache().setItem(this.name, JSON.stringify([...this.keys]));
    this.getNativeCache().setItem(this.name + '-' + key, JSON.stringify(object));
  }

  evict(key) {
    this.keys.remove(key);
    this.getNativeCache().setItem(this.name, this.keys);
    this.getNativeCache().removeItem(this.name + '-' + key);
  }

  contains(key) {
    return this.keys.contains(key);
  }

  putIfAbsent(key, object) {
    if (!this.contains(key)) {
      this.put(key, object);
    }
  }
}
