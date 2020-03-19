<template>
<div class="serie">
    <div class="row red accent-4 white-text p-5 center-align" v-if="error">
      {{error}}
    </div>
    <div v-if="serie">
      <div class="row">
        <h1 class="align-center">Série de photos</h1>
      </div>
      <div class="row">
        <template v-if="edit === 'ville'">
          <div class="input-field col ">
            <input
              id="last_name"
              type="text"
              class="validate"
              autofocus="true"
              v-model="serie.ville">
            <label for="last_name">Ville</label>
          </div>
          <button class="btn" @click="saveSerie" :disabled="!serie.ville">
              <i class="fas fa-check-square left"></i> Valider
          </button>
        </template>
        <template v-else>
          <p>
            Ville :
            {{serie.ville}}
            <button class="btn" @click="edit = 'ville'">
              <i class="fas fa-pen-square left"></i> Modifier
            </button>
            </p>
        </template>
      </div>
    </div>
    <div class="row" v-if="loading">
      <spinner></spinner>
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
    };
  },
  created() {
    this.$http.get(`/series/${this.idUrlParam}`)
      .then((response) => {
        this.serie = response.data.serie;
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          this.error = 'Désolé, cette série de photos n\'existe pas';
          return;
        }
        this.error = 'Impossible d\'afficher cette série de photos';
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
  methods: {
    saveSerie() {
      this.loading = true;
      this.$http.put(`/series/${this.serie.id}`, { rules: this.serie }, {
        headers: { Authorization: `bearer ${this.$store.getters.authToken}` },
      })
        .then(() => {

        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.$router.push({ name: 'signin' });
            return;
          }

          this.error = 'Impossible de mettre à jour les données';
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
