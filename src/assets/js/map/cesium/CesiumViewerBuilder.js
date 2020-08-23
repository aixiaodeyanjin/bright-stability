import * as Cesium from 'cesium'
// Cesium.Ion.defaultAccessToken =
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYTAwMTYzZi1kOGFjLTQyMDQtYjI0Ny03MWQ5ZTM1OGE2NjYiLCJpZCI6Nzc4Niwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1MDQ3NDQ4OX0.LRLrZO7tSId3sR7xYPOxkS1ODfaQuyQygD9mwWQ1TGQ';
const hideCredit = viewer =>
  (viewer._cesiumWidget._creditContainer.style.display = 'none')
/**
 * Cesium.Viewer 默认配置
 */
const OPTIONS = {
  animation: true,
  baseLayerPicker: true,
  fullscreenButton: true,
  vrButton: true,
  geocoder: true,
  homeButton: true,
  infoBox: true,
  sceneModePicker: true,
  selectionIndicator: true,
  timeline: true,
  navigationHelpButton: true,
  navigationInstructionsInitiallyVisible: true,
  scene3DOnly: false,
  shouldAnimate: false,
  clockViewModel: null,
  selectedImageryProviderViewModel: null,
  imageryProviderViewModels: null,
  selectedTerrainProviderViewModel: null,
  terrainProviderViewModels: null,
  imageryProvider: null,
  terrainProvider: null,
  skyBox: null,
  skyAtmosphere: null,
  fullscreenElement: null,
  useDefaultRenderLoop: true,
  targetFrameRate: null,
  showRenderLoopErrors: true,
  useBrowserRecommendedResolution: true,
  contextOptions: null,
  sceneMode: Cesium.SceneMode.SCENE3D,
  mapProjection: new Cesium.GeographicProjection(),
  globe: null,
  orderIndependentTranslucency: true,
  creditContainer: null,
  creditViewport: null,
  dataSources: null,
  terrainExaggeration: 1.0,
  shadows: false,
  terrainShadows: Cesium.ShadowMode.RECEIVE_ONLY,
  mapMode2D: Cesium.MapMode2D.INFINITE_SCROLL,
  projectionPicker: false,
  requestRenderMode: false,
  maximumRenderTimeChange: 0.0
}
/**
 * Cesium.Viewer 构建器
 */
class CesiumViewerBuilder {
    static defaultOptions = OPTIONS;
    constructor (container, userOptions = {}) {
      this.container = container
      this.userOptions = userOptions || {}
      this.buildAfter = new Set()
    }

    /**
     * 指定地图容器
     * @param {String | Element} container
     */
    static ofContainer (container) {
      return new CesiumViewerBuilder(container)
    }

    /**
     * 是否显示时间轴控件
     * 指示当前时间，并允许用户跳至特定时间。
     * @param {Boolean} timeline
     */
    timeline (timeline) {
      this.userOptions.timeline = timeline
      return this
    }

    /**
     * 是否显示动画控件
     * 控制视图动画的播放速度。
     * @param {Boolean} animation
     */
    animation (animation) {
      this.userOptions.animation = animation
      return this
    }

    /**
     * 是否显示默认视图控件
     * 将查看器带回到默认视图。
     * @param {Boolean} homeButton
     */
    homeButton (homeButton) {
      this.userOptions.homeButton = homeButton
      return this
    }

    /**
     * VR按钮
     * @param {Boolean} vrButton
     */
    vrButton (vrButton) {
      this.userOptions.vrButton = vrButton
      return this
    }

    /**
     * 是否显示搜索控件
     *  一种位置搜索工具，可将相机带到查询的位置。默认情况下使用Bing Maps数据。
     * @param {Boolean} geocoder
     */
    geocoder (geocoder) {
      this.userOptions.geocoder = geocoder
      return this
    }

    shouldAnimate (shouldAnimate) {
      this.userOptions.shouldAnimate = shouldAnimate
      return this
    }

    /**
     * 是否显示地图模式切换控件
     * 在3D，2D和Columbus View（CV）模式之间切换。
     * @param {Boolean} sceneModePicker
     */
    sceneModePicker (sceneModePicker) {
      this.userOptions.sceneModePicker = sceneModePicker
      return this
    }

    /**
     * 是否显示图层选择控件
     * 选择要在地球上显示的图像和地形
     * @param {Boolean} baseLayerPicker
     */
    baseLayerPicker (baseLayerPicker) {
      this.userOptions.baseLayerPicker = baseLayerPicker
      return this
    }

    /**
     * 是否显示帮助控件
     * @param {Boolean} navigationHelpButton
     */
    navigationHelpButton (navigationHelpButton) {
      this.userOptions.navigationHelpButton = navigationHelpButton
      return this
    }

    /**
     * 是否显示全屏控件
     * @param {Boolean} fullscreenButton
     */
    fullscreenButton (fullscreenButton) {
      this.userOptions.fullscreenButton = fullscreenButton
      return this
    }

    /**
     * 图层影像
     * @param {ImageryProvider} imageryProvider
     */
    imageryProvider (imageryProvider) {
      this.userOptions.imageryProvider = imageryProvider
      return this
    }

    /**
     * 地形
     * @param {terrainProvider} terrainProvider
     */
    terrainProvider (terrainProvider) {
      this.userOptions.terrainProvider = terrainProvider
      return this
    }

    /**
     * 隐藏版权控件
     */
    hideCredit () {
      this.addBuildAfter(hideCredit)
      return this
    }

    /**
     * 提示窗
     * @param {*} enable
     */
    infoBox (enable) {
      this.userOptions.infoBox = enable
      return this
    }

    /**
     * 获取配置
     */
    getOptions () {
      let opts = Object.assign(
        {},
        CesiumViewerBuilder.defaultOptions,
        this.userOptions
      )
      return Object.keys(opts).reduce((pre, k) => {
        let v = opts[k]
        if (v !== undefined && v !== null) {
          pre[k] = v
        }
        return pre
      }, {})
    }

    /**
     * 构建完成后操作
     * @param {Function} builAfter
     */
    addBuildAfter (builAfter) {
      if (typeof builAfter == 'function') this.buildAfter.add(builAfter)
      return this
    }

    build () {
      let viewer = new Cesium.Viewer(this.container, this.getOptions())
      this.buildAfter.forEach(config => config(viewer))
      return viewer
    }
}
export default CesiumViewerBuilder
