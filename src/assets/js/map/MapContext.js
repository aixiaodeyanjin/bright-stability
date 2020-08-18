import 'cesium/Source/Widgets/widgets.css'
import * as Cesium from 'cesium'
import CesiumViewerFactory from '@/assets/js/map/CesiumViewerFactory'
export default class MapContext {
  constructor (elem) {
    this.viewer = CesiumViewerFactory.getDefaultMap(elem)
    this.entityEvent = new Cesium.Event()
    this.eventHelper = new Cesium.EventHelper()
    var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    handler.setInputAction((e) => {
      var pick = this.viewer.scene.pick(e.position)
      this.entityEvent.raiseEvent(e, pick)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  flyToPeopleHouse (longitude, latitude) {
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 100.0),
      duration: 4,
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: Cesium.Math.toRadians(0)
      }
    })
  }

  addEnityClickedListener (listener) {
    this.eventHelper.add(this.entityEvent, listener, this)
  }
}
