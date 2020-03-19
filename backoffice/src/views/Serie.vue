<template>
<div class="serie">
    <div v-if="serie"></div>
    <div v-else>
        Désolé, cette série n'existe pas
    </div>
</div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      serie: null,
    };
  },
  created() {
    this.$http.get(`/series/${this.idUrlParam}`)
      .then((response) => {
        // TODO EN cours
        this.serie = response.data;
      })
      .catch(() => {
        // TODO
      })
      .finally(() => {
        this.loading = false;
      });
  },
  computed: {
    idUrlParam() {
      return this.$route.params.id;
    },
  },
};
</script>
