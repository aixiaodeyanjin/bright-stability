import { CallbackProperty, Color, defined, Entity, Event, EventHelper, JulianDate } from 'cesium';
import MouseEvent from './MouseEvent';

const CACHE_NAME = 'FloodAnalyze';
/**
 * 创建点
 * @param {Cartesian3[]} position
 */
function createPoint(position) {
  return new Entity({
    position,
    point: {
      pixelSize: 5,
      outlineWidth: 1,
      outlineColor: Color.YELLOW.withAlpha(0.6),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
}
const eventHelper = new EventHelper();
const drawOverEvent = new Event();
class FloodAnalyze extends MouseEvent {
  constructor(viewer) {
    super(viewer.scene);
    this.viewer = viewer;
    this._polygonPositions = [];
    this._mousePosition = null;
    let polygon = this.createEmptyPolygon();
    this.viewer.entityManager.add(polygon, CACHE_NAME);
  }

  /**
   * 获取多边形的点
   */
  get polygonPositions() {
    let position = this._polygonPositions;
    if (this._mousePosition) {
      position = position.concat(this._mousePosition);
    }
    if (position.length > 0) {
      position = position.concat(position[0]);
    }
    return position;
  }

  /**
   * 获取组成多边形点的数量
   */
  get positionsNumber() {
    return this.polygonPositions.length;
  }

  /**
   * 多边形顶点数量
   */
  get vertexNumber() {
    return this.positionsNumber - 1;
  }

  /**
   * 获取已经添加到地图上的点的数量
   */
  get addedVertexNumber() {
    return this._polygonPositions.length;
  }

  /**
   * 设置当前鼠标点
   */
  set mousePosition(mousePosition) {
    this._mousePosition = mousePosition;
  }

  /**
   * 添加多边形组成点
   * @param {*} position
   */
  addPosition(position) {
    this._polygonPositions.push(position);
    let vertex = createPoint(position);
    this.viewer.entityManager.add(vertex, CACHE_NAME);
  }

  // =========================================================
  // 创建Entity
  // =========================================================

  /**
   * 创建多边形
   */
  createEmptyPolygon() {
    let that = this;
    return new Entity({
      polygon: {
        hierarchy: new CallbackProperty(() => {
          return {
            positions: that.polygonPositions,
          };
        }, false),
        material: Color.fromCssColorString('white').withAlpha(0.6),
        // outline: true,
        // outlineColor: Color.YELLOW,
        // outlineWidth: 4,
        // perPositionHeight: true,
        closeTop: false,
        closeBottom: false,
      },
      polyline: {
        positions: new CallbackProperty(() => {
          return that.polygonPositions;
        }, false),
        material: Color.YELLOW,
        clampToGround: true,
        width: 2,
      },
    });
  }

  /**
   * 绘制完成事件
   * @param {*} listener
   */
  addDrawOverHandler(listener, scope) {
    eventHelper.add(drawOverEvent, listener, scope);
  }

  // ==========================================
  // 鼠标事件
  // ==========================================

  onLeftClick(event) {
    let { position } = event;
    let cartesian = this.scene.pickPosition(position);
    if (defined(cartesian)) {
      this.addPosition(cartesian);
    }
  }

  onMouseMove(event) {
    let { endPosition } = event;
    let cartesian = this.scene.pickPosition(endPosition);
    if (defined(cartesian)) {
      if (this.positionsNumber > 0) {
        this.mousePosition = cartesian;
      }
    }
  }

  onRightClick(event) {
    if (this.addedVertexNumber >= 3) {
      super.removeLeftClick();
      super.removeMouseMove();
      super.removeRightClick();
      this.mousePosition = null;
      drawOverEvent.raiseEvent();
    }
  }

  doAnalyze(vm) {
    this.viewer.entityManager.removeByGroupId('showFloodAnalyze');
    let startTime = null;
    let that = vm;
    let height = parseFloat(that.minHeight);
    let water = {
      polygon: {
        hierarchy: this.polygonPositions,
        perPositionHeight: true,
        extrudedHeight: new CallbackProperty((time, result) => {
          if (height < parseFloat(that.maxHeight)) {
            let duration = JulianDate.secondsDifference(time, startTime || (startTime = time));
            height = parseFloat(that.speed) * duration + parseFloat(that.minHeight);
          }
          that.currHeight = parseInt(height.toFixed(0));
          return height;
        }, false),
        material: Color.fromBytes(64, 157, 253, 150),
      },
    };
    this.viewer.entityManager.add(water, 'showFloodAnalyze');
  }

  destroy() {
    super.destroy();
    eventHelper.removeAll();
    this.viewer.entityManager.removeByGroupId('showFloodAnalyze');
    this.viewer.entityManager.removeByGroupId(CACHE_NAME);
  }
}
export default FloodAnalyze;
