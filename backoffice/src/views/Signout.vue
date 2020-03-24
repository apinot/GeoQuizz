<template>
  <div class="container">
      <div class="row">
        <div class="col s12 m8 offset-m2 l6 offset-l3">
          <div class="card-panel teal center-align">
              <span class="white-text">
                  Déconnexion en cours ...
              </span>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
export default {
  created() {
    this.$store.dispatch('setLoading', true);
    setTimeout(() => {
      this.$store.dispatch('signout', true);
      this.$router.push({ name: 'home' });
      this.$store.dispatch('setLoading', false);
    }, 1000);
  },
};
</script>
