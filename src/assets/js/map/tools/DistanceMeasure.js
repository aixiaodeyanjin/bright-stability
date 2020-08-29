import { destroyObject, PinBuilder, Entity, CallbackProperty, defined, Cartesian3, VerticalOrigin, Color, EventHelper, Event, createGuid, HeadingPitchRange, Math as CesiumMath } from 'cesium';
import MouseEvent from './MouseEvent';
import CacheManagerFactory from '../../cache/CacheManagerFactory';
/**
 * cesium距离测量
 */
const PIN_BUILDER = new PinBuilder();
const CACHE_NAME = 'distance-measure';
const CACHE = CacheManagerFactory.getDefaultCacheManager().getCache(CACHE_NAME);
const eventHelper = new EventHelper();
const changeEvent = new Event();

function buildMarker(cartesian, seq) {
  return new Entity({
    position: cartesian,
    billboard: {
      image: PIN_BUILDER.fromText(seq, Color.BLACK, 48).toDataURL(),
      width: 35,
      height: 35,
      verticalOrigin: VerticalOrigin.BOTTOM,
      eyeOffset: Cartesian3.fromElements(0, 0, -5),
      disableDepthTestDistance: 0,
    },
  });
}
function buildLabel(cartesian, distance) {
  return new Entity({
    position: cartesian,
    label: {
      text: `${distance.toFixed(2)}米`,
      font: '12px sans-serif',
      showBackground: true,
      backgroundColor: Color.BLACK,
      eyeOffset: Cartesian3.fromElements(0, 0, -5),
    },
  });
}
class DistanceMeasure extends MouseEvent {
  constructor(viewer) {
    super(viewer.scene);
    this.viewer = viewer;
    this.positions = [];
    this.labels = [];
    this.totalDistance = 0;
    this.init();
  }

  init() {
    this.createPolyline();
  }

  createPolyline() {
    let that = this;
    let polyline = new Entity({
      polyline: {
        positions: new CallbackProperty(() => {
          return that.positions;
        }, false),
        width: 2,
        clampToGround: true,
      },
    });
    this.viewer.entityManager.add(polyline, CACHE_NAME);
  }

  addChangeEvent(listener, scope) {
    eventHelper.add(changeEvent, listener, scope);
  }

  /**
   * 左键点击事件
   * @param {*} event
   */
  onLeftClick(event) {
    let { position } = event;
    let cartesian = this.scene.pickPosition(position);
    if (defined(cartesian)) {
      this.positions.push(cartesian);
      let length = this.positions.length;
      this.pinPosition(cartesian, length); // 添加marker
      if (length > 1) {
        let prePosition = this.positions[length - 2];
        let midpoint = Cartesian3.midpoint(prePosition, cartesian, new Cartesian3());
        let distance = Cartesian3.distance(prePosition, cartesian);
        this.totalDistance += distance;
        this.labels.push({ position: midpoint, distance });
        this.showDistanceTextLabel(midpoint, distance);
        changeEvent.raiseEvent(true);
      }
    }
  }

  /**
   * 添加marker
   */
  pinPosition(position, seq) {
    this.viewer.entityManager.add(buildMarker(position, seq), CACHE_NAME);
  }

  /**
   * 显示距离
   */
  showDistanceTextLabel(cartesian, distance) {
    this.viewer.entityManager.add(buildLabel(cartesian, distance), CACHE_NAME);
  }

  /**
   * 鼠标移动世界
   * @param {*} event
   */
  onMouseMove(event) {}

  /**
   * 右键点击事件
   * @param {*} event
   */
  onRightClick(event) {}

  /**
   * 保存测量
   */
  saveMeasure() {
    let id = createGuid();
    let createTime = new Date().toISOString();
    let data = {
      id,
      title: '',
      positions: this.positions,
      createTime,
      totalDistance: this.totalDistance,
      labels: this.labels,
    };
    return CACHE.put(id, data).then(() => {
      return data;
    });
  }

  destroy() {
    super.destroy();
    eventHelper.removeAll();
    this.viewer.entityManager.removeByGroupId(CACHE_NAME);
    destroyObject(this);
  }

  static start(viewer) {
    return new DistanceMeasure(viewer);
  }

  /**
   * 删除测量历史
   * @param {*} id
   */
  static deleteMeasure(id) {
    return CACHE.evict(id);
  }

  /**
   * 测量历史
   */
  static getMeasureHistory() {
    return CACHE.getAll();
  }

  /**
   * 地图上移除测量历史
   * @param {*} id
   */
  static removeDistanceMeasure(viewer, id) {
    viewer.entityManager.removeByGroupId(id);
  }

  /**
   * 查看测量历史
   * @param {*} viewer
   * @param {*} distance
   */
  static viewDistanceMeasure(viewer, distance) {
    let { positions, id, labels } = distance;
    labels.forEach(({ distance, position }) => {
      let label = new Entity({
        position: position,
        label: {
          text: `${parseFloat(distance).toFixed(2)}米`,
          font: '12px sans-serif',
          showBackground: true,
          backgroundColor: Color.BLACK,
          eyeOffset: Cartesian3.fromElements(0, 0, -5),
        },
      });
      viewer.entityManager.add(label, id);
    });

    let polyline = new Entity({
      id: id,
      polyline: {
        positions: positions,
        width: 2,
        clampToGround: true,
        material: Color.YELLOW,
      },
    });
    viewer.entityManager.add(polyline, id);

    let points = positions.map((position) => {
      let point = new Entity({
        position: position,
        point: {
          pixelSize: 3,
          outlineWidth: 2,
        },
      });
      return viewer.entityManager.add(point, id);
    });
    viewer.flyTo(points, {
      offset: new HeadingPitchRange(0, CesiumMath.toRadians(-90), 0),
    });
  }
}

export default DistanceMeasure;
