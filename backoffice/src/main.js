import Vue from 'vue';
import axios from 'axios';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

/* Configuration d'axios */
// Nom de domaine et port de l'api Player
const apiHost = 'https://3f4b35a8.ngrok.io/';
axios.defaults.baseURL = apiHost;


// passe le token dans le header si il existe
axios.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem('auth'));

    if (auth) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `bearer ${auth.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axios.defaults.crossDomain = true;
Vue.prototype.$http = axios;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
