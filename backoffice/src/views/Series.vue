<template>
    <div class="row" v-if="loading">
      <spinner></spinner>
    </div>
    <div v-else>
      <p> coucou</p>
      <div v-for="serie in series" :key=serie.id>
          <div> {{serie}} </div>
      </div>
    </div>
</template>

<script>
import Spinner from '../components/Spinner.vue';

export default {

  components: {
    Spinner,
  },
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
