import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: localStorage.getItem('token') || null,
    partie: localStorage.getItem('partie') || null,
  },
  getters: {
    getToken(state) {
      return state.token;
    },
    getPartie(state) {
      return state.partie;
    },
  },
  mutations: {
    retrieveToken(state, data) {
      state.token = data.token;
      state.partie = data.partie;
    },
    destroyToken(state) {
      state.token = null;
      state.partie = null;
    },
  },
  actions: {
    retrieveToken(context, credentials) {
      return new Promise((resolve) => {
        const { token, partie } = credentials;
        localStorage.setItem('token', token);
        localStorage.setItem('partie', partie);
        context.commit('retrieveToken', { token, partie });
        resolve();
      }).catch((error) => {
        console.log(error);
      });
    },

    destroyToken(context) {
      return new Promise((resolve) => {
        if (context.getters.getToken) {
          localStorage.removeItem('token');
          localStorage.removeItem('partie');
          context.commit('destroyToken');
          resolve();
        }
      });
    },
  },
  modules: {
  },
});
