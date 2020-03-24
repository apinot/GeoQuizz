
import Vue from 'vue';
import axios from 'axios';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

/* Configuratio d'axios */
// Nom de domaine et port de l'api Player
const apiHost = 'https://fecab879.ngrok.io';
axios.defaults.baseURL = apiHost;

axios.defaults.crossDomain = true;

Vue.prototype.$http = axios;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
