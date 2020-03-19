import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    auth: JSON.parse(localStorage.getItem('auth')) || null,
  },
  getters: {
    isAuth(state) {
      return !!state.auth;
    },
    authUser(state) {
      return state.auth ? state.auth.user : null;
    },
    authToken(state) {
      return state.auth ? state.auth.token : null;
    },
  },
  mutations: {
    setAuth(state, data) {
      state.auth = data;
    },
  },
  actions: {
    signin(context, data) {
      if (!data.user || !data.token) return;
      localStorage.setItem('auth', JSON.stringify(data));
      context.commit('setAuth', data);
    },
    signout(context) {
      localStorage.removeItem('auth');
      context.commit('setAuth', null);
    },
  },
});
