<template>
  <div class="home">
    <h1>Back-office GeoQuizz</h1>
    <template v-if="isAuth">
        <router-link class="btn" :to="{name: 'signout'}">Se déconnecter</router-link>
    </template>
    <template v-else>
        <router-link class="btn" :to="{name: 'signup'}">S'inscrire</router-link>
        <router-link class="btn" :to="{name: 'signin'}">Se connecter</router-link>
    </template>
  </div>
</template>

<script>

export default {
  name: 'Home',
  components: {
  },
  computed: {
    isAuth() {
      return this.$store.getters.isAuth;
    },
  },
};
</script>
