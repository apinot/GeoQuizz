<template>
  <div>
    <h3>Liste de serie</h3>
    <div v-if="isError">
      <error></error>
    </div>
    <div v-else>
      <div class="row" v-if="!loading">
        <spinner></spinner>
      </div>
      <div v-else>
        <button
          v-on:click="createSerie"
          class="s12 m3 btn waves-effect waves-light"
          type="submit"
          name="action"
        >Créer une nouvelle série</button>
        <button
          v-on:click="showGallerie"
          class="s12 m3 btn waves-effect waves-light"
          type="submit"
          name="action"
        >Voir la gallerie</button>
        <div class="row">
          <div v-for="serie in series" :key="serie.id">
            <div class="col s12 m6">
              <h2 class="header">{{serie.nom}}</h2>
              <div class="card">
                <div class="card-content">
                  <h5>Ville</h5>
                  <p>{{serie.ville}}</p>
                  <h5>Description</h5>
                  <p>{{serie.descr}}</p>
                </div>
                <div class="card-action">
                  <a v-on:click="showSerie(serie._id)"
                    class="s12 m3 waves-effect waves-light"
                    type="submit"
                    name="action"
                  >Modifier</a>
                  <a v-on:click="updateDeleteSerie(serie._id, serie.nom)"
                  data-target="modal1"
                  class="s12 m3 waves-effect
                  waves-light modal-trigger
                  red-text text-darken-2">supprimer</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Structure -->
    <div id="modal1" class="modal">
      <div class="modal-content">
        <h4>Suppression</h4>
        <p>Voulez-vous vraiment supprimer la serie "{{nomDelete}}"</p>
      </div>
      <div class="modal-footer">
        <a v-on:click="deleteSerie"
        class="modal-close waves-effect waves-green btn-flat">Oui</a>
        <a class="modal-close waves-effect waves-green btn-flat">Non</a>
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
      idDelete: '',
      nomDelete: '',
      idSerie: '',
      loading: false,
      isError: false,
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
    createSerie() {
      this.$router.push({ name: 'newserie' });
    },
    showGallerie() {
      this.$router.push({ name: 'galerie' });
    },
    deleteSerie() {
      this.loading = false;
      this.$http
        .delete(`/series/${this.idDelete}`)
        .then((response) => {
          if (response) {
            this.$http
              .get('/series')
              .then((response2) => {
                this.series = response2.data.series;
                this.loading = true;
              })
              .catch((error) => {
                this.isError = true;
                console.log(error);
              });
          }
        }).catch((error) => {
          this.isError = true;
          console.log(error);
        }).finnaly(() => {
          this.loading = true;
        });
    },
    updateDeleteSerie(id, nom) {
      this.idDelete = id;
      this.nomDelete = nom;
    },
  },

  created() {
    this.$http
      .get('/series')
      .then((response) => {
        this.series = response.data.series;
        this.loading = true;
      })
      .catch((error) => {
        this.isError = true;
        console.log(error);
      });
  },

  mounted() {
    // eslint-disable-next-line no-undef
    M.AutoInit();
  },
};
</script>

<style>
.card-action, .modal-footer {
  display: flex;
  justify-content: space-between;
}
</style>
