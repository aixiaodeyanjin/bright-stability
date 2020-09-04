<template>
  <div id="app">
    <div class="header">
      <div class="block calendar">
        <div class="iconfont iconjiezhiriqi"></div>
        <div class="room">
          <div>
            <span v-text="lunar">{{ lunar }}</span>
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
          <div class="text">浦口区汤泉街道</div>
        </div>
      </div>
      <div class="block week">
        <div class="weather">
          <div class="iconfont iconqing" :class="weather"></div>
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
        <div class="direction" :class="{ up: menuShow }" @click="menuShow = !menuShow">
          <div div class="point"></div>
          <div class="bar left-bar"></div>
          <div class="bar right-bar"></div>
        </div>
        <div class="all-menu" v-show="menuShow">
          <div class="item" @click="chooseMenu(item)" :class="{ item_now: index == menuIndex }" v-for="(item, index) in menuList" :key="index">
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
import Stability from '@/pages/stability/index.vue';
import '@/assets/iconfont/iconfont.css';
import '@/assets/css/wending.css';
import moment from 'moment';
import 'moment/locale/zh-cn';
import lunarCalendar from 'lunar-calendar';

export default {
  name: 'App',
  components: {
    Stability,
  },
  data() {
    return {
      nowWeatherInfo: {
        realtime: {},
      },
      menuShow: false,
      menuList: process.env.MENUS,
      menuIndex: 3,
      systemTime: new Date(),
    };
  },
  computed: {
    weather() {
      let wid = parseInt(this.nowWeatherInfo.realtime.wid);
      let icon = '';
      if (wid >= 0 && wid < 8) {
        switch (wid) {
          case 0:
            icon = 'iconqing';
            break;
          case 1:
            icon = 'iconduoyun';
            break;
          case 2:
            icon = 'iconyintian';
            break;
          case 4:
            icon = 'iconleidian';
            break;
          case 5:
          case 6:
            icon = 'icontianqi-';
            break;
          case 7:
            icon = 'iconxiaoyu';
            break;
          default:
            break;
        }
      } else if (wid >= 8 && wid <= 12) {
        icon = 'icondayu';
      } else if ((wid >= 13 && wid <= 17) || wid == 19 || (wid >= 26 && wid <= 28)) {
        icon = 'icontianqi-1';
      } else if (wid >= 21 && wid <= 25) {
        icon = 'icondayu';
      } else {
        icon = 'icontianqi-wumai';
      }
      return icon;
    },
    moment() {
      return moment(this.systemTime);
    },
    date() {
      return this.moment.format('YYYY-MM-DD');
    },
    time() {
      return this.moment.format('HH:mm:ss');
    },
    meridiem() {
      return this.moment.format('A');
    },
    week() {
      return this.moment.format('dddd');
    },
    lunar() {
      let lunar = lunarCalendar.solarToLunar(this.moment.year(), this.moment.month() + 1, this.moment.date());
      return `${lunar.GanZhiYear}(${lunar.zodiac})年${lunar.lunarMonthName}${lunar.lunarDayName}`;
    },
  },
  created() {
    this.getWeatherInfo();
  },
  mounted() {
    this.clockRequestId = this.runClock();
  },
  methods: {
    runClock() {
      this.systemTime = new Date();
      return requestAnimationFrame(this.runClock);
    },
    chooseMenu(item) {
      // 选择菜单
      if (item.url) {
        window.location.href = item.url;
      }
    },
    getCache(key) {
      // 获取缓存数据
      return localStorage.getItem(key);
    },
    getWeatherInfo() {
      // 获取天气信息
      let _this = this;
      let nowCache = JSON.parse(_this.getCache('_bright_weather_today'));
      if (nowCache && this.date == nowCache.setDate) {
        _this.nowWeatherInfo = nowCache.data;
      } else {
        _this.$getApi(process.env.APIS.getWeather).then((result) => {
          if (result.code == 1) {
            _this.nowWeatherInfo = result.data;

            localStorage.setItem(
              '_bright_weather_today',
              JSON.stringify({
                setDate: this.date,
                data: result.data,
              }),
            );
          }
        });
      }
    },
  },
  beforeDestroy() {
    this.clockRequestId && cancelAnimationFrame && cancelAnimationFrame(this.clockRequestId);
  },
};
</script>

<style>
:root {
  font-size: calc(100vw / 19.2);
}
.header .all-menu .item .point {
  width: 0.08rem;
  height: 0.08rem;
  border-radius: 50%;
  background: #00ffff;
  position: absolute;
  right: 0.2rem;
  top: calc(50% - 0.09rem);
}
</style>
