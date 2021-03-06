import * as Cesium from 'cesium';
import CesiumViewerBuilder from './CesiumViewerBuilder';
import CesiumNavigation from 'cesium-navigation-es6';
import ShowPosition from './ShowPosition';
import loadBuildingInfo from '../loader/BuildingLoader';
import EntityManager from './EntityManager';
class CesiumViewerFactory {
  static defaultMap = null;
  static getDefaultMap(domId) {
    return (CesiumViewerFactory.defaultMap = CesiumViewerBuilder.ofContainer(domId)
      .timeline(false)
      .animation(false)
      .homeButton(false)
      .geocoder(false)
      .sceneModePicker(false)
      .baseLayerPicker(false)
      .navigationHelpButton(false)
      .fullscreenButton(false)
      .vrButton(false)
      .hideCredit()
      .infoBox(false)
      .scene3DOnly(true)
      .shouldAnimate(true)
      .selectionIndicator(false)
      .terrainProvider(
        Cesium.createWorldTerrain({
          // requestVertexNormals: true
          // requestWaterMask: true
        }),
      )
      .imageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: 'http://{s}.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali',
          minimumLevel: 1,
          maximumLevel: 22,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }),
      )
      // .addBuildAfter(viewer => {
      //   let infoBox = viewer.infoBox._element
      //   infoBox.style.right = 'unset'
      //   infoBox.style.left = '430px'
      // })
      .addBuildAfter((viewer) => {
        viewer.imageryLayers.addImageryProvider(
          new Cesium.WebMapTileServiceImageryProvider({
            id: 'tiandiImage',
            name: '天地标记图',
            url:
              'http://{s}.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=e6e38c252d7f2463c8d11d6cf511d02f',
            layer: 'tdtImgAnnoLayer',
            style: 'default',
            format: 'image/jpeg',
            tileMatrixSetID: 'GoogleMapsCompatible',
            show: false,
            maximumLevel: 26,
            subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
          }),
        );
      })
      .addBuildAfter((viewer) => {
        window.viewer = viewer;
        var palaceTileset = new Cesium.Cesium3DTileset({
          url: '/xlgc/data/Scene/3dtile.json',
          maximumScreenSpaceError: 1,
          maximumMemoryUsage: 512,
          preferLeaves: true,
          modelMatrix: Cesium.Matrix4.fromTranslation(Cesium.Cartesian3.fromArray([-5, 12, 3])),
        });
        viewer.scene.primitives.add(palaceTileset);
        let remove = viewer.scene.globe.tileLoadProgressEvent.addEventListener((length) => {
          if (length == 0) {
            remove();
            loadBuildingInfo(viewer);
            viewer.camera.flyTo({
              destination: { x: -2615523.4734339523, y: 4736815.366448046, z: 3365604.50744894 },
              duration: 4,
              orientation: {
                direction: { x: 0.468954950074849, y: -0.6712345816078462, z: 0.5740430221281638 },
                up: { x: -0.1613287055209825, y: 0.4183191675331538, z: 0.8938579992645888 },
              },
            });
          }
        });
      })
      .addBuildAfter((viewer) => {
        var options = {};
        // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和Cesium.Rectangle.
        options.defaultResetView = Cesium.Cartographic.fromDegrees(118.90684315, 32.05823868, 1200);
        // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
        options.enableCompass = true;
        // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件 将不会添加到地图中。
        options.enableZoomControls = true;
        // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
        options.enableDistanceLegend = true;
        // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
        options.enableCompassOuterRing = true;
        CesiumNavigation(viewer, options);
        ShowPosition(viewer, Cesium, viewer.cesiumWidget.container);
      })
      .addBuildAfter((viewer) => {
        // viewer.scene.globe.enableLighting = true
        viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1;
        viewer.scene.screenSpaceCameraController.maximumZoomDistance = 30000000;
        viewer.scene.globe.depthTestAgainstTerrain = true;
        // viewer.resolutionScale = viewer.useBrowserRecommendedResolution
      })
      // .addBuildAfter(loadBuildingInfo)
      .addBuildAfter((viewer) => {
        viewer.entityManager = new EntityManager(viewer);
      })
      .build());
  }
}
export default CesiumViewerFactory;
