<template>
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
</template>

<script>
export default {

}
</script>

<style>

</style>
