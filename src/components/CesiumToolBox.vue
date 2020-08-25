<template>
  <div class="cesium-tool">
    <div class="btn-group">
      <a class="tool-btn" href="javascript:void(0);" @click="isToolboxShow = !isToolboxShow"></a>
    </div>
    <transition name="tool-box">
      <div class="tool-box" v-show="isToolboxShow">
        <div class="tab">
          <a class="icon-people" :class="{active : 0 == toolboxTabActivedIndex}" href="javascript:void(0);" @click="changeToolboxTab(0)">漫步</a>
          <a class="icon-video" :class="{active : 1 == toolboxTabActivedIndex}" href="javascript:void(0);" @click="changeToolboxTab(1)">视频墙</a>
          <a class="icon-measure" :class="{active : 2 == toolboxTabActivedIndex}" href="javascript:void(0);" @click="changeToolboxTab(2)">量算</a>
          <a class="icon-sun" :class="{active : 3 == toolboxTabActivedIndex}" href="javascript:void(0);" @click="changeToolboxTab(3)">光照分析</a>
          <a class="icon-flood" :class="{active : 4 == toolboxTabActivedIndex}" href="javascript:void(0);" @click="changeToolboxTab(4)">淹没分析</a>
        </div>

        <div class="tab-context">
          <div class="watch-box" :class="{active : 0 == toolboxTabActivedIndex}">
            <div class="path-plan">
              <div class="path-coord-info"  v-show="!isPlaningPathShow && position.length > 0">
                <span class="title">坐标信息
                  <template v-show="position.index > 0">
                  [{{position.index + 1}}/{{position.length}}]
                  </template>
                </span>
                <div class="input-wrapper">
                  <span>经度:</span><input v-model="position.longitude" type="number" name="longitude" step=".00001">
                </div>
                <div class="input-wrapper">
                  <span>纬度:</span><input v-model="position.latitude" type="number" name="latitude" step=".00001">
                </div>
                <div class="input-wrapper">
                  <span>高度:</span><input v-model="position.height" type="number" name="height" step=".5">
                </div>
              </div>
              <div class="btn-group-simple right">
                <a v-if="isPlaningPathShow" href="javascript:void(0);" class="btn-simple" @click="planWathPath">规划路线</a>
                <template v-else>
                  <a href="javascript:void(0);" v-show="position.index < position.length - 1" class="btn-simple" @click="goToNextPosition">下一个坐标</a>
                  <a href="javascript:void(0);" v-show="position.index > 0" class="btn-simple" @click="goToPreviousPosition">上一个坐标</a>
                  <a href="javascript:void(0);" class="btn-simple" @click="cancelWathPath">取消规划</a>
                  <a href="javascript:void(0);" v-show="position.index > 0" class="btn-simple" @click="saveWathPath">保存路线</a>
                </template>
              </div>
            </div>
            <div class="path-box" v-show="position.index < 0">
              <span class="title">路线列表</span>
              <div class="path-items">
                <div class="path" v-for="(path, i) in cachePaths" :key="i">
                  <span class="seq">#{{i + 1}}</span>
                  <span class="title">{{formatTime(path.data.title)}}</span>
                  <span class="btn" @click="autoNavigate(path.data, i)"><i class="iconfont icon-yulan" :class="{ 'active' : pathActiveIndex == i}"></i></span>
                  <span class="btn" @click="delPath(path, i)"><i class="iconfont icon-del"></i></span>
                </div>
              </div>
            </div>
          </div>

          <div class="video-wall-box" :class="{active : 1 == toolboxTabActivedIndex}">
              <!-- <video src="http://vfx.mtime.cn/Video/2019/02/04/mp4/190204084208765161.mp4" style="width: 363px;" controls loop preload="auto" autoplay="autoplay"></video> -->
          </div>

          <div class="measure-box" :class="{active : 2 == toolboxTabActivedIndex}">
            <div class="measure-type-tab">
              <a href="javascript:void(0)" class="btn" :class="{active : measure.type == 0}" @click="changeMeasure(0)"><i class="iconfont icon-chizi"></i> 距离</a>
              <a href="javascript:void(0)" class="btn" :class="{active : measure.type == 1}" @click="changeMeasure(1)"><i class="iconfont icon-mianji"></i> 面积</a>
              <!-- <a href="javascript:void(0)" class="btn" :class="{active : measure.type == 2}" @click="changeMeasure(2)"><i class="iconfont icon-iconfonttubiao_gaodu"></i> 高度</a> -->
            </div>
            <div class="title">测量历史</div>
            <div class="btn-group-simple right">
               <a href="javascript:void(0);" class="btn-simple" @click="saveMeasure()" v-show="measure.measureTool.isRun && measure.measureTool.canSave">保存测量</a>
              <a href="javascript:void(0);" class="btn-simple" @click="cancelMeasure()" v-show="measure.measureTool.isRun">取消测量</a>
              <a href="javascript:void(0);" class="btn-simple" @click="doMeasure(measure.type)" v-show="!measure.measureTool.isRun">新建测量</a>
            </div>
            <div class="distance-measure">
              <div class="distance-history" v-show="measure.type == 0">
                <div class="table">
                  <thead class="t-header">
                    <tr class="t-row">
                      <th class="t-cell">测量时间</th>
                      <th class="t-cell">总长</th>
                      <th class="t-cell">操作</th>
                    </tr>
                  </thead>
                  <tbody class="t-body">
                    <tr class="t-row" v-for="(distance, i) in measure.distances" :key="i">
                      <td class="t-cell">{{formatTime(distance.data.time)}}</td>
                      <td class="t-cell">{{distance.data.totalDistance.toFixed(3)}}米</td>
                      <td class="t-cell">
                        <span class="btn" @click="viewMeasure(distance)"><i class="iconfont icon-yulan" :class="{ 'active' : distance.show}"></i>查看</span> |
                        <span class="btn" @click="delMeasure(distance.id)"><i class="iconfont icon-del"></i>删除</span>
                      </td>
                    </tr>
                    <tr class="t-row" v-if="measure.distances.length <= 0"><td class="t-cell" colspan="4">暂无数据...</td></tr>
                  </tbody>
                </div>
              </div>
            </div>
            <div class="area-measure" v-show="measure.type == 1">

            </div>
            <div class="height-measure" v-show="measure.type == 2">

            </div>
          </div>

          <div class="sun-box" :class="{active : 3 == toolboxTabActivedIndex}">

          </div>

          <div class="flood-box" :class="{active : 4 == toolboxTabActivedIndex}">

          </div>

        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import '@/assets/css/cesium-tool.css'
import { PlanWatchPathTool, Measure } from '@/assets/js/map/drawtool'
import { Math as CesiumMath, Cartesian3, SampledPositionProperty, CallbackProperty, JulianDate, ClockRange, VelocityOrientationProperty, Cartographic, defined, Transforms, Matrix4, Matrix3, createGuid, HeadingPitchRange, Entity, Color } from 'cesium'
import { MapContextHolder } from '@/assets/js/map/index'
import moment from 'moment'
import CacheManagerFactory from '@/assets/js/cache/CacheManagerFactory'
const PATH_CACHE_NAME = 'PATH_CACHE'
export default {
  data () {
    return {
      isPlaningPathShow: true,
      position: { index: -1, longitude: 0, latitude: 0, height: 0, length: 0 },
      cachePaths: [],
      isToolboxShow: process.env.NODE_ENV !== 'production',
      toolboxTabActivedIndex: 0,
      pathActiveIndex: null,
      lookAt: {
        x: 0, y: 0, z: 100
      },
      lookAts: [],
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
  computed: {
    cachePosition () {
      return Object.assign({}, this.position)
    }
  },
  mounted () {
    const cacheManager = CacheManagerFactory.getDefaultCacheManager()
    const pathCache = cacheManager.getCache(PATH_CACHE_NAME)
    pathCache.getAll().then(data => {
      this.cachePaths = data || []
    })
    const distanceMeasureCache = cacheManager.getCache(Measure.DistanceMeasure.MEASURE_GROUP_ID)
    distanceMeasureCache.getAll().then(data => {
      this.measure.distances = data || []
    })
  },
  methods: {
    formatTime (time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss')
    },
    /**
     * 规划路线
     */
    planWathPath () {
      if (this.pathActiveIndex !== null) {
        let entityId = 'path-' + this.pathActiveIndex
        MapContextHolder.getMap().then(viewer => {
          viewer.entities.removeById(entityId)
          this.pathActiveIndex = null
        })
      }

      this.isPlaningPathShow = false
      const planWatchPathTool = (this.planWatchPathTool = new PlanWatchPathTool())
      const that = this
      planWatchPathTool.addLastPositionChangedListener((positions, last) => {
        let { longitude, latitude, height } = last
        Object.assign(that.position, {
          longitude: CesiumMath.toDegrees(longitude), latitude: CesiumMath.toDegrees(latitude), height: height.toFixed(2), index: positions.length - 1, length: positions.length
        })
        that.lookAts.push(Object.assign({}, that.lookAt))
      })
    },
    /**
     * 删除路线
     */
    delPath (path, index) {
      let {id} = path
      let that = this
      const cacheManager = CacheManagerFactory.getDefaultCacheManager()
      const pathCache = cacheManager.getCache(PATH_CACHE_NAME)
      pathCache.evict(id).then(data => {
        that.cachePaths.splice(index, 1)
        that.autoNavigate(path, index)
      })
    },
    resetPlaning () {
      this.isPlaningPathShow = true
      this.planWatchPathTool && this.planWatchPathTool.destroy()
      this.position.length = 0
      this.position.index = -1
    },
    /**
     * 取消规划
     */
    cancelWathPath () {
      this.resetPlaning()
    },
    /**
     * 保存路线
     */
    saveWathPath () {
      this.resetPlaning()
      let path = this.planWatchPathTool.positions.map(p => {
        let { x, y, z } = p
        return { x, y, z }
      })
      let that = this
      let id = createGuid()
      let newPath = {id, title: new Date().toISOString(), path, lookAts: this.lookAts}
      const cacheManager = CacheManagerFactory.getDefaultCacheManager()
      const pathCache = cacheManager.getCache(PATH_CACHE_NAME)
      pathCache.put(id, newPath).then(data => {
        that.cachePaths.push({id, data: newPath})
      })
    },
    /**
     * 切换工具箱
     */
    changeToolboxTab (index) {
      this.toolboxTabActivedIndex = index
    },
    /**
     * 定位到上一个坐标
     */
    goToPreviousPosition () {
      let index = this.position.index - 1
      const position = this.planWatchPathTool.getPositionByIndex(index)
      const coord = Cartographic.fromCartesian(position)
      let { longitude, latitude, height } = coord

      this.position = {
        longitude: CesiumMath.toDegrees(longitude), latitude: CesiumMath.toDegrees(latitude), height: height.toFixed(2), index, length: this.position.length
      }
      MapContextHolder.getMap().then(viewer => {
        viewer.scene.camera.flyTo({
          destination: Cartesian3.fromRadians(longitude, latitude, 100)
        })
      })
    },
    /**
     * 定位到下个坐标
     */
    goToNextPosition () {
      let index = this.position.index + 1
      const position = this.planWatchPathTool.getPositionByIndex(index)
      const coord = Cartographic.fromCartesian(position)
      let { longitude, latitude, height } = coord

      this.position = {
        longitude: CesiumMath.toDegrees(longitude), latitude: CesiumMath.toDegrees(latitude), height: height.toFixed(2), index, length: this.position.length
      }
      MapContextHolder.getMap().then(viewer => {
        viewer.scene.camera.flyTo({
          destination: Cartesian3.fromRadians(longitude, latitude, 100)
        })
      })
    },
    /**
     * 根据路线自动巡航
     */
    autoNavigate (data, index) {
      let entityId = 'path-' + index
      if (this.pathActiveIndex === index) {
        MapContextHolder.getMap().then(viewer => {
          viewer.entities.removeById(entityId)
          this.pathActiveIndex = null
        })
      } else {
        var start = JulianDate.now()

        let nextTime = start.clone()

        const viewFrom = new SampledPositionProperty()
        const lookAts = data.lookAts
        var sampledPosition = data.path.reduce((total, { x, y, z }, i) => {
          let position = Cartesian3.fromElements(x, y, z)
          let prePoistion = total.getValue(nextTime)
          if (prePoistion) {
            let distance = Cartesian3.distance(prePoistion, position)
            let needSec = distance / 1.5
            nextTime = JulianDate.addSeconds(nextTime, needSec, new JulianDate())
            total.addSample(nextTime, position)
          } else {
            total.addSample(nextTime, position)
          }
          // let lookat = lookAts[i]
          // viewFrom.addSample(nextTime.clone(), Cartesian3.fromElements(lookat.x, lookat.y, lookat.z))
          return total
        }, new SampledPositionProperty())

        let preId = 'path-' + this.pathActiveIndex
        this.pathActiveIndex = index
        var modelUrl = '/static/models/Cesium_Man.glb'

        MapContextHolder.getMap().then(viewer => {
          viewer.clock.startTime = start.clone()
          viewer.clock.stopTime = nextTime.clone()
          viewer.clock.currentTime = start.clone()
          viewer.clock.clockRange = ClockRange.LOOP_STOP // Loop at the end
          viewer.clock.multiplier = 1
          // viewer.timeline.zoomTo(start.clone(), nextTime.clone())
          viewer.entities.removeById(preId)
          let peopleModel = viewer.entities.add({
            id: entityId,
            name: modelUrl,
            position: sampledPosition,
            orientation: new VelocityOrientationProperty(sampledPosition),
            model: {
              uri: modelUrl,
              scale: 1
            },
            viewFrom: new Cartesian3(0, -90, 40)
          })
          viewer.trackedEntity = peopleModel
        })
      }
    },
    changeMeasure (type) {
      this.measure.type = type
    },
    /**
     * 新建测量
     */
    doMeasure (measureType) {
      let that = this
      MapContextHolder.getMap().then(viewer => {
        let distanceMeasure = Measure.DistanceMeasure.start(viewer)
        that.measure.measureTool = distanceMeasure
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
        const cacheManager = CacheManagerFactory.getDefaultCacheManager()
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
      const cacheManager = CacheManagerFactory.getDefaultCacheManager()
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
  },
  watch: {
    cachePosition: {
      handler (val, oldVal) {
        let { index, longitude, latitude, height } = val
        let isNeedUpdate = oldVal && index <= oldVal.index
        if (isNeedUpdate) {
          this.planWatchPathTool.modifyPosition(index, Cartesian3.fromDegrees(parseFloat(longitude), parseFloat(latitude), parseFloat(height)))
        }
      },
      deep: true,
      immediate: true
    },
    lookAt: {
      handler (val, oldVal) {
        let {x, y, z} = val
        let {longitude, latitude, height} = this.position
        MapContextHolder.getMap().then(viewer => {
          viewer.scene.camera.lookAt(Cartesian3.fromDegrees(parseFloat(longitude), parseFloat(latitude), parseFloat(height)), Cartesian3.fromElements(x, y, z))
        })
      },
      deep: true,
      immediate: true
    }
  }
}
</script>

<style>
@import url(//at.alicdn.com/t/font_2022970_nx9bnvdv4as.css);
</style>
