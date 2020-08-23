export default class Cache {
  constructor (name) {
    this.name = name
  }

  getName () {
    return this.name
  }

  getNativeCache () {}

  get (key) {}

  put (key, object) {}

  evict (key) {}

  contains (key) {}

  getAll () {}

  putIfAbsent (key, object) {}
}
