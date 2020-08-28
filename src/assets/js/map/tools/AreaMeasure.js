
import MouseEvent from './MouseEvent'
import CacheManagerFactory from '../../cache/CacheManagerFactory'
import {createGuid, Entity, CallbackProperty, Color, PinBuilder, EventHelper, defined, Event, Cartesian3, BoundingSphere, Cartographic, Math as CesiumMath} from 'cesium'
import * as turf from '@turf/turf'
/**
 * 面积测量
 */
const PIN_BUILDER = new PinBuilder()
const CACHE_NAME = 'area-measure'
const CACHE = CacheManagerFactory.getDefaultCacheManager().getCache(CACHE_NAME)
const eventHelper = new EventHelper()
const changeEvent = new Event()

/**
 * 获取多边形中心点
 * @param {Cartesian3[]} positions
 */
function getPolygonCenter (positions) {
  let boundingSphere = BoundingSphere.fromPoints(positions, new BoundingSphere())
  return boundingSphere.center
}

/**
 * 计算多边形面积
 * @param {Cartesians3[]} positions
 */
function computePolygonArea (positions) {
  let ploygon = positions.map(cartesian => {
    let {longitude, latitude} = Cartographic.fromCartesian(cartesian)
    return [CesiumMath.toDegrees(longitude), CesiumMath.toDegrees(latitude)]
  })
  return turf.area(turf.polygon([ploygon]))
}

/**
 * 创建多边形面积显示Label
 * @param {PositionProperty | Cartesian3} position
 * @param {Property | string} text
 * @param {Property | boolean} show
 */
function createLabel (position, text, show) {
  return new Entity({
    position,
    label: {
      text,
      font: '12px sans-serif',
      showBackground: true,
      backgroundColor: Color.BLACK,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      show
    }
  })
}

/**
 * 创建点
 * @param {Cartesian3[]} position
 */
function createPoint (position) {
  return new Entity({
    position,
    point: {
      pixelSize: 5,
      outlineWidth: 1,
      outlineColor: Color.YELLOW.withAlpha(0.6),
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    }
  })
}
class AreaMeasure extends MouseEvent {
  constructor (viewer) {
    super(viewer.scene)
    this.viewer = viewer
    this._polygonPositions = []
    this._mousePosition = null
    this._polygonCenter = null
    this._polygonArea = 0
    let polygon = this.createEmptyPolygon()
    let areaLabel = this.createPolygonAreaLabel()
    this.viewer.entityManager.add(polygon, CACHE_NAME)
    this.viewer.entityManager.add(areaLabel, CACHE_NAME)
  }

  /**
   * 获取多边形的点
   */
  get polygonPositions () {
    let position = this._polygonPositions
    if (this._mousePosition) {
      position = position.concat(this._mousePosition)
    }
    if (position.length > 0) {
      position = position.concat(position[0])
    }
    return position
  }

  /**
   * 获取组成多边形点的数量
   */
  get positionsNumber () {
    return this.polygonPositions.length
  }

  /**
   * 多边形顶点数量
   */
  get vertexNumber () {
    return this.positionsNumber - 1
  }

  /**
   * 获取已经添加到地图上的点的数量
   */
  get addedVertexNumber () {
    return this._polygonPositions.length
  }

  /**
   * 设置多边形中心
   */
  set polygonCenter (center) {
    this._polygonCenter = center
  }

  /**
   * 获取多边形中心
   */
  get polygonCenter () {
    return this._polygonCenter
  }

  /**
   * 设置多边形面积
   */
  set polygonArea (area) {
    this._polygonArea = area
  }

  /**
   * 多边形面积
   */
  get polygonArea () {
    return this._polygonArea
  }

  get polygonAreaText () {
    return `面积：${this._polygonArea.toFixed(2)}平方米`
  }

  /**
   * 设置当前鼠标点
   */
  set mousePosition (mousePosition) {
    this._mousePosition = mousePosition
    if (this.vertexNumber >= 3) {
      this.polygonCenter = getPolygonCenter(this.polygonPositions)
      this.polygonArea = computePolygonArea(this.polygonPositions)
    }
  }

  /**
   * 添加多边形组成点
   * @param {*} position
   */
  addPosition (position) {
    this._polygonPositions.push(position)
    let vertex = createPoint(position)
    this.viewer.entityManager.add(vertex, CACHE_NAME)
    if (this.vertexNumber >= 3) {
      this.polygonCenter = getPolygonCenter(this.polygonPositions)
      this.polygonArea = computePolygonArea(this.polygonPositions)
    }
  }

  // =========================================================
  // 创建Entity
  // =========================================================

  /**
   * 创建多边形
   */
  createEmptyPolygon () {
    let that = this
    return new Entity({
      polygon: {
        hierarchy: new CallbackProperty(() => {
          return {
            positions: that.polygonPositions
          }
        }, false),
        material: Color.fromCssColorString('white').withAlpha(0.6),
        // outline: true,
        // outlineColor: Color.YELLOW,
        // outlineWidth: 4,
        // perPositionHeight: true,
        closeTop: false,
        closeBottom: false
      },
      polyline: {
        positions: new CallbackProperty(() => {
          return that.polygonPositions
        }, false),
        material: Color.YELLOW,
        clampToGround: true,
        width: 2
      }
    })
  }

  /**
   * 创建多边形面积显示Label
   */
  createPolygonAreaLabel () {
    let that = this
    let position = new CallbackProperty(() => {
      return that.polygonCenter
    }, false)
    let text = new CallbackProperty(() => {
      return that.polygonAreaText
    }, false)
    let show = new CallbackProperty(() => {
      return that.vertexNumber >= 3
    }, false)
    return createLabel(position, text, show)
  }

  // ==========================================
  // 鼠标事件
  // ==========================================

  onLeftClick (event) {
    let {position} = event
    let cartesian = this.scene.pickPosition(position)
    if (defined(cartesian)) {
      this.addPosition(cartesian)
      if (this.addedVertexNumber > 2) {
        changeEvent.raiseEvent(true)
      }
    }
  }

  onMouseMove (event) {
    let {endPosition} = event
    let cartesian = this.scene.pickPosition(endPosition)
    if (defined(cartesian)) {
      if (this.positionsNumber > 0) {
        this.mousePosition = cartesian
      }
    }
  }

  onRightClick (event) {
    if (this.addedVertexNumber >= 3) {
      super.removeLeftClick()
      super.removeMouseMove()
      super.removeRightClick()
      this.mousePosition = null
    }
  }

  addChangeEvent (listener, scope) {
    eventHelper.add(changeEvent, listener, scope)
  }

  /**
   * 保存测量数据
   */
  saveMeasure () {
    let id = createGuid()
    let createTime = new Date().toISOString()
    let {polygonPositions, polygonArea, polygonCenter} = this
    let data = {id, title: '', positions: polygonPositions, createTime, area: polygonArea, center: polygonCenter}
    return CACHE.put(id, data).then(() => {
      return data
    })
  }

  destroy () {
    super.destroy()
    this.viewer.entityManager.removeByGroupId(CACHE_NAME)
  }

  static start (viewer) {
    return new AreaMeasure(viewer)
  }

  /**
   * 获取历史数据
   */
  static getMeasureHistory () {
    return CACHE.getAll()
  }

  static viewAreaMeasure (viewer, polygonData) {
    let {id, title, positions, createTime, area, center} = polygonData
    let polygon = new Entity({
      polygon: {
        hierarchy: {
          positions: positions
        },
        material: Color.WHITE.withAlpha(0.6),
        // outline: true,
        // outlineColor: Color.YELLOW,
        // outlineWidth: 4,
        // perPositionHeight: true,
        closeTop: false,
        closeBottom: false
      },
      polyline: {
        positions: positions,
        material: Color.YELLOW,
        clampToGround: true,
        width: 2
      }
    })
    viewer.entityManager.add(polygon, id)
    let label = createLabel(center, `面积：${area.toFixed(3)}平方米`, true)
    viewer.entityManager.add(label, id)
    viewer.flyTo(polygon)
  }

  /**
   * 删除测量历史
   * @param {String} id
   */
  static deleteMeasure (id) {
    return CACHE.evict(id)
  }

  /**
   * 移除显示在地图上的测量
   * @param {Viewer} viewer
   * @param {String} id
   */
  static removeAreaMeasure (viewer, id) {
    viewer.entityManager.removeByGroupId(id)
  }
}

export default AreaMeasure
