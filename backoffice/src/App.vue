<template>
  <div id="app">
    <nav>
      <div class="nav-wrapper red darken-4">
        <a class="brand-logo">Backoffice GeoQuizz</a>
        <a href="#" data-target="mobile-demo" class="sidenav-trigger">
        <i class="material-icons">menu</i></a>
        <ul class="right hide-on-med-and-down">
          <template v-if="isAuth">
            <li>
              <router-link
                class="btn white darken-3 red-text text-darken-3 waves-effect waves-light"
                :to="{name: 'home'}">
                <i class="fas fa-home left" style="line-height: inherit">
                </i> Accueil
              </router-link>
            </li>
            <li>
              <router-link
                class="btn white darken-3 red-text text-darken-3 waves-effect waves-light"
                :to="{name: 'galerie'}">
                <i class="fas fa-images left" style="line-height: inherit"></i> Gallerie
              </router-link>
            </li>
            <li>
              <router-link
                class="btn white darken-3 red-text text-darken-3 waves-effect waves-light"
                :to="{name: 'series'}">
                <i class="fas fa-list-alt left" style="line-height: inherit"></i> Series
                </router-link>
            </li>
            <li>
              <router-link
              class="btn white darken-3 red-text text-darken-3 waves-effect waves-light"
                :to="{name: 'signout'}">
                <i class="fas fa-sign-out-alt left icon" style="line-height: inherit"></i>
                 Déconnexion
              </router-link>
            </li>
          </template>
          <template v-else>
            <li>
              <router-link
              class="btn white darken-3 red-text text-darken-3 waves-effect waves-light"
                :to="{name: 'home'}">Accueil
                <i class="fas fa-home right" style="line-height: inherit"></i>
              </router-link>
            </li>
            <li>
              <router-link
              class="btn white darken-3 red-text text-darken-3 waves-effect waves-light"
                :to="{name: 'signup'}">S'inscrire
                <i class="fas fa-user-plus right" style="line-height: inherit"></i>
              </router-link>
            </li>
            <li>
              <router-link
              class="btn white darken-3 red-text text-darken-3  waves-effect waves-light"
                :to="{name: 'signin'}">Se connecter
                <i class="fas fa-sign-in-alt right" style="line-height: inherit"></i>
              </router-link>
            </li>
          </template>
        </ul>
      </div>
    </nav>
    <ul class="sidenav" id="mobile-demo">
      <template v-if="isAuth">
        <li>
          <router-link class="btn red darken-3 waves-effect waves-light"
            :to="{name: 'home'}">Accueil
            <i class="fas fa-home" style="color: white"></i>
          </router-link>
        </li>
        <li>
          <router-link class="btn red darken-3" :to="{name: 'galerie'}">
            Gallerie <i class="fas fa-images" style="color: white"></i>
            </router-link>
        </li>
        <li>
          <router-link class="btn red darken-3" :to="{name: 'series'}">
            Series <i class="fas fa-list-alt" style="color: white"></i>
            </router-link>
        </li>
        <li>
          <router-link class="btn red darken-3" :to="{name: 'signout'}">
            Se déconnecter<i class="fas fa-sign-out-alt" style="color: white"></i>
          </router-link>
        </li>
      </template>
      <template v-else>
        <li>
          <router-link class="btn red darken-3 waves-effect waves-light"
            :to="{name: 'home'}">Accueil
            <i class="fas fa-home" style="color: white"></i>
          </router-link>
        </li>
        <li>
          <router-link class="btn red darken-3" :to="{name: 'signup'}">
            S'inscrire
            <i class="fas fa-user-plus" style="color: white"></i>
          </router-link>
        </li>
        <li>
          <router-link class="btn red darken-3" :to="{name: 'signin'}">
            Se connecter
            <i class="fas fa-sign-in-alt" style="color: white"></i>
          </router-link>
        </li>
      </template>
    </ul>
    <!-- loader -->
    <div class="progress" v-if="isLoading">
      <div class="indeterminate"></div>
    </div>

    <!-- router view -->
    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    isLoading() {
      return this.$store.getters.isLoading;
    },
    isAuth() {
      return this.$store.getters.isAuth;
    },
  },
  mounted() {
    window.M.AutoInit();
  },
};
</script>

<style scoped>
.progress {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  margin: 0;
};

#home {
  margin-left: 1em !important;
  margin-right: 1em !important;
}
</style>
