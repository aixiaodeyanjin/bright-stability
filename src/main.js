// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import setup from '@/assets/js/setup'
import WebFont from 'webfontloader'
Vue.config.productionTip = false
Vue.use(setup)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
window.onload = () => void WebFont.load({
  custom: {
    families: ['PingFangSC-Regular', 'zihun100hao-fangfangxianfengti'],
    urls: ['/stability/static/fonts/font.css']
  }
})
