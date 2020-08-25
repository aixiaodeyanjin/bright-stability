import EntityManager from '../cesium/EntityManager'
import CacheManagerFactory from '../../cache/CacheManagerFactory'
import {createGuid, Entity, CallbackProperty, ScreenSpaceEventHandler, ScreenSpaceEventType, Cartesian3, Color, PinBuilder, VerticalOrigin} from 'cesium'

class Measure {
  constructor (scene) {
    this.scene = scene
    this._positions = []
    this.isRun = true
    this.canSave = false
    this.handler = new ScreenSpaceEventHandler(scene.canvas)
    this.handler.setInputAction(this.onLeftClick.bind(this), ScreenSpaceEventType.LEFT_CLICK)
    this.handler.setInputAction(this.onMouseMove.bind(this), ScreenSpaceEventType.MOUSE_MOVE)
    this.handler.setInputAction(this.onRightClick.bind(this), ScreenSpaceEventType.RIGHT_CLICK)
  }

  get positions () {
    return this._positions
  }

  addPosition (position) {
    this._positions.push(position)
  }

  getPoint (index) {
    return this._positions[index]
  }

  distance (p1, p2) {
    return Cartesian3.distance(p1, p2)
  }

  midpoint (p1, p2) {
    return Cartesian3.midpoint(p1, p2, new Cartesian3())
  }

  onLeftClick (event) {

  }

  onMouseMove (event) {

  }

  onRightClick (event) {

  }

  removeLeftClick () {
    this.handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK)
  }

  removeMouseMove () {
    this.handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE)
  }

  removeRightClick () {
    this.handler.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK)
  }

  pick (position) {
    return this.scene.camera.pickEllipsoid(position, this.scene.globe.ellipsoid)
  }

  pickClampToHeight (position) {
    let cartesian = this.pick(position)
    let height = this.scene.clampToHeight(cartesian)
    if (height) {
      cartesian = height
    }
    return cartesian
  }

  saveToLocal (id, cacheName) {
    let measureCache = CacheManagerFactory.getDefaultCacheManager().getCache(cacheName)
    measureCache.put(id, {time: new Date().toISOString(), positions: this.positions})
  }

  destroy () {
    this.isRun = false
    this.handler.destroy()
  }
}
class DistanceMeasure extends Measure {
    static MEASURE_GROUP_ID = 'distance-measure'
    constructor (viewer) {
      super(viewer.scene.canvas)
      this.viewer = viewer
      this.scene = viewer.scene
      this.pinBuilder = new PinBuilder()
      let that = this
      let measureId = createGuid()
      this.measureId = measureId
      this.entity = new Entity({
        id: measureId,
        polyline: {
          positions: new CallbackProperty(() => {
            return that.positions
          }, false),
          width: 2
          // clampToGround: true
        }
      })
      this.totalDistance = 0
      viewer.entityManager.add(this.entity, DistanceMeasure.MEASURE_GROUP_ID)
    }

    onLeftClick (event) {
      let {position} = event
      let cartesian = super.pickClampToHeight(position)
      super.addPosition(cartesian)
      let length = super.positions.length
      if (length >= 2) {
        this.canSave = true
        let [p1, p2] = [super.getPoint(length - 1), super.getPoint(length - 2)]
        let [distance, midpoint] = [super.distance(p1, p2), super.midpoint(p1, p2)]
        this.onlastTwoPoint(p1, p2, distance, midpoint)
      }
      this.addMarker(cartesian, length)
    }

    addMarker (cartesian, length) {
      let marker = new Entity({
        position: cartesian,
        billboard: {
          image: this.pinBuilder.fromText(length, Color.BLACK, 48).toDataURL(),
          width: 35,
          height: 35,
          verticalOrigin: VerticalOrigin.BOTTOM,
          eyeOffset: Cartesian3.fromElements(0, 0, -5),
          disableDepthTestDistance: 0
        }
      })
      this.viewer.entityManager.add(marker, DistanceMeasure.MEASURE_GROUP_ID)
    }

    onlastTwoPoint (last1, lastTwo, distance, midpoint) {
      let label = new Entity({
        position: midpoint,
        label: {
          text: `${distance.toFixed(2)}米`,
          font: '12px sans-serif',
          showBackground: true,
          backgroundColor: Color.BLACK,
          eyeOffset: Cartesian3.fromElements(0, 0, -5)
        }
      })
      this.totalDistance = this.totalDistance + distance
      this.viewer.entityManager.add(label, DistanceMeasure.MEASURE_GROUP_ID)
    }

    saveToLocal (cb) {
      let measureCache = CacheManagerFactory.getDefaultCacheManager().getCache(DistanceMeasure.MEASURE_GROUP_ID)
      measureCache.put(this.measureId, {time: new Date().toISOString(), positions: this.positions, totalDistance: this.totalDistance}).then(data => {
        if (cb) cb(data)
      })
    }

    destroy () {
      super.destroy()
      this.viewer.entityManager.removeByGroupId(DistanceMeasure.MEASURE_GROUP_ID)
    }

    static start (scene) {
      return new DistanceMeasure(scene)
    }
}
export default {
  DistanceMeasure
}
