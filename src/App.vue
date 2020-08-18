<template>
  <div id="app">
    <div class="header">
      <div class="block calendar">
        <div class="iconfont iconjiezhiriqi"></div>
        <div class="room">
            <div>
                <span v-text="lunar">{{lunar}}</span>
            </div>
            <div>
                <span v-text="date"></span>
            </div>
        </div>
      </div>
      <div class="line"></div>
      <div class="block clock">
        <div class="time" v-text="time"></div>
        <div class="type">
          <span v-text="meridiem"></span>
        </div>
      </div>
      <div class="title">
        <div class="img"></div>
        <div class="room">
          <img class="logo" src="@/assets/img/header/logo@2x.png" />
          <div class="text">马群街道芝嘉花园</div>
        </div>
      </div>
      <div class="block week">
        <div class="weather">
          <div class="iconfont iconqing" v-if="nowWeatherInfo.realtime.wid == '00'"></div>
          <div class="iconfont iconduoyun" v-else-if="nowWeatherInfo.realtime.wid == '01'"></div>
          <div class="iconfont iconyintian" v-else-if="nowWeatherInfo.realtime.wid == '02'"></div>
          <div class="iconfont iconleidian" v-else-if="nowWeatherInfo.realtime.wid == '04'"></div>
          <div class="iconfont icontianqi-"
              v-else-if="nowWeatherInfo.realtime.wid == '05' || nowWeatherInfo.realtime.wid == '06'"></div>
          <div class="iconfont iconxiaoyu" v-else-if="nowWeatherInfo.realtime.wid == '07'"></div>
          <div class="iconfont icondayu"
              v-else-if="parseInt(nowWeatherInfo.realtime.wid) >= 8 && parseInt(nowWeatherInfo.realtime.wid) <= 12">
          </div>
          <div class="iconfont icontianqi-1"
              v-else-if="parseInt(nowWeatherInfo.realtime.wid) >= 13 && parseInt(nowWeatherInfo.realtime.wid) <= 17">
          </div>
          <div class="iconfont icontianqi-1" v-else-if="nowWeatherInfo.realtime.wid == '19'"></div>
          <div class="iconfont icondayu"
              v-else-if="parseInt(nowWeatherInfo.realtime.wid) >= 21 && parseInt(nowWeatherInfo.realtime.wid) <= 25">
          </div>
          <div class="iconfont icontianqi-1"
              v-else-if="parseInt(nowWeatherInfo.realtime.wid) >= 26 && parseInt(nowWeatherInfo.realtime.wid) <= 28">
          </div>
          <div class="iconfont icontianqi-wumai" v-else></div>
        </div>
        <div class="describe">
          <span v-text="week"></span>
          <span v-text="nowWeatherInfo.realtime.info"></span>
        </div>
      </div>
      <div class="line"></div>
      <div class="block menu">
        <div class="iconfont iconcaidan"></div>
        <div class="text" v-text="menuList[menuIndex].text"></div>
        <div class="direction" :class="{'up': menuShow}" @click="changeMenuShow()">
          <div class="point"></div>
          <div class="bar left-bar"></div>
          <div class="bar right-bar"></div>
        </div>
        <div class="all-menu" v-show="menuShow">
          <div class="item" @click="chooseMenu(item)" :class="{'item_now': index == menuIndex}"
              v-for="(item, index) in menuList" :key="index">
              <span v-text="item.text"></span>
              <div class="point" v-if="index == menuIndex"></div>
          </div>
        </div>
        </div>
      </div>
    <Stability></Stability>
  </div>
</template>

<script>
import Stability from '@/pages/stability/index.vue'
import '@/assets/iconfont/iconfont.css'
import '@/assets/css/wending.css'
import moment from 'moment'
import 'moment/locale/zh-cn'
import lunarCalendar from 'lunar-calendar'

export default {
  name: 'App',
  components: {
    Stability
  },
  data () {
    return {
      nowWeatherInfo: {
        realtime: {}
      },
      menuShow: false,
      menuList: [{
        text: '首页',
        url: 'http://bright.liaodukeji.com/home/index.html'
      }, {
        text: '市容',
        url: 'http://bright.liaodukeji.com/#/1001'
      }, {
        text: '安全',
        url: 'http://bright.liaodukeji.com/#/1002'
      }, {
        text: '稳定',
        url: 'http://xlgc.liaodukeji.com/wending.html'
      }, {
        text: '党建',
        url: 'http://bright.liaodukeji.com/home/partybuild.html'
      }, {
        text: '积分自治',
        url: 'http://bright.liaodukeji.com/home/partyPoint.html'
      }, {
        text: '阵地建设',
        url: 'http://bright.liaodukeji.com/#/1006'
      }],
      menuIndex: 3,
      systemTime: new Date()
    }
  },
  computed: {
    moment () {
      return moment(this.systemTime)
    },
    date () {
      return this.moment.format('YYYY-MM-DD')
    },
    time () {
      return this.moment.format('HH:mm:ss')
    },
    meridiem () {
      return this.moment.format('A')
    },
    week () {
      return this.moment.format('dddd')
    },
    lunar () {
      let lunar = lunarCalendar.solarToLunar(this.moment.year(), this.moment.month() + 1, this.moment.date())
      return `${lunar.GanZhiYear}(${lunar.zodiac})年${lunar.lunarMonthName}${lunar.lunarDayName}`
    }
  },
  created () {
    let _this = this
    _this.getWeatherInfo()
  },
  mounted () {
    this.clockRequestId = this.runClock()
  },
  methods: {
    runClock () {
      this.systemTime = new Date()
      return requestAnimationFrame(this.runClock)
    },
    changeMenuShow () { // 打开菜单
      let _this = this
      _this.menuShow = !_this.menuShow
    },
    chooseMenu (item) { // 选择菜单
      if (item.url) {
        window.location.href = item.url
      }
    },
    getCache (key) { // 获取缓存数据
      return localStorage.getItem(key)
    },
    getWeatherInfo () { // 获取天气信息
      let _this = this
      let nowCache = JSON.parse(_this.getCache('_bright_weather_today'))
      if (nowCache && this.date == nowCache.setDate) {
        _this.nowWeatherInfo = nowCache.data
      } else {
        _this.$getApi(_this.$appConfig.apiList.getWeather).then(result => {
          if (result.code == 1) {
            _this.nowWeatherInfo = result.data

            localStorage.setItem('_bright_weather_today', JSON.stringify({
              setDate: this.date,
              data: result.data
            }))
          }
        })
      }
    }
  },
  beforeDestroy () {
    this.clockRequestId && cancelAnimationFrame && cancelAnimationFrame(this.clockRequestId)
  }

}
</script>

<style lazyload>
:root{
  font-size: calc(100vw / 19.2);
}
.header .all-menu .item .point {
    width: 0.08rem;
    height: 0.08rem;
    border-radius: 50%;
    background: #00FFFF;
    position: absolute;
    right: 0.2rem;
    top: calc(50% - 0.09rem);
}
</style>
