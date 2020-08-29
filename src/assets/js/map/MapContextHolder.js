import { defined, Event } from 'cesium';
const MAP_INIT_EVENT = new Event();
const CONTEXT = new Promise((resolve) => {
  MAP_INIT_EVENT.addEventListener((context) => {
    resolve(context);
  });
});
export default class MapContextHolder {
  static getContext() {
    return CONTEXT;
  }

  static setContext(context) {
    MAP_INIT_EVENT.raiseEvent(context);
  }

  static getMap() {
    return CONTEXT.then((c) => c.getMap());
  }

  static clearContext() {
    if (defined(MapContextHolder.context)) {
      let map = MapContextHolder.context.getMap();
      if (map && map.destroy && typeof map.destroy == 'function') {
        map.destroy();
      }
      MapContextHolder.context = null;
    }
  }
}
