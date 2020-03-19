<template>
  <div id="app">
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
</style>
