// @author pon
function ShowPosition(viewer, Cesium, cesiumContainer) {
  // 判断viewer是否存在
  if (!Cesium.defined(viewer)) {
    throw new Cesium.DeveloperError('viewer is required!');
  }

  // 创建显示条
  createPositionBar(cesiumContainer);
  var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  // 触发坐标显示
  var cartesian = null;
  var ellipsoid = viewer.scene.globe.ellipsoid;
  var longitudeString = document.getElementById('lon');
  var latitudeString = document.getElementById('lat');
  var height = document.getElementById('heg');
  // 定义当前场景的画布元素的事件处理

  handler.setInputAction(function (movement) {
    // 通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
    cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
    if (cartesian) {
      // 将笛卡尔坐标转换为地理坐标
      var cartographic = ellipsoid.cartesianToCartographic(cartesian);
      // 将弧度转为度的十进制度表示
      longitudeString.innerText = '经度：' + Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);
      latitudeString.innerText = '纬度：' + Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);
      // 获取相机高度
      height.innerText = '镜头高度：' + Math.ceil(viewer.camera.positionCartographic.height).toString() + '米';
    } else {
      longitudeString.innerText = '';
      latitudeString.innerText = '';
      height.innerText = '';
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 设置鼠标滚动事件的处理函数，这里负责监听高度值变化
  handler.setInputAction(function (wheelment) {
    if (cartesian) {
      var cartographic = ellipsoid.cartesianToCartographic(cartesian);
      height.innerText = '镜头高度：' + Math.ceil(viewer.camera.positionCartographic.height) + '米';
      longitudeString.innerText = '经度：' + Cesium.Math.toDegrees(cartographic.longitude);
      latitudeString.innerText = '纬度：' + Cesium.Math.toDegrees(cartographic.latitude);
    }
  }, Cesium.ScreenSpaceEventType.WHEEL);
}

function createPositionBar(cesiumContainer) {
  let CesiumBottomBar = document.createElement('div');
  CesiumBottomBar.id = 'coordinates';
  let CesiumBottomStyle = 'position: absolute; bottom: 0px;z-index:1000;opacity: 1;width: 100%;right: 0px;height: 24.3px;' + 'display: block;padding: 2px;background: rgba(0,0,0,.5);';
  CesiumBottomBar.style.cssText = CesiumBottomStyle;

  let PositionDiv = document.createElement('div');
  let PositionDivStyle = 'text-align:right';
  PositionDiv.style.cssText = PositionDivStyle;
  let LonLable = document.createElement('label');
  let LatLable = document.createElement('label');
  let HegLable = document.createElement('label');
  LonLable.id = 'lon';
  LatLable.id = 'lat';
  HegLable.id = 'heg';

  let lableStyle = 'color: #FFFFFF; font-family: cursive;font-size: 12px;margin:5px';
  LonLable.style.cssText = lableStyle;
  LatLable.style.cssText = lableStyle;
  HegLable.style.cssText = lableStyle;

  PositionDiv.appendChild(LonLable);
  PositionDiv.appendChild(LatLable);
  PositionDiv.appendChild(HegLable);
  CesiumBottomBar.appendChild(PositionDiv);

  // let CesiumContrainer = document.getElementById(cesiumContainer);
  cesiumContainer.append(CesiumBottomBar);
}

export default ShowPosition;
