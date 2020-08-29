<template>
  <div class="measure-box">
    <div class="measure-type-tab">
      <a href="javascript:void(0)" class="btn" :class="{ active: measureType == 0 }" @click="measureType = 0"><i class="iconfont icon-ceju"></i> 距离</a>
      <a href="javascript:void(0)" class="btn" :class="{ active: measureType == 1 }" @click="measureType = 1"><i class="iconfont icon-mianji"></i> 面积</a>
    </div>

    <div class="title">测量历史</div>
    <div class="btn-group-simple right">
      <a href="javascript:void(0);" class="btn-simple" @click="saveMeasure()" v-show="doMeasureType != null && shouldShowSaveBtn">保存测量</a>
      <a href="javascript:void(0);" class="btn-simple" @click="cancelMeasure()" v-show="doMeasureType != null">取消测量</a>
      <a href="javascript:void(0);" class="btn-simple" @click="measure()" v-show="doMeasureType == null">新建测量</a>
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
              <td class="t-cell" v-text="i + 1"></td>
              <td class="t-cell">{{ formatTime(distance.createTime) }}</td>
              <td class="t-cell">{{ distance.totalDistance.toFixed(3) }}米</td>
              <td class="t-cell">
                <span class="btn" @click="viewDistanceMeasure(distance)"
                  ><i
                    class="iconfont icon-yulan"
                    :class="{
                      active: activeDistanceHistoryIds.indexOf(distance.id) > -1,
                    }"
                  ></i
                  >查看</span
                >
                |
                <span class="btn" @click="deleteDistanceMeasure(distance)"><i class="iconfont icon-del"></i>删除</span>
              </td>
            </tr>
            <tr class="t-row" v-if="distanceMeasures.length <= 0">
              <td class="t-cell" colspan="4">暂无数据...</td>
            </tr>
          </tbody>
        </div>
      </div>
    </div>

    <div class="area-measure" v-show="measureType == 1">
      <div class="table">
        <thead class="t-header">
          <tr class="t-row">
            <th class="t-cell">#</th>
            <th class="t-cell">测量时间</th>
            <th class="t-cell">面积</th>
            <th class="t-cell">操作</th>
          </tr>
        </thead>
        <tbody class="t-body">
          <tr class="t-row" v-for="(polygon, i) in orderedArea" :key="polygon.id">
            <td class="t-cell" v-text="i + 1"></td>
            <td class="t-cell">{{ formatTime(polygon.createTime) }}</td>
            <td class="t-cell">{{ polygon.area.toFixed(3) }}平方米</td>
            <td class="t-cell">
              <span class="btn" @click="viewAreaMeasure(polygon)"
                ><i
                  class="iconfont icon-yulan"
                  :class="{
                    active: activeAreaHistoryIds.indexOf(polygon.id) > -1,
                  }"
                ></i
                >查看</span
              >
              |
              <span class="btn" @click="deleteAreaMeasure(polygon)"><i class="iconfont icon-del"></i>删除</span>
            </td>
          </tr>
          <tr class="t-row" v-if="areaMeasures.length <= 0">
            <td class="t-cell" colspan="4">暂无数据...</td>
          </tr>
        </tbody>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { DistanceMeasure, AreaMeasure } from '@/assets/js/map/tools';
import { Cartesian3, Entity, Color } from 'cesium';
import { MapContextHolder } from '@/assets/js/map/index';

export default {
  data() {
    return {
      /**
       * 测量类型
       * 0：距离测量
       * 1：面积测量
       */
      measureType: 0,

      /**
       * 正在测量的类型
       */
      doMeasureType: null,

      /**
       * 距离测量历史数据
       */
      distanceMeasures: [],

      /**
       * 是否显示保存按钮
       */
      shouldShowSaveBtn: false,

      /**
       * 选中查看的历史测距ID
       */
      activeDistanceHistoryIds: [],
      // ================================
      // 面积测量
      // ================================
      areaMeasures: [],

      activeAreaHistoryIds: [],
    };
  },

  computed: {
    orderedDistance() {
      return this.distanceMeasures.slice().sort((a, b) => {
        return Date.parse(b.createTime) - Date.parse(a.createTime);
      });
    },
    orderedArea() {
      return this.areaMeasures.slice().sort((a, b) => {
        return Date.parse(b.createTime) - Date.parse(a.createTime);
      });
    },
  },

  async mounted() {
    let viewer = await MapContextHolder.getMap();
    this.viewer = viewer;
    this.loadDistanceMeasures();
    this.loadAreaMeasures();
  },

  methods: {
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss');
    },

    /**
     * 新建测量
     */
    measure() {
      let { measureType, viewer } = this;
      this.doMeasureType = measureType;
      switch (measureType) {
        case 0:
          this.measureTool = DistanceMeasure.start(viewer);
          this.measureTool.addChangeEvent((canSave) => {
            this.shouldShowSaveBtn = canSave;
          }, this);
          break;
        case 1:
          this.measureTool = AreaMeasure.start(viewer);
          this.measureTool.addChangeEvent((canSave) => {
            this.shouldShowSaveBtn = canSave;
          }, this);
          break;
        default:
          break;
      }
    },

    /**
     * 取消测量
     */
    cancelMeasure() {
      this.measureTool && this.measureTool.destroy();
      this.doMeasureType = null;
      this.shouldShowSaveBtn = false;
    },

    /**
     * 保存测量
     */
    saveMeasure() {
      let that = this;
      let { doMeasureType } = this;
      switch (doMeasureType) {
        case 0:
          this.measureTool.saveMeasure().then((data) => {
            that.distanceMeasures.push(data);
            that.cancelMeasure();
            that.$msg('保存成功');
          });
          break;
        case 1:
          this.measureTool.saveMeasure().then((data) => {
            that.areaMeasures.push(data);
            that.cancelMeasure();
            that.$msg('保存成功');
          });
          break;
        default:
          break;
      }
    },

    /**
     * 删除距离测量
     */
    deleteDistanceMeasure(distance) {
      let that = this;
      DistanceMeasure.deleteMeasure(distance.id).then(() => {
        let index = that.distanceMeasures.indexOf(distance);
        that.distanceMeasures.splice(index, 1);
        let isShowInMap = that.activeDistanceHistoryIds.indexOf(distance.id) > -1;
        if (isShowInMap) {
          that.viewDistanceMeasure(distance);
        }
        that.$msg('删除成功');
      });
    },

    /**
     * 查看距离测量
     */
    viewDistanceMeasure(distance) {
      let { id } = distance;
      let index = this.activeDistanceHistoryIds.indexOf(id);
      if (index > -1) {
        this.$delete(this.activeDistanceHistoryIds, index);
        DistanceMeasure.removeDistanceMeasure(this.viewer, id);
      } else {
        this.$set(this.activeDistanceHistoryIds, this.activeDistanceHistoryIds.length, id);
        DistanceMeasure.viewDistanceMeasure(this.viewer, distance);
      }
    },

    /**
     * 在地图上查看测面数据
     */
    viewAreaMeasure(polygon) {
      let { id } = polygon;
      let index = this.activeAreaHistoryIds.indexOf(id);
      if (index > -1) {
        this.$delete(this.activeAreaHistoryIds, index);
        AreaMeasure.removeAreaMeasure(this.viewer, id);
      } else {
        this.$set(this.activeAreaHistoryIds, this.activeAreaHistoryIds.length, id);
        AreaMeasure.viewAreaMeasure(this.viewer, polygon);
      }
    },

    /**
     * 删除测面记录
     */
    deleteAreaMeasure(polygon) {
      let that = this;
      AreaMeasure.deleteMeasure(polygon.id).then(() => {
        let index = that.areaMeasures.indexOf(polygon);
        that.areaMeasures.splice(index, 1);
        let isShowInMap = that.activeAreaHistoryIds.indexOf(polygon.id) > -1;
        if (isShowInMap) {
          that.viewAreaMeasure(polygon);
        }
        that.$msg('删除成功');
      });
    },

    /**
     * 加载距离测量数据
     */
    loadDistanceMeasures() {
      let that = this;
      DistanceMeasure.getMeasureHistory().then((data) => {
        that.distanceMeasures = data;
      });
    },

    /**
     * 加载面积测量数据
     */
    loadAreaMeasures() {
      AreaMeasure.getMeasureHistory().then((data) => {
        this.areaMeasures = data;
      });
    },
  },
};
</script>

<style></style>
