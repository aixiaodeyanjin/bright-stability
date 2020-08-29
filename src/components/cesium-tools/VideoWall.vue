<template>
  <div class="video-wall">
    <video ref="video" width="385" :src="src" loop="loop" muted="true"></video>
    <div class="btn-group-simple center">
      <a href="javascript:void(0);" class="btn-simple" @click="showVideoWall">显示视频墙</a>
      <a href="javascript:void(0);" class="btn-simple" @click="closeVideoWall">关闭视频墙</a>
    </div>
  </div>
</template>

<script>
import { MapContextHolder } from '@/assets/js/map/index';
import { VideoWall } from '@/assets/js/map/tools';
import { HeadingPitchRange, Math as CesiumMath } from 'cesium';
export default {
  data() {
    return {
      src: '/stability/static/videos/demo.mp4',
    };
  },

  async mounted() {
    let viewer = await MapContextHolder.getMap();
    this.viewer = viewer;
  },

  methods: {
    /**
     * 开启视频墙
     */
    showVideoWall() {
      let video = this.$refs.video;
      if (!this.wall) {
        let wall = VideoWall.initDemo(video);
        this.wall = this.viewer.entities.add(wall);
      }
      this.viewer.flyTo(this.wall, {
        offset: new HeadingPitchRange(CesiumMath.toRadians(-90), 0, 0),
      });
      video.play();
    },

    /**
     * 关闭视频墙
     */
    closeVideoWall() {
      if (this.wall) {
        this.viewer.entities.remove(this.wall);
        this.wall = null;
      }
      this.$refs.video.pause();
    },
  },
};
</script>

<style></style>
