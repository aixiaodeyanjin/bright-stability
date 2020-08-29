import axios from 'axios';
import Msg from 'vue-message';
export default {
  install(Vue, opts = {}) {
    Vue.use(Msg, {
      text: 'Hello world',
      duration: 3000,
      background: 'rgba(7,17,27,0.6)',
      position: 'center',
    });
    const $api = axios.create({
      baseURL: process.env.baseURL,
      timeout: 20000,
    });
    const $defaultApi = axios.create({});
    Vue.prototype.$getApi = (url, orgId) => {
      return $api.get(url, { params: { orgId: orgId || process.env.ORG_ID } }).then((resp) => resp.data);
    };
    Vue.prototype.$get = (url, params) => {
      return $defaultApi.get(url, { params: { ...params } }).then((resp) => resp.data);
    };
  },
};
