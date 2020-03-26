import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import store from '../store';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/Signup.vue'),
  },
  {
    path: '/signin',
    name: 'signin',
    component: () => import('../views/Signin.vue'),
  },
  {
    path: '/signout',
    name: 'signout',
    component: () => import('../views/Signout.vue'),
  },
  {
    path: '/serie/:id',
    name: 'serie',
    component: () => import('../views/Serie.vue'),
    meta: {
      requireAuth: true,
    },
  },
  {
    path: '/newserie',
    name: 'newserie',
    component: () => import('../views/NewSerie.vue'),
    meta: {
      requireAuth: true,
    },
  },
  {
    path: '/series',
    name: 'series',
    component: () => import('../views/Series.vue'),
    meta: {
      requireAuth: true,
    },
  },
  {
    path: '/galerie',
    name: 'galerie',
    component: () => import('../views/Galerie.vue'),
    meta: {
      requireAuth: true,
    },
  },
  {
    path: '/photos/:id',
    name: 'editPhoto',
    component: () => import('../views/EditPhoto.vue'),
    meta: {
      requireAuth: true,
    },
  },
  {
    path: '/upload',
    name: 'upload',
    component: () => import('../views/AddPhoto.vue'),
    meta: {
      requireAuth: true,
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requireAuth)) {
    if (!store.getters.isAuth) {
      next({
        name: 'signin',
        query: { redirect: to.fullPath },
      });
      return;
    }
  }

  next();
});

export default router;
