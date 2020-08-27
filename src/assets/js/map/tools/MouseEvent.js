import {ScreenSpaceEventHandler, ScreenSpaceEventType, destroyObject} from 'cesium'
/**
 * 鼠标事件
 */
class MouseEvent {
  constructor (scene) {
    this.scene = scene
    this.handler = new ScreenSpaceEventHandler(scene.canvas)
    this.handler.setInputAction(this.onLeftClick.bind(this), ScreenSpaceEventType.LEFT_CLICK)
    this.handler.setInputAction(this.onMouseMove.bind(this), ScreenSpaceEventType.MOUSE_MOVE)
    this.handler.setInputAction(this.onRightClick.bind(this), ScreenSpaceEventType.RIGHT_CLICK)
  }

  /**
   * 左键点击事件
   * @param {*} event
   */
  onLeftClick (event) {

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

  removeLeftClick () {
    this.handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK)
  }

  removeMouseMove () {
    this.handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE)
  }

  removeRightClick () {
    this.handler.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK)
  }

  destroy () {
    this.handler.destroy()
    destroyObject(this)
  }
}

export default MouseEvent
