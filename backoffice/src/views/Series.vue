<template>
  <div>
    <h1 class="center-align">Vos series</h1>
    <div v-if="isError">
      <error></error>
    </div>
    <div v-else>
      <div>
        <div class="center-align">
          <button
            v-on:click="createSerie"
            class="s12 m3 btn waves-effect waves-light red darken-3"
            type="submit"
            name="action"
          ><i class="fas fa-plus left "></i>Créer une nouvelle série</button>
        </div>
        <div class="row">
          <div v-for="serie in series" :key="serie.id">
            <div class="col s12 m6">
              <h4 class="header">{{serie.nom}}</h4>
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
        <div class="row center-align">
          <button class="btn" v-if="series.length < maxNbSerie" @click="getNextSerie">
            <i class="fas fa-chevron-down left"></i>
            Voir plus de photos
          </button>
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
import Error from '../components/Error.vue';

export default {
  components: {
    Error,
  },
  data() {
    return {
      idDelete: '',
      nomDelete: '',
      idSerie: '',
      isError: false,
      error: null,
      edit: null,
      series: '',
      maxNbSerie: -1,
      offset: 0,
    };
  },

  methods: {
    showSerie(id) {
      this.$router.push({ name: 'serie', params: { id } });
    },
    createSerie() {
      this.$router.push({ name: 'newserie' });
    },
    showGallerie() {
      this.$router.push({ name: 'galerie' });
    },
    deleteSerie() {
      this.$store.dispatch('setLoading', true);
      this.$http
        .delete(`/series/${this.idDelete}`)
        .then(() => {
          const index = this.series.findIndex((e) => this.idSerie === e.id);
          this.series.splice(index, 1);
          this.offset -= 1;
          this.maxNbSerie -= 1;
        }).catch((error) => {
          this.isError = true;
          console.log(error);
        }).finally(() => {
          this.$store.dispatch('setLoading', false);
        });
    },
    updateDeleteSerie(id, nom) {
      this.idDelete = id;
      this.nomDelete = nom;
    },
    getNextSerie() {
      if (this.series.length >= this.maxNbSerie) return;
      this.$store.dispatch('setLoading', true);
      this.$http
        .get(`/series?offset=${this.offset}`)
        .then((response) => {
          response.data.series.forEach((p) => { this.series.push(p); });
          this.maxNbSerie = response.data.total;
          this.offset += response.data.series.length;
          this.loading = true;
        })
        .catch((error) => {
          this.isError = true;
          console.log(error);
        })
        .finally(() => {
          this.$store.dispatch('setLoading', false);
        });
    },
  },

  created() {
    this.$store.dispatch('setLoading', true);
    this.$http
      .get('/series')
      .then((response) => {
        this.series = response.data.series;
        this.loading = true;
        this.maxNbSerie = response.data.total;
        this.offset += response.data.series.length;
        this.loading = true;
      })
      .catch((error) => {
        this.isError = true;
        console.log(error);
      })
      .finally(() => {
        this.$store.dispatch('setLoading', false);
      });
  },

  mounted() {
    window.M.AutoInit();
  },
};
</script>

<style>
.card-action, .modal-footer {
  display: flex;
  justify-content: space-between;
}
</style>
