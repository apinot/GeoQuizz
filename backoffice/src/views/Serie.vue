<template>
<div class="serie">
    <div class="row red accent-4 white-text p-5 center-align" v-if="error">
      {{error}}
    </div>
    <div v-if="serie">
      <div class="row">
        <h1 class="align-center">
          Série de photos
        </h1>
      </div>

      <!-- Nom -->
      <div class="row">
        <template v-if="currentNom !== null">
          <div class="input-field col ">
            <input
              id="last_name"
              type="text"
              class="validate"
              autofocus="true"
              v-model="currentNom">
            <label for="last_name">Nom</label>
          </div>
          <button
            class="btn"
            @click="defineNom"
            :disabled="!currentNom">
              Valider
          </button>
        </template>
        <template v-else>
          <h4>Nom de la serie</h4>
          <div class="row">
            <span style="font-size: 1.5rem; margin-right: 1.5rem;">
              {{serie.nom}}
            </span>
            <button class="btn" @click="currentNom = serie.nom">
              <i class="fas fa-pen-square left"></i> Modifier
            </button>
          </div>
        </template>
      </div>

      <!-- description -->
      <div class="row">
        <template v-if="currentDescr !== null">
          <div class="input-field col ">
             <textarea
              id="last_name"
              type="text"
              class="materialize-textarea"
              autofocus="true"
              v-model="currentDescr"></textarea>
            <label for="last_name">Description</label>
          </div>
          <button
            class="btn"
            @click="defineDescr"
            :disabled="!currentDescr">
              Valider
          </button>
        </template>
        <template v-else>
          <h4>Description</h4>
          <div class="row">
            <span style="font-size: 1.5rem; margin-right: 1.5rem;">
              {{serie.descr}}
            </span>
            <button class="btn" @click="currentDescr = serie.descr">
              <i class="fas fa-pen-square left"></i> Modifier
            </button>
          </div>
        </template>
      </div>

      <!-- Ville -->
      <div class="row">
        <template v-if="currentCity !== null">
          <div class="input-field col ">
            <input
              id="last_name"
              type="text"
              class="validate"
              autofocus="true"
              v-model="currentCity">
            <label for="last_name">Ville</label>
          </div>
          <button
            class="btn"
            @click="defineVille"
            :disabled="!currentCity">
              Valider
          </button>
        </template>
        <template v-else>
          <h4>Ville</h4>
          <div class="row">
            <span style="font-size: 1.5rem; margin-right: 1.5rem;">
              {{serie.ville}}
            </span>
            <button class="btn" @click="currentCity = serie.ville">
              <i class="fas fa-pen-square left"></i> Modifier
            </button>
          </div>
        </template>
      </div>

       <!-- Distance -->
      <div class="row">
        <template v-if="currentDist !== null">
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
          <button
            class="btn"
            @click="defineDist"
            :disabled="!currentDist">
              Valider
          </button>
        </template>
        <template v-else>
          <h4>Distance de perfection</h4>
          <div class="row">
            <span style="font-size: 1.5rem; margin-right: 1.5rem;">
              {{serie.dist}} mètres
            </span>
            <button class="btn" @click="currentDist = serie.dist">
              <i class="fas fa-pen-square left"></i> Modifier
            </button>
          </div>
        </template>
      </div>

      <!-- carte -->
      <div class="row">
        <h4>Carte de la serie</h4>
        <div class="row">
          <leaflet :options="leafletOptions"
            :markers="photos"
            :disabled="!editMap"
            @viewchanged="onMapViewChange"
          >
          </leaflet>
        </div>
        <div class="row center-align">
          <button
            v-if="editMap"
            @click="defineNewMap"
            class="btn">
            Définir cette vue comme nouvelle carte
          </button>
          <button  class="btn" @click="editMap = true" v-else>
            Modifier la carte
          </button>
        </div>
      </div>

      <!-- Photos -->
      <div class="row">
      <h4>Photos</h4>
      <div class="row" v-if="photos.length <= 0">Cette série ne contient pas de photos</div>
      <div class="row" v-else>
        <div class="col col s12 m8 l6 offset-m2 offset-l3" v-for="photo in photos" :key="photo.id">
          <div class="card">
            <div class="card-image">
              <img :src="photo.url">
            </div>
            <div class="card-content">
              <p>{{photo.desc}}</p>
              <!-- ICI les action -->
              <!-- TODO en cours -->
            </div>
          </div>
        </div>
      </div>
    </div>
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
      serie: null,
      photos: [],
      error: null,
      editMap: false,
      currentMapPosition: null,
      currentDescr: null,
      currentNom: null,
      currentCity: null,
      currentDist: null,
    };
  },
  created() {
    this.$store.dispatch('setLoading', true);
    this.$http.get(`/series/${this.idUrlParam}`, {
      headers: { Authorization: `bearer ${this.$store.getters.authToken}` },
    })
      .then((response) => {
        this.serie = response.data.serie;

        return this.$http(`/series/${this.idUrlParam}/photos`, {
          headers: { Authorization: `bearer ${this.$store.getters.authToken}` },
        });
      })
      .then((response) => {
        this.photos = response.data.serie.photos;
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          this.error = 'Désolé, cette série de photos n\'existe pas';
          return;
        } if (error.response && error.response.status === 401) {
          this.$router.push({ name: 'signin', query: { redirect: this.$route.fullPath } });
          return;
        }
        this.error = 'Impossible d\'afficher cette série de photos';
      })
      .finally(() => {
        this.$store.dispatch('setLoading', false);
      });
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
    isLoading() {
      return this.$store.getters.isLoading;
    },
  },
  methods: {
    saveSerie() {
      this.$store.dispatch('setLoading', true);
      this.$http.put(`/series/${this.serie.id}`, { rules: this.serie }, {
        headers: { Authorization: `bearer ${this.$store.getters.authToken}` },
      })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.$router.push({ name: 'signin', query: { redirect: this.$route.fullPath } });
            return;
          }

          this.error = 'Impossible de mettre à jour les données';
        })
        .finally(() => {
          this.$store.dispatch('setLoading', false);
        });
    },
    onMapViewChange(event) {
      this.currentMapPosition = {
        lat: event.view.center.lat,
        lng: event.view.center.lng,
        zoom: event.view.zoom,
      };
    },
    defineNewMap() {
      if (!this.currentMapPosition || !this.editMap || this.isLoading) return;
      this.serie.map = this.currentMapPosition;
      this.currentMapPosition = null;
      this.editMap = false;
      this.saveSerie();
    },
    defineVille() {
      if (!this.currentCity || this.isLoading) return;
      this.serie.ville = this.currentCity;
      this.currentCity = null;
      this.saveSerie();
    },
    defineDist() {
      if (!this.currentDist || this.isLoading) return;
      this.serie.dist = this.currentDist;
      this.currentDist = null;
      this.saveSerie();
    },
    defineDescr() {
      if (!this.currentDescr || this.isLoading) return;
      this.serie.descr = this.currentDescr;
      this.currentDescr = null;
      this.saveSerie();
    },
    defineNom() {
      if (!this.currentNom || this.isLoading) return;
      this.serie.nom = this.currentNom;
      this.currentNom = null;
      this.saveSerie();
    },
  },
};
</script>

<style>
    @import url('https://unpkg.com/leaflet@1.6.0/dist/leaflet.css');
</style>
