<template>
  <div class="watch-box">
    <div class="path-plan">
      <div class="path-coord-info" v-show="isDoPlanRoute">
        <span class="title">坐标信息[{{ planRouteData.currIndex + 1 }}/{{ planRouteData.coords.length }}]</span>
        <div class="input-wrapper"><span>经度:</span><input v-model="planRouteData.currCoord.longitude" type="number" step=".00001" autocomplete="off" v-on:input="currCoordChange" /></div>
        <div class="input-wrapper"><span>纬度:</span><input v-model="planRouteData.currCoord.latitude" type="number" step=".00001" autocomplete="off" v-on:input="currCoordChange" /></div>
        <div class="input-wrapper"><span>高度:</span><input v-model="planRouteData.currCoord.height" type="number" step=".5" autocomplete="off" v-on:input="currCoordChange" /></div>
      </div>
      <div class="btn-group-simple right">
        <a v-if="!isDoPlanRoute" href="javascript:void(0);" class="btn-simple" @click="planRoute">规划路线</a>
        <template v-else>
          <a href="javascript:void(0);" v-show="planRouteData.currIndex < planRouteData.coords.length - 1" class="btn-simple" @click="goToNextCoord">下一个坐标</a>
          <a href="javascript:void(0);" class="btn-simple" @click="cancelPlanRoute">取消规划</a>
          <a href="javascript:void(0);" v-show="planRouteData.coords.length > 1 && planRouteData.currIndex > 0" class="btn-simple" @click="goToPreCoord">上一个坐标</a>
          <a href="javascript:void(0);" v-show="planRouteData.coords.length > 1" class="btn-simple" @click="saveRoute">保存路线</a>
        </template>
      </div>
    </div>
    <div class="path-box" v-show="!isDoPlanRoute">
      <span class="title">路线列表</span>
      <div class="default-routes">
        <div class="route" v-for="(route, i) in defaultRoutes" :key="route.id">
          <span class="seq">#{{ i + 1 }}</span>
          <span class="title">{{ route.title || formatTime(route.createTime) }}</span>
          <span class="btn right" @click="stroll(route)"><i class="iconfont icon-yulan" :class="{ active: strollerId == route.id }"></i></span>
        </div>
      </div>
      <div class="path-items">
        <div class="path" v-for="(route, i) in orderedRouteds" :key="route.id">
          <span class="seq">#{{ i + 1 }}</span>
          <span class="title">{{ route.title || formatTime(route.createTime) }}</span>
          <span class="btn" @click="stroll(route)"><i class="iconfont icon-yulan" :class="{ active: strollerId == route.id }"></i></span>
          <span class="btn" @click="deleteRoute(route)"><i class="iconfont icon-del"></i></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { MapContextHolder } from '@/assets/js/map/index';
import { Stroller } from '@/assets/js/map/tools';
import { Cartographic, Cartesian3, Math as CesiumMath } from 'cesium';
import defaultRoutes from '@/assets/json/defaultRoutes';
export default {
  data() {
    return {
      /**
       *是否规划路线
       */
      isDoPlanRoute: false,
      planRouteData: {
        // 规划漫游路径数据
        currIndex: -1, // 当前点的索引
        currCoord: {}, // 当前点的坐标
        coords: [], // 路径
      },

      /**
       * 路线列表
       */
      routes: [],

      /**
       * 默认路线
       */
      defaultRoutes,

      /**
       * 查看的路径
       */
      strollerId: null,
    };
  },

  computed: {
    orderedRouteds() {
      return this.routes.slice().sort((a, b) => {
        return Date.parse(b.title) - Date.parse(a.title);
      });
    },
  },

  async mounted() {
    let viewer = await MapContextHolder.getMap();
    this.viewer = viewer;
    this.loadRoutes();
  },

  methods: {
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss');
    },

    /**
     * 规划路径
     * 自定义漫游路径
     */
    planRoute() {
      this.isDoPlanRoute = true;
      this.planRouteTool = Stroller.planRoute(this.viewer);
      // 添加路径改变监听
      this.planRouteTool.addRouteChangeHandler((cartesian) => {
        let { longitude, latitude, height } = Cartographic.fromCartesian(cartesian);
        this.planRouteData.currIndex += 1;
        this.planRouteData.currCoord = {
          longitude: CesiumMath.toDegrees(longitude),
          latitude: CesiumMath.toDegrees(latitude),
          height,
        };
        this.planRouteData.coords.push(this.planRouteData.currCoord);
      }, this);
    },

    /**
     * 返回到上一个规划点
     */
    goToPreCoord() {
      this.planRouteData.currIndex -= 1;
      this.planRouteData.currCoord = this.planRouteData.coords[this.planRouteData.currIndex];
      let { longitude, latitude, height } = this.planRouteData.currCoord;
      this.viewer.scene.camera.flyTo({
        destination: Cartesian3.fromDegrees(longitude, latitude, height + 200),
      });
    },

    /**
     * 返回到下一个规划点
     */
    goToNextCoord() {
      this.planRouteData.currIndex += 1;
      this.planRouteData.currCoord = this.planRouteData.coords[this.planRouteData.currIndex];
      let { longitude, latitude, height } = this.planRouteData.currCoord;
      this.viewer.scene.camera.flyTo({
        destination: Cartesian3.fromDegrees(longitude, latitude, height + 200),
      });
    },

    /**
     * 坐标调整
     */
    currCoordChange() {
      let {
        planRouteData: {
          currIndex,
          currCoord: { longitude, latitude, height },
          coords,
        },
      } = this;
      if (currIndex >= 0) {
        let cartesian = Cartesian3.fromDegrees(parseFloat(longitude), parseFloat(latitude), parseFloat(height));
        this.planRouteTool.changePosition(currIndex, cartesian);
      }
    },

    /**
     * 保存路径
     */
    saveRoute() {
      this.cancelPlanRoute();
      let that = this;
      this.planRouteTool.saveRoute().then((data) => {
        that.routes.push(data);
        that.$msg('保存成功');
      });
    },

    /**
     * 取消规划
     */
    cancelPlanRoute() {
      this.isDoPlanRoute = false;
      this.planRouteData.currIndex = -1;
      this.planRouteData.currCoord = {};
      this.planRouteData.coords = [];
      this.planRouteTool.destroy();
    },

    /**
     * 漫游路径
     */
    stroll(route) {
      let { strollerId } = this;
      if (strollerId != null) {
        // 移除前一次漫游
        Stroller.removeStroller(this.viewer, strollerId);
        this.strollerId = null;
      }
      if (strollerId != route.id) {
        Stroller.addStroller(this.viewer, route);
        this.strollerId = route.id;
      }
    },

    /**
     * 删除路径
     */
    deleteRoute(route) {
      let that = this;
      Stroller.deleteRoute(route.id).then(() => {
        let index = that.routes.indexOf(route);
        that.routes.splice(index, 1);
        that.$msg('删除成功');
      });
    },

    /**
     * 加载路线列表
     */
    loadRoutes() {
      Stroller.getRoutes().then((data) => {
        this.routes = data;
      });
    },
  },
};
</script>

<style></style>
