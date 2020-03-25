<template>
<div class="serie">
    <div>
      <div class="row">
        <h1 class="center-align">Série de photos</h1>
      </div>
     <div class="container">
        <div class="row">
          <div class="input-field col s12">
            <input
            type="text"
            v-model="nom">
            <label>Nom de la serie</label>
          </div>
          <div class="input-field col s12">
            <textarea
              class="materialize-textarea"
              v-model="descr">
            </textarea>
            <label>Description</label>
          </div>
        </div>

        <div class="row">
          <div class="input-field col s6">
            <input
            type="text"
            v-model="ville">
            <label>Ville</label>
          </div>
          <div class="input-field col s6">
            <input
            type="number"
            min="0"
            v-model="dist">
            <label>Distance</label>
            <small>en mètre</small>
          </div>
        </div>
      </div>

      <!-- TODO valider la carte-->
      <!-- carte -->
      <div class="row">
        <h4 class="center-align">Carte de la serie</h4>
        <div class="container">
          <leaflet :options="leafletOptions"
            @viewchanged="onMapViewChange"
          >
          </leaflet>
        </div>
        <div class="row center-align">
          <div class="center-align">
            <button
              @click="defineNewMap"
              class="btn red darken-3 waves-effect waves-light">
              Valider la carte <i class="fas fa-map-marked-alt left"></i>
            </button>
          </div>
          <div class="center-align">
            <button
              @click="createSerie"
              class="btn red darken-3 waves-effect waves-light">
              Créer la serie <i class="fas fa-chevron-circle-right left"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Photos -->
    <div class="row">
      <!-- TODO ici afficher les photos -->
    </div>
</div>
</template>

<script>
import Leaflet from 'easy-vue-leaflet';

export default {
  components: {
    Leaflet,
  },
  data() {
    return {
      serie: {
        map: {
          lat: 48.6880756,
          lng: 6.1384176,
          zoom: 14,
        },
      },
      nom: '',
      descr: '',
      currentMapPosition: null,
      ville: null,
      dist: null,
      photos: [],
    };
  },
  computed: {
    idUrlParam() {
      return this.$route.params.id;
    },
    leafletOptions() {
      if (!this.serie) return null;
      return {
        view: {
          lat: this.serie.map.lat,
          lng: this.serie.map.lng,
          zoom: this.serie.map.zoom,
        },
      };
    },
  },
  methods: {
    onMapViewChange(event) {
      this.currentMapPosition = {
        lat: event.view.center.lat,
        lng: event.view.center.lng,
        zoom: event.view.zoom,
      };
      this.mapChanged = true;
    },
    defineNewMap() {
      if (!this.currentMapPosition) return;
      this.serie.map = this.currentMapPosition;
    },
    createSerie() {
      this.$store.dispatch('setLoading', true);
      const newSerie = {
        ville: this.ville,
        nom: this.nom,
        descr: this.descr,
        dist: this.dist,
        map: {
          lat: this.currentMapPosition.lat,
          lng: this.currentMapPosition.lng,
          zoom: this.currentMapPosition.zoom,
        },
        photos: this.photos,
      };
      this.$http.post('/series', newSerie)
        .then((response) => {
          this.serie = response.data.serie;
          this.$router.push({ name: 'series' });
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.$store.dispatch('setLoading', false);
        });
    },
  },
};
</script>

<style>
    @import url('https://unpkg.com/leaflet@1.6.0/dist/leaflet.css');
</style>
