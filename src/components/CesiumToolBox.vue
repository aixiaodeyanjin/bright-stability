<template>
  <div class="cesium-tool">
    <div class="btn-group">
      <a class="tool-btn" href="javascript:void(0);" @click="isToolboxShow = !isToolboxShow"></a>
    </div>
    <transition name="tool-box">
      <div class="tool-box" v-show="isToolboxShow">
        <div class="tab">
          <a class="icon-people" :class="{ active: currentTabContent == 'stroller' }" href="javascript:void(0);" @click="currentTabContent = 'stroller'">漫步</a>
          <a class="icon-video" :class="{ active: currentTabContent == 'videoWall' }" href="javascript:void(0);" @click="currentTabContent = 'videoWall'">视频墙</a>
          <a class="icon-measure" :class="{ active: currentTabContent == 'measure' }" href="javascript:void(0);" @click="currentTabContent = 'measure'">量算</a>
          <a class="icon-flood" :class="{ active: currentTabContent == 'floodAnalyze' }" href="javascript:void(0);" @click="currentTabContent = 'floodAnalyze'">淹没分析</a>
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
import '@/assets/css/cesium-tool.css';
import loading from '@/components/cesium-tools/Loading';
const asyncImport = (...components) => {
  let load = (component) => () => ({ component: import(`@/components/cesium-tools/${component}`), loading });
  return components.flat().reduce((components, component) => {
    components[component.name || component] = load(component);
    return components;
  }, {});
};

export default {
  components: asyncImport('Stroller', 'VideoWall', 'Measure', 'FloodAnalyze'),
  data() {
    return {
      /**
       * 工具箱显示与隐藏
       */
      isToolboxShow: process.env.NODE_ENV !== 'production',

      /**
       * 工具箱当前激活的TAB
       */
      currentTabContent: 'stroller',
    };
  },
};
</script>

<style>
@import url(//at.alicdn.com/t/font_2022970_72cdeo0cnj5.css);
</style>
