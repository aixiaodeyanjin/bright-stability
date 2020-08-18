import * as Cesium from 'cesium'
import CesiumViewerBuilder from './CesiumViewerBuilder'
import CesiumNavigation from 'cesium-navigation-es6'
import ShowPosition from './ShowPosition'
import loadBuildingInfo from './loader/BuildingLoader'
class CesiumViewerFactory {
    static defaultMap = null;
    static getDefaultMap (domId) {
      return (CesiumViewerFactory.defaultMap = CesiumViewerBuilder.ofContainer(
        domId
      )
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
        .imageryProvider(
          new Cesium.UrlTemplateImageryProvider({
            url: 'http://{s}.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali',
            minimumLevel: 1,
            maximumLevel: 25,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
          })
        )
        // .addBuildAfter(viewer => {
        //   let infoBox = viewer.infoBox._element
        //   infoBox.style.right = 'unset'
        //   infoBox.style.left = '430px'
        // })
        .addBuildAfter(viewer => {
          viewer.imageryLayers.addImageryProvider(
            new Cesium.WebMapTileServiceImageryProvider({
              id: 'tiandiImage',
              name: '天地标记图',
              url: 'http://{s}.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=e6e38c252d7f2463c8d11d6cf511d02f',
              layer: 'tdtImgAnnoLayer',
              style: 'default',
              format: 'image/jpeg',
              tileMatrixSetID: 'GoogleMapsCompatible',
              show: false,
              subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']
            })
          )
        })
        .addBuildAfter(viewer => {
          var palaceTileset = new Cesium.Cesium3DTileset({
            url: '/xlgc/data/Scene/3dtile.json',
            maximumScreenSpaceError: 0,
            // maximumMemoryUsage: Number.MAX_SAFE_INTEGER,
            // preferLeaves: true,
            modelMatrix: Cesium.Matrix4.fromTranslation(Cesium.Cartesian3.fromArray([8, -7, -16]))
          })
          viewer.scene.primitives.add(palaceTileset)
          viewer.flyTo(palaceTileset)
        })
        .addBuildAfter(viewer => {
          var options = {}
          // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和Cesium.Rectangle.
          options.defaultResetView = Cesium.Cartographic.fromDegrees(118.90684315,
            32.05823868,
            1200)
          // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
          options.enableCompass = true
          // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件 将不会添加到地图中。
          options.enableZoomControls = true
          // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
          options.enableDistanceLegend = true
          // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
          options.enableCompassOuterRing = true
          CesiumNavigation(viewer, options)
          ShowPosition(viewer, Cesium, 'cesiumContainer')
        })
        .addBuildAfter(viewer => {
          viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1
          viewer.scene.screenSpaceCameraController.maximumZoomDistance = 30000000
        })
        .addBuildAfter(loadBuildingInfo)
        .build())
    }
}
export default CesiumViewerFactory
