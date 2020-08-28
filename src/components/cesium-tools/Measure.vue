<template>
<div class="measure-box">

  <div class="measure-type-tab">
    <a href="javascript:void(0)" class="btn" :class="{active : measureType == 0}" @click="measureType = 0"><i class="iconfont icon-ceju"></i> 距离</a>
    <a href="javascript:void(0)" class="btn" :class="{active : measureType == 1}" @click="measureType = 1"><i class="iconfont icon-mianji"></i> 面积</a>
  </div>

  <div class="title">测量历史</div>
  <div class="btn-group-simple right">
    <a href="javascript:void(0);" class="btn-simple" @click="saveMeasure()" v-show="isMeasureToolRun && shouldShowSaveBtn">保存测量</a>
    <a href="javascript:void(0);" class="btn-simple" @click="cancelMeasure()" v-show="isMeasureToolRun">取消测量</a>
    <a href="javascript:void(0);" class="btn-simple" @click="measure()" v-show="!isMeasureToolRun">新建测量</a>
  </div>

  <div class="distance-measure">
    <div class="distance-history" v-show="measureType == 0">
      <div class="table">
        <thead class="t-header">
          <tr class="t-row">
            <th class="t-cell">#</th>
            <th class="t-cell">测量时间</th>
            <th class="t-cell">总长</th>
            <th class="t-cell">操作</th>
          </tr>
        </thead>
        <tbody class="t-body">
          <tr class="t-row" v-for="(distance, i) in orderedDistance" :key="distance.id">
            <td class="t-cell" v-text=" i + 1"></td>
            <td class="t-cell">{{formatTime(distance.createTime)}}</td>
            <td class="t-cell">{{distance.totalDistance.toFixed(3)}}米</td>
            <td class="t-cell">
              <span class="btn" @click="viewDistanceMeasure(distance)"><i class="iconfont icon-yulan" :class="{ 'active' : activeDistanceHistoryIds.indexOf(distance.id) > -1}"></i>查看</span> |
              <span class="btn" @click="deleteDistanceMeasure(distance)"><i class="iconfont icon-del"></i>删除</span>
            </td>
          </tr>
          <tr class="t-row" v-if="distanceMeasures.length <= 0"><td class="t-cell" colspan="4">暂无数据...</td></tr>
        </tbody>
      </div>
    </div>
  </div>

  <div class="area-measure" v-show="measureType == 1">

  </div>
</div>
</template>

<script>
import moment from 'moment'
import { DistanceMeasure } from '@/assets/js/map/tools'
import { Cartesian3, Entity, Color } from 'cesium'
import { MapContextHolder } from '@/assets/js/map/index'

export default {
  data () {
    return {
      /**
       * 测量类型
       * 0：距离测量
       * 1：面积测量
       */
      measureType: 0,

      /**
       * 距离测量历史数据
       */
      distanceMeasures: [],

      /**
       * 是否正在测量
       */
      isMeasureToolRun: false,

      /**
       * 是否显示保存按钮
       */
      shouldShowSaveBtn: false,

      activeDistanceHistoryIds: []
    }
  },

  computed: {
    orderedDistance () {
      return this.distanceMeasures.slice().sort((a, b) => {
        return Date.parse(b.createTime) - Date.parse(a.createTime)
      })
    }
  },

  async mounted () {
    let viewer = await MapContextHolder.getMap()
    this.viewer = viewer
    this.loadDistanceMeasures()
  },

  methods: {

    formatTime (time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss')
    },

    /**
     * 新建测量
     */
    measure () {
      if (this.measureType == 0) {
        this.measureTool = DistanceMeasure.start(this.viewer)
        this.measureTool.addChangeEvent(canSave => {
          this.shouldShowSaveBtn = canSave
        }, this)
        this.isMeasureToolRun = true
      }
    },

    /**
     * 取消测量
     */
    cancelMeasure () {
      this.measureTool && this.measureTool.destroy()
      this.isMeasureToolRun = false
      this.shouldShowSaveBtn = false
    },

    /**
     * 保存测量
     */
    saveMeasure () {
      let that = this
      if (this.measureType == 0) {
        this.measureTool.saveMeasure().then(data => {
          that.distanceMeasures.push(data)
          that.cancelMeasure()
          that.$msg('保存成功')
        })
      }
    },

    /**
     * 删除距离测量
     */
    deleteDistanceMeasure (distance) {
      let that = this
      DistanceMeasure.deleteMeasure(distance.id).then(() => {
        let index = that.distanceMeasures.indexOf(distance)
        that.distanceMeasures.splice(index, 1)
        that.$msg('删除成功')
      })
    },

    /**
     * 查看距离测量
     */
    viewDistanceMeasure (distance) {
      let {id} = distance
      let index = this.activeDistanceHistoryIds.indexOf(id)
      if (index > -1) {
        this.$delete(this.activeDistanceHistoryIds, index)
        DistanceMeasure.removeDistanceMeasure(this.viewer, id)
      } else {
        this.$set(this.activeDistanceHistoryIds, this.activeDistanceHistoryIds.length, id)
        DistanceMeasure.viewDistanceMeasure(this.viewer, distance)
      }
    },

    /**
     * 加载距离测量数据
     */
    loadDistanceMeasures () {
      let that = this
      DistanceMeasure.getMeasureHistory().then(data => {
        that.distanceMeasures = data
      })
    }
  }
}
</script>

<style>

</style>
