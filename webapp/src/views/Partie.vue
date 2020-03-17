<template>
  <div>
    <p>je suis dans la partie</p>
  </div>
</template>

<script>
export default {
  name: 'Partie',

  data() {
    return {
      token: '',
      partie: '',
    };
  },

  created() {
    this.tokent = this.$store.getter('getToken');
    this.partie = this.$store.getter('getPartie');
  },
};
</script>
