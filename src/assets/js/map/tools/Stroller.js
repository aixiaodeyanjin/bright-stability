/**
 * 漫步实现
 */
import MouseEvent from './MouseEvent'
import { Entity, CallbackProperty, defined, Cartographic, HorizontalOrigin, VerticalOrigin, Cartesian3, LabelStyle, Color, Cartesian2, EventHelper, Event, createGuid, JulianDate, SampledPositionProperty, ClockRange, VelocityOrientationProperty } from 'cesium'
import CacheManagerFactory from '../../cache/CacheManagerFactory'

/**
 * 常量
 */
const CACHE_NAME = 'Stroller'
const CACHE = CacheManagerFactory.getDefaultCacheManager().getCache(CACHE_NAME)
const eventHelper = new EventHelper()
const routeChangeEvent = new Event()

function buildMarker (position, height) {
  return new Entity({
    position,
    billboard: {
      image: require('@/assets/img/mapicon/marker-selected.png'),
      width: 35,
      height: 35,
      horizontalOrigin: HorizontalOrigin.CENTER,
      verticalOrigin: VerticalOrigin.BOTTOM,
      eyeOffset: Cartesian3.fromElements(0, 0, -5)
    },
    label: {
      text: `${height.toFixed(2)}m`,
      font: '12px Microsoft YaHei',
      style: LabelStyle.FILL_AND_OUTLINE,
      fillColor: Color.WHITE,
      outlineWidth: 2,
      outlineColor: Color.WHITE,
      showBackground: true,
      backgroundColor: Color.fromCssColorString(
        '#000'
      ).withAlpha(0.5),
      backgroundPadding: new Cartesian2(7, 5),
      horizontalOrigin: HorizontalOrigin.CENTER,
      verticalOrigin: VerticalOrigin.BOTTOM,
      pixelOffset: new Cartesian2(0, -40),
      eyeOffset: Cartesian3.fromElements(0, 0, -5)
      // disableDepthTestDistance: 1000000000
    }
  })
}

class Stroller extends MouseEvent {
  constructor (viewer) {
    super(viewer.scene)
    this.viewer = viewer
    this.positions = []
    this.markers = []
    this.init()
  }

  /**
   * 获取缓存
   */
  get cache () {
    return CACHE
  }

  init () {
    this.polyline = this.createPolyline()
    this.viewer.entityManager.add(this.polyline, CACHE_NAME)
  }

  createPolyline () {
    return new Entity({
      polyline: {
        positions: new CallbackProperty(() => {
          return this.positions
        }, false),
        width: 4,
        clampToGround: true
      }
    })
  }

  /**
   * 左键点击事件
   * @param {*} event
   */
  onLeftClick (event) {
    let {position} = event
    let cartesian = this.scene.pickPosition(position)
    if (defined(cartesian)) {
      this.positions.push(cartesian)
      this.pinPosition(cartesian)
      routeChangeEvent.raiseEvent(cartesian)
    }
  }

  /**
   * 添加marker
   */
  pinPosition (position) {
    let {height} = Cartographic.fromCartesian(position)
    let pinMarker = buildMarker(position, height)
    let marker = this.viewer.entityManager.add(pinMarker, CACHE_NAME)
    this.markers.push(marker)
  }

  /**
 * 鼠标移动世界
 * @param {*} event
 */
  onMouseMove (event) {

  }

  /**
 * 右键点击事件
 * @param {*} event
 */
  onRightClick (event) {

  }

  /**
   * 路线改变事件
   * @param {*} listener
   */
  addRouteChangeHandler (listener, scope) {
    eventHelper.add(routeChangeEvent, listener, scope)
  }

  /**
   * 修改位置
   * @param {*} i
   * @param {*} position
   */
  changePosition (i, position) {
    this.positions[i] = position
    let {height} = Cartographic.fromCartesian(position)
    let marker = this.markers[i]
    marker.position = position
    marker.label.text = `${height.toFixed(2)}m`
  }

  /**
   * 保存路径
   */
  saveRoute () {
    let id = createGuid()
    let title = new Date().toISOString()
    let data = {id, title, positions: this.positions}
    return CACHE.put(id, data).then(() => {
      return data
    })
  }

  /**
   * 规划路线
   * @param {*} viewer
   */
  static planRoute (viewer) {
    return new Stroller(viewer)
  }

  /**
   * 获取自定义路径
   */
  static getRoutes () {
    return CACHE.getAll()
  }

  /**
   * 删除自定义路径
   * @param {*} id
   */
  static deleteRoute (id) {
    return CACHE.evict(id)
  }

  /**
   * 移除漫游者
   * @param {*} id
   */
  static removeStroller (viewer, id) {
    viewer.entities.removeById(id)
  }

  /**
   * 添加漫游者
   * @param {*} route
   */
  static addStroller (viewer, route) {
    let start = JulianDate.now()
    let nextTime = start.clone()

    var sampledPosition = route.positions.reduce((total, { x, y, z }, i) => {
      let position = Cartesian3.fromElements(x, y, z)
      let prePoistion = total.getValue(nextTime)
      if (prePoistion) {
        let distance = Cartesian3.distance(prePoistion, position)
        let needSec = distance / 1.5
        nextTime = JulianDate.addSeconds(nextTime, needSec, new JulianDate())
        total.addSample(nextTime, position)
      } else {
        total.addSample(nextTime, position)
      }
      return total
    }, new SampledPositionProperty())

    var modelUrl = '/static/models/Cesium_Man.glb'

    viewer.clock.startTime = start.clone()
    viewer.clock.stopTime = nextTime.clone()
    viewer.clock.currentTime = start.clone()
    viewer.clock.clockRange = ClockRange.LOOP_STOP // Loop at the end
    viewer.clock.multiplier = 1
    if (viewer.timeline) {
      viewer.timeline.zoomTo(start.clone(), nextTime.clone())
    }
    let stroller = viewer.entities.add({
      id: route.id,
      name: modelUrl,
      position: sampledPosition,
      orientation: new VelocityOrientationProperty(sampledPosition),
      model: {
        uri: modelUrl,
        scale: 1
      },
      viewFrom: new Cartesian3(0, -90, 40)
    })
    viewer.trackedEntity = stroller
  }

  destroy () {
    super.destroy()
    this.viewer.entityManager.removeByGroupId(CACHE_NAME)
  }
}

export default Stroller
