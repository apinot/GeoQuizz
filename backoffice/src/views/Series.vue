<template>
    <div>
        <p> coucou </p>
    </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      serie: null,
      error: null,
      edit: null,
      series: '',
    };
  },

  created() {
    this.$http.get('/series')
      .then((response) => {
        this.series = response.data.series;
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.loading = false;
      });
  },
};
</script>
