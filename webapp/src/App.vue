
<template>
  <div id="app">
    <router-view />
  </div>
</template>


<script>

export default {
  data() {
    return {};
  },

  created() {
    this.$store.dispatch('retrieveToken', response.data);
    console.log(`a is: ${this.a}`);
  },
};
</script>
