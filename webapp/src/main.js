import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import axios from 'axios';

Vue.config.productionTip = false;

/* Configuratio d'axios */
// Nom de domaine et port de l'api Player
const apiHost = 'http://55ad5e57.ngrok.io/';
axios.defaults.baseURL = apiHost;

Vue.prototype.$http = Axios;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
