<template>
  <div class="flood-analyze">
    <div class="parameter">
      <div class="input-wrapper"><span>初始水位(米):</span><input v-model="minHeight" type="number" step="1" autocomplete="off" /></div>
      <div class="input-wrapper"><span>预设水位(米):</span><input v-model="maxHeight" type="number" step="1" autocomplete="off" /></div>
      <div class="input-wrapper"><span>模拟速度(米/秒):</span><input v-model="speed" type="number" min="0.1" step=".5" autocomplete="off" /></div>
      <div class="input-wrapper"><span>当前水位(米):</span><input v-model="currHeight" type="number" step="1" autocomplete="off" disabled /></div>
    </div>
    <div class="btn-group-simple">
      <a href="javascript:void(0);" class="btn-simple" @click="drawAnalyzeArea">绘制分析区域</a>
      <a v-show="isDrawOver" href="javascript:void(0);" class="btn-simple" @click="doAnalyze">开始分析</a>
      <a v-show="isDrawOver" href="javascript:void(0);" class="btn-simple" @click="stopAnalyze">结束分析</a>
    </div>
  </div>
</template>

<script>
import { MapContextHolder } from '@/assets/js/map/index';
import FloodAnalyze from '@/assets/js/map/tools/FloodAnalyze.js';
import { CallbackProperty, Color, JulianDate } from 'cesium';
export default {
  data() {
    return {
      minHeight: 20,
      maxHeight: 50,
      speed: 2,
      currHeight: 0,
      isDrawOver: false,
    };
  },
  async mounted() {
    let viewer = await MapContextHolder.getMap();
    this.viewer = viewer;
  },
  methods: {
    doAnalyze() {
      this.floodAnalyze.doAnalyze(this);
    },
    stopAnalyze() {
      this.currHeight = 0;
      this.isDrawOver = false;
      this.floodAnalyze && this.floodAnalyze.destroy();
      this.floodAnalyze = null;
    },
    drawAnalyzeArea() {
      this.stopAnalyze();
      this.floodAnalyze = new FloodAnalyze(this.viewer);
      this.floodAnalyze.addDrawOverHandler(() => {
        this.isDrawOver = true;
      }, this);
    },
  },
};
</script>

<style>
.parameter {
  padding: 10px;
}
.parameter .input-wrapper > span {
  width: 110px;
}
.parameter .input-wrapper > input {
  width: 227px;
}
</style>
