import axios from 'axios'
import Msg from 'vue-message'
export default {
  install (Vue, opts = {}) {
    Vue.use(Msg, {
      text: 'Hello world', duration: 3000, background: 'rgba(7,17,27,0.6)', position: 'center'
    })
    const sysConfig = {
      apiBase: 'http://nbol.liaodukeji.com/api_bright/',
      // apiBase: "http://nb.liaodukeji.com/api_bright/",
      orgId: '57fde62fceb011e9aa9100163e0d9e7f',
      apiList: {
        getAllData: 'bigDataScreem',
        getActivityNum: 'activityNum',
        getGridCounts: 'gridCounts',
        getGridInfo: 'gridInfo',
        getWeather: 'weather',
        getLunarCalendar: 'lunarCalendar'
      }
    }

    const $api = axios.create({
      baseURL: sysConfig.apiBase,
      timeout: 20000
    })

    const $defaultApi = axios.create({})

    Vue.prototype.$getApi = (url, orgId) => {
      return $api.get(url, {params: {'orgId': orgId || sysConfig.orgId}})
        .then(resp => resp.data)
    }

    Vue.prototype.$get = (url, params) => {
      return $defaultApi.get(url, {'params': { ...params }})
        .then(resp => resp.data)
    }

    Vue.prototype.$appConfig = sysConfig
  }
}
