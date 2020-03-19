<template>
  <div>
    <h3>Liste de serie</h3>
    <div v-if="isError">
      <error></error>
    </div>
    <div v-else>
      <div class="row" v-if="!isLoad">
        <spinner></spinner>
      </div>
      <div v-else v-for="serie in series" :key="serie.id">
        <div class="container">
          <div class="row">
            <div class="col s12 m3">{{serie.nom}}</div>
            <div class="col s12 m3">{{serie.description}}</div>
            <div class="col s12 m3">{{serie.ville}}</div>
            <button
              v-on:click="showSerie(serie._id)"
              class="s12 m3 btn waves-effect waves-light"
              type="submit"
              name="action"
            >Modifier</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Spinner from '../components/Spinner.vue';
import Error from '../components/Error.vue';

export default {
  components: {
    Spinner,
    Error,
  },
  data() {
    return {
      idSerie: '',
      isLoad: false,
      isError: false,
      serie: null,
      error: null,
      edit: null,
      series: '',
    };
  },

  methods: {
    showSerie(id) {
      console.log(id);
      this.$router.push({ name: 'serie', params: { id } });
    },
  },

  created() {
    this.$http
      .get('/series')
      .then((response) => {
        this.series = response.data.series;
        this.isLoad = true;
      })
      .catch((error) => {
        this.isError = true;
        console.log(error);
      });
  },
};
</script>
