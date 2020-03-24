<template>
  <div class="home">
    <nav>
      <div class="nav-wrapper red darken-4">
        <a href="#!" class="brand-logo">Backoffice GeoQuizz</a>
        <a href="#" data-target="mobile-demo" class="sidenav-trigger">
          <i class="material-icons">menu</i>
        </a>
        <ul class="right hide-on-med-and-down">
          <template v-if="isAuth">
            <li>
              <router-link class="btn red darken-3 waves-effect waves-light"
              :to="{name: 'galerie'}">Gallerie</router-link>
            </li>
            <li>
              <router-link class="btn red darken-3 waves-effect waves-light"
              :to="{name: 'series'}">Series</router-link>
            </li>
            <li>
              <router-link :to="{name: 'signout'}">
                <button class="btn waves-effect waves-light">
                  Se déconnecter<i class="fas fa-sign-out-alt right"></i>
                </button>
              </router-link>
            </li>
          </template>
          <template v-else>
            <li>
              <router-link class="btn red darken-3 waves-effect waves-light"
              :to="{name: 'signup'}">S'inscrire</router-link>
            </li>
            <li>
              <router-link class="btn red darken-3 waves-effect waves-light"
              :to="{name: 'signin'}">
                Se connecter</router-link>
            </li>
          </template>
        </ul>
      </div>
    </nav>
    <ul class="sidenav" id="mobile-demo">
      <template v-if="isAuth">
        <li>
          <router-link class="btn red darken-3" :to="{name: 'galerie'}">Gallerie</router-link>
        </li>
        <li>
          <router-link class="btn red darken-3" :to="{name: 'series'}">Series</router-link>
        </li>
        <li>
          <router-link class="btn red darken-3" :to="{name: 'signout'}">
            Se déconnecter<i class="fas fa-sign-out-alt"></i>
          </router-link>
        </li>
      </template>
      <template v-else>
        <li>
          <router-link class="btn red darken-3" :to="{name: 'signup'}">S'inscrire</router-link>
        </li>
        <li>
          <router-link class="btn red darken-3" :to="{name: 'signin'}">Se connecter</router-link>
        </li>
      </template>
    </ul>

  </div>
</template>

<script>
export default {
  name: 'Home',
  components: {},
  computed: {
    isAuth() {
      return this.$store.getters.isAuth;
    },
  },
  mounted() {
    window.M.AutoInit();
  },
};
</script>

<style>


</style>
