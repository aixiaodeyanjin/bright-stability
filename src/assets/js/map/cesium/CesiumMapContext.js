import * as Cesium from 'cesium';
export default class MapContext {
  constructor(viewer) {
    this.viewer = viewer;
    this.entityEvent = new Cesium.Event();
    this.eventHelper = new Cesium.EventHelper();
    var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction((e) => {
      var pick = this.viewer.scene.pick(e.position);
      this.entityEvent.raiseEvent(e, pick);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  getMap() {
    return this.viewer;
  }

  flyToPeopleHouse(longitude, latitude) {
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 100.0),
      duration: 4,
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: Cesium.Math.toRadians(0),
      },
      easingFunction: (time) => {
        return time - 1;
      },
    });
  }

  adjust3DTilesPosition(_3dTiles, array) {
    if (_3dTiles && array) {
      _3dTiles._modelMatrix = Cesium.Matrix4.fromTranslation(Cesium.Cartesian3.fromArray(array));
    }
  }

  addEnityClickedListener(listener) {
    this.eventHelper.add(this.entityEvent, listener, this);
  }
}
