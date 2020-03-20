<template>
<div class="serie">
    <div>
      <div class="row">
        <h1 class="align-center">Série de photos</h1>
      </div>

      <!-- Ville -->
      <div class="row">
          <div class="input-field col ">
            <input
              id="last_name"
              type="text"
              class="validate"
              autofocus="true"
              v-model="currentCity">
            <label for="last_name">Ville</label>
          </div>
      </div>

       <!-- Distance -->
      <div class="row">
          <div class="input-field col ">
            <input
              id="last_name"
              type="number"
              min="0"
              class="validate"
              autofocus="true"
              v-model="currentDist">
            <label for="last_name">Distance (en mètres)</label>
          </div>
      </div>

      <!-- carte -->
      <div class="row">
        <h4>Carte de la serie</h4>
        <div class="row">
          <leaflet :options="leafletOptions"
            @viewchanged="onMapViewChange"
          >
          </leaflet>
        </div>
        <div class="row center-align">
          <button
            @click="defineNewMap"
            class="btn">
            Valider la carte
          </button>
          <button
            @click="createSerie"
            class="btn">
            Créer la serie
          </button>
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
      currentMapPosition: null,
      currentCity: null,
      currentDist: null,
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
      const newserie = {
        ville: this.currentCity,
        dist: this.currentDist,
        map: {
          lat: this.serie.lat,
          dlng: this.serie.lng,
        },
        photos: this.photos,
      };
      this.$http.post('/serie', { newserie }, {
        headers: { Authorization: `bearer ${this.$store.getters.authToken}` },
      })
        .then((response) => {
          this.serie = response.data.serie;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>

<style>
    @import url('https://unpkg.com/leaflet@1.6.0/dist/leaflet.css');
</style>
