
import * as Cesium from 'cesium'
export default class MapContext {
  constructor (viewer) {
    this.viewer = viewer
    this.entityEvent = new Cesium.Event()
    this.eventHelper = new Cesium.EventHelper()
    var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    handler.setInputAction((e) => {
      var pick = this.viewer.scene.pick(e.position)
      this.entityEvent.raiseEvent(e, pick)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  autoNavigate () {
    debugger
    let [lng, lat] = [118.9060, 32.05536446]
    var property = new Cesium.SampledPositionProperty()
    var position1 = Cesium.Cartesian3.fromDegrees(118,
      32)
    const position = new Cesium.CallbackProperty((time, result) => {
      // lng += 0.000001
      lat += 0.00000004
      return Cesium.Cartesian3.fromDegrees(lng,
        lat, 26)
    }, false)
    var url = '/static/models/Cesium_Man.glb'
    var entity = (this.viewer.trackedEntity = this.viewer.entities.add({
      name: url,
      position: position,
      model: {
        uri: url,
        scale: 1
      },
      viewFrom: new Cesium.Cartesian3(0, 0, 100)
    }))
    // this.viewer.flyTo(entity)
  }

  getMap () {
    return this.viewer
  }

  flyToPeopleHouse (longitude, latitude) {
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 100.0),
      duration: 4,
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: Cesium.Math.toRadians(0)
      },
      easingFunction: time => {
        debugger
        return time - 1
      }
    })
  }

  adjust3DTilesPosition (_3dTiles, array) {
    if (_3dTiles && array) { _3dTiles._modelMatrix = Cesium.Matrix4.fromTranslation(Cesium.Cartesian3.fromArray(array)) }
  }

  addEnityClickedListener (listener) {
    this.eventHelper.add(this.entityEvent, listener, this)
  }
}
