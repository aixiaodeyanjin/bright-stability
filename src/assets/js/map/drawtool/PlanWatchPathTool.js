import { MapContextHolder } from '../index'
import { Entity, EntityCollection, ScreenSpaceEventHandler, ScreenSpaceEventType, CallbackProperty, EventHelper, Cartographic, Event, HorizontalOrigin, VerticalOrigin, Cartesian2, LabelStyle, Color, Cartesian3 } from 'cesium'
const PLAN_WATCH_PATH_GROUP_ID = 'PALAN_PATH'
export default class PlanWatchPathTool {
  constructor () {
    this.viewer = MapContextHolder.getMap()

    const positions = (this.positions = [])
    const currMousePosition = (this.currMousePosition = null)

    this.watchPath = new Entity({
      id: 'planWatch',
      polyline: {
        positions: new CallbackProperty(() => {
          return currMousePosition ? [positions, currMousePosition] : positions
        }, false),
        width: 4
      }
    })

    this.viewer.then(viewer => {
      viewer.entityManager.add(this.watchPath, PLAN_WATCH_PATH_GROUP_ID)
    })
    this.initMouseHandler(this.onMouseLeftClick, this.onMouseMove, this.onMouseRightClick)

    this.getPositionByIndex = function (index) {
      return positions[index]
    }

    this.event = new Event()
    this.eventHelper = new EventHelper()
  }

  initMouseHandler (leftclick, move, rightclick) {
    const that = this
    this.viewer.then(viewer => {
      that.handler = new ScreenSpaceEventHandler(viewer.scene.canvas)
      that.handler.setInputAction(leftclick.bind(that), ScreenSpaceEventType.LEFT_CLICK)
      that.handler.setInputAction(move.bind(that), ScreenSpaceEventType.MOUSE_MOVE)
      that.handler.setInputAction(rightclick.bind(that), ScreenSpaceEventType.RIGHT_CLICK)
    })
  }

  onMouseLeftClick (e) {
    const that = this
    this.viewer.then(viewer => {
      const scene = viewer.scene
      var cartesian = scene.camera.pickEllipsoid(e.position, scene.globe.ellipsoid)
      // if(positions.length == 0) {
      //     positions.push(cartesian.clone());
      // }
      debugger
      let height = scene.clampToHeight(cartesian)
      if (height) {
        cartesian = height
      }
      // let a = Cartographic.fromCartesian(cartesian)
      // let b = Cartographic.fromCartesian(height)
      that.positions.push(cartesian)
      let coord = Cartographic.fromCartesian(cartesian)
      this.addMarker(cartesian, coord.height)
      that.event.raiseEvent(that.positions, coord)
    })
  }

  addMarker (position, coord) {
    let {height} = Cartographic.fromCartesian(position)
    this.viewer.then(viewer => viewer.entityManager.add({
      position,
      parent: this.watchPath,
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
    }, PLAN_WATCH_PATH_GROUP_ID))
  }

  onMouseMove (e) {
    //
  }

  onMouseRightClick (e) {
    this.destroy()
  }

  addLastPositionChangedListener (listener) {
    return this.eventHelper.add(this.event, listener, this)
  }

  modifyPosition (index, pos) {
    this.positions[index] = pos
  }

  destroy () {
    this.viewer.then(viewer => { viewer.entityManager.removeByGroupId(PLAN_WATCH_PATH_GROUP_ID) })
    this.handler && this.handler.destroy()
  }
}
