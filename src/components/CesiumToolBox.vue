<template>
  <div class="cesium-tool">
    <div class="btn-group">
      <a class="tool-btn" href="javascript:void(0);" @click="isToolboxShow = !isToolboxShow"></a>
    </div>
    <transition name="tool-box">
      <div class="tool-box" v-show="isToolboxShow">
        <div class="tab">
          <a class="icon-people" :class="{active : currentTabContent == 'stroller'}" href="javascript:void(0);" @click="currentTabContent = 'stroller'">漫步</a>
          <a class="icon-video" :class="{active : currentTabContent == 'videoWall'}" href="javascript:void(0);" @click="currentTabContent = 'videoWall'">视频墙</a>
          <a class="icon-measure" :class="{active : currentTabContent == 'measure'}" href="javascript:void(0);" @click="currentTabContent = 'measure'">量算</a>
          <a class="icon-sun" :class="{active : currentTabContent == 'sunAnalyze'}" href="javascript:void(0);" @click="currentTabContent = 'sunAnalyze'">光照分析</a>
          <a class="icon-flood" :class="{active : currentTabContent == 'floodAnalyze'}" href="javascript:void(0);" @click="currentTabContent = 'floodAnalyze'">淹没分析</a>
        </div>

        <div class="tab-context">
          <keep-alive>
            <component :is="currentTabContent"></component>
          </keep-alive>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import '@/assets/css/cesium-tool.css'
import { Measure } from '@/assets/js/map/tools'
import { Math as CesiumMath, Cartesian3, Cartographic, defined, Transforms, Matrix4, Matrix3, createGuid, HeadingPitchRange, Entity, Color } from 'cesium'
import { MapContextHolder } from '@/assets/js/map/index'
import CacheManagerFactory from '@/assets/js/cache/CacheManagerFactory'
const cacheManager = CacheManagerFactory.getDefaultCacheManager()
const Stroller = () => import('./cesium-tools/Stroller')
export default {
  components: { Stroller },
  data () {
    return {

      /**
       * 工具箱显示与隐藏
       */
      isToolboxShow: process.env.NODE_ENV !== 'production',

      /**
       * 工具箱当前激活的TAB
       */
      currentTabContent: 'stroller',

      measure: {
        measureTool: {},
        isSaveBtnShow: false,
        isRun: false,
        type: 0,
        distances: [],
        areas: [],
        height: []
      }
    }
  },
  async mounted () {
    let viewer = await MapContextHolder.getMap()
    this.viewer = viewer
    const distanceMeasureCache = cacheManager.getCache(Measure.DistanceMeasure.MEASURE_GROUP_ID)
    distanceMeasureCache.getAll().then(data => {
      this.measure.distances = data || []
    })
  },
  methods: {

    changeMeasure (type) {
      this.measure.type = type
    },
    /**
     * 新建测量
     */
    doMeasure (measureType) {
      let that = this
      MapContextHolder.getMap().then(viewer => {
        if (that.measure.type == 0) {
          let distanceMeasure = Measure.DistanceMeasure.start(viewer)
          that.measure.measureTool = distanceMeasure
        } else {
          let areaMeasure = Measure.AreaMeasure.start(viewer)
          that.measure.measureTool = areaMeasure
        }
      })
    },
    /**
     * 取消测量
     */
    cancelMeasure () {
      this.measure.measureTool && this.measure.measureTool.destroy()
    },
    /**
     * 保存测量
     */
    saveMeasure () {
      this.cancelMeasure()
      let that = this
      this.measure.measureTool && this.measure.measureTool.saveToLocal((data) => {
        debugger
        const distanceMeasureCache = cacheManager.getCache(Measure.DistanceMeasure.MEASURE_GROUP_ID)
        distanceMeasureCache.getAll().then(data => {
          this.measure.distances = data || []
        })
        that.$msg('保存成功')
      })
    },
    /**
     * 删除测量
     */
    delMeasure (id) {
      let that = this
      const distanceMeasureCache = cacheManager.getCache(Measure.DistanceMeasure.MEASURE_GROUP_ID)
      distanceMeasureCache.evict(id).then(data => {
        distanceMeasureCache.getAll().then(data => {
          this.measure.distances = data || []
        })
        that.$msg('删除成功')
      })
    },
    /**
     * 查看测量
     */
    viewMeasure (distance) {
      let that = this
      let measureType = this.measure.type
      if (measureType == 0) {
        MapContextHolder.getMap().then(viewer => {
          let {data: {positions}, id} = distance
          if (distance.show) {
            viewer.entityManager.removeByGroupId(id)
            that.$set(distance, 'show', false)
          } else {
            let a = positions.reduce((result, curr, i) => {
              let {x, y, z} = curr
              let cartesian = Cartesian3.fromElements(x, y, z)
              result.positions.push(cartesian)
              if (result.pre != null) {
                let label = new Entity({
                  position: Cartesian3.midpoint(result.pre, cartesian, new Cartesian3()),
                  label: {
                    text: `${Cartesian3.distance(result.pre, cartesian).toFixed(2)}米`,
                    font: '12px sans-serif',
                    showBackground: true,
                    backgroundColor: Color.BLACK,
                    eyeOffset: Cartesian3.fromElements(0, 0, -5)
                  }
                })
                result.labels.push(label)
              }
              result.pre = cartesian
              return result
            }, {positions: [], labels: [], pre: null})
            let entity = new Entity({
              id: id,
              polyline: {
                positions: a.positions,
                width: 2
              }
            })
            viewer.entityManager.add(entity, id)
            a.labels.forEach(l => {
              viewer.entityManager.add(l, id)
            })

            viewer.flyTo(entity)
            that.$set(distance, 'show', true)
          }
        })
      }
    }
  }
}
</script>

<style>
@import url(//at.alicdn.com/t/font_2022970_nx9bnvdv4as.css);
</style>
