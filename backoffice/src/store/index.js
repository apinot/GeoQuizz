import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    auth: JSON.parse(localStorage.getItem('auth')) || null,
    loading: false,
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
    isLoading(state) {
      return state.loading;
    },
  },
  mutations: {
    setAuth(state, data) {
      state.auth = data;
    },
    setLoading(state, loading) {
      state.loading = loading;
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
    setLoading(context, loading) {
      context.commit('setLoading', loading);
    },
  },
});
