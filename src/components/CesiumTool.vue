<template>
  <div class="cesium-tool">
    <div class="btn-group">
      <a class="tool-btn" href="javascript:void(0);" @click="isToolboxShow = !isToolboxShow"></a>
    </div>
    <transition name="tool-box">
      <div class="tool-box" v-show="isToolboxShow">
        <div class="tab">
          <a class="icon-people" :class="{active : 0 == toolboxTabActivedIndex}" href="javascript:void(0);" @click="changeToolboxTab(0)">俯瞰</a>
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

          </div>

          <div class="measure-box" :class="{active : 2 == toolboxTabActivedIndex}">

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
import { PlanWatchPathTool } from '@/assets/js/map/drawtool'
import { Math as CesiumMath, Cartesian3, SampledPositionProperty, CallbackProperty, JulianDate, ClockRange, VelocityOrientationProperty, Cartographic, defined, Transforms, Matrix4, Matrix3, createGuid, HeadingPitchRange } from 'cesium'
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
      lookAts: []
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
      let newPath = {id, title: new Date().toString(), path, lookAts: this.lookAts}
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

          // let camera = viewer.scene.camera
          viewer.trackedEntity = peopleModel
          // let hpRange = {}
          // let preUpdateHandler = viewer.scene.preUpdate.addEventListener(function () {
          //   if (peopleModel) {
          //     hpRange.heading = CesiumMath.toRadians(90)
          //     hpRange.pitch = CesiumMath.toRadians(0)
          //     hpRange.range = 1000
          //     var center = sampledPosition.getValue(viewer.clock.currentTime)
          //     if (center) viewer.camera.lookAt(center, hpRange)
          //   }
          // })
          // viewer.scene.postUpdate.addEventListener(function (scene, time) {
          //   var position = peopleModel.position.getValue(time)
          //   if (!defined(position)) {
          //     return
          //   }

          //   var transform
          //   if (!defined(peopleModel.orientation)) {
          //     transform = Transforms.eastNorthUpToFixedFrame(position)
          //   } else {
          //     var orientation = peopleModel.orientation.getValue(time)
          //     if (!defined(orientation)) {
          //       return
          //     }

          //     transform = Matrix4.fromRotationTranslation(Matrix3.fromQuaternion(orientation), position)
          //   }

          //   // Save camera state
          //   var offset = Cartesian3.clone(camera.position)
          //   var direction = Cartesian3.clone(camera.direction)
          //   var up = Cartesian3.clone(camera.up)

          //   // Set camera to be in model's reference frame.
          //   camera.lookAtTransform(transform)

          //   // Reset the camera state to the saved state so it appears fixed in the model's frame.
          //   Cartesian3.clone(offset, camera.position)
          //   Cartesian3.clone(direction, camera.direction)
          //   Cartesian3.clone(up, camera.up)
          //   Cartesian3.cross(direction, up, camera.right)
          // })
        // viewer.flyTo(peopleModel)
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
@import url(//at.alicdn.com/t/font_2022970_1k40003i4gxh.css);
</style>
