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
      return !!state.token;
    },
    getPartie(state) {
      return state.partie;
    },
  },
  mutations: {
    retrieveToken(state, token, partie) {
      state.token = token;
      state.partie = partie;
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
        context.commit('retrieveToken', token, partie);
        resolve();
      }).catch((error) => {
        console.log(error);
      });
    },

    destroyToken(context) {
      return new Promise((resolve) => {
        if (context.getters.loggedIn) {
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
