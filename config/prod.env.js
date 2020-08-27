'use strict'
module.exports = {
  NODE_ENV: '"production"',
  MENUS: JSON.stringify([{
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
  }]),
  baseURL: '"http://nbol.liaodukeji.com/api_bright/"',
  ORG_ID: '"57fde62fceb011e9aa9100163e0d9e7f"',
  APIS: JSON.stringify({
    getAllData: 'bigDataScreem',
    getActivityNum: 'activityNum',
    getGridCounts: 'gridCounts',
    getGridInfo: 'gridInfo',
    getWeather: 'weather',
    getLunarCalendar: 'lunarCalendar'
  })
}
