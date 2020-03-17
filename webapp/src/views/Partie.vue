<template>
  <div>
    <div class="row">
      <img class="materialboxed col s12 m4 l2" :src="photoActuelle.url" v-if="photoActuelle" />
      <leaflet
        v-if="options"
        class="col s12 m8 l10"
        :options="options"
        :markers="markers"
        @mapclick="saveLatLngClick"
      />
    </div>
    <div class="container">
      <div class="card row">
        <p class="col s6 m2"> Score: {{this.score}}</p>
        <p class="col s6 m2">Temps: {{timer}} s</p>
        <button
          v-on:click="nextPhoto"
          class="col s12 m2 offset-m5 btn waves-effect waves-light"
          type="submit" name="action">
          Valider
          <i class="material-icons right">send</i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-restricted-properties */
import Leaflet from 'easy-vue-leaflet';
import getDistance from 'geolib/es/getDistance';

export default {
  name: 'Partie',
  components: {
    Leaflet,
  },

  data() {
    return {
      // timer
      timer: 20,
      timeoutTimer: '',
      // Leaflet attribut
      markers: [],
      token: '',
      // données de la partie
      serie: 0,
      photos: [],
      numeroPhotoActuelle: -1,
      score: 0,
      // coordonée du point sur la carte
      lat: '',
      lng: '',
      dateAffichagePhoto: null,
    };
  },
  methods: {
    // TODO passe à la prochaine photo lorsque l'utlisateur clique sur un lieu
    nextPhoto() {
      clearTimeout(this.timeoutTimer);
      this.timer = 20;
      this.countDownTimer();
      // s'il n'y a plus de photo, afficher le score final
      // verifier qu'il a placé un point
      if (this.markers.length === 0) return;

      // calcul des points
      this.addPointToScore();

      if (this.numeroPhotoActuelle === this.photos.length - 1) return;

      // afficher l'autre photo
      this.numeroPhotoActuelle += 1;
      // reset du timer
      this.dateAffichagePhoto = new Date();


      // remetre les valeurs par défaut
      this.markers = [];
    },

    // ajout les points
    addPointToScore() {
      if (!this.photoActuelle) return;
      const point1 = {
        latitude: this.photoActuelle.position.lat,
        longitude: this.photoActuelle.position.lng,
      };
      const point2 = {
        latitude: this.lat,
        longitude: this.lng,
      };
      // calcule du temps de réposne
      const tps = new Date().getUTCSeconds() - this.dateAffichagePhoto.getUTCSeconds();
      let multiplicateur = 0;
      if (tps < 20) multiplicateur = 1;
      if (tps < 10) multiplicateur = 2;
      if (tps < 5) multiplicateur = 4;

      // calcul des points en fonction de la distance du point placé et des coordonées de la photo
      const distance = getDistance(point1, point2);

      let res = 0;
      if (distance < this.serie.dist * 3) res = 1;
      if (distance < this.serie.dist * 2) res = 3;
      if (distance < this.serie.dist) res = 5;

      this.score += (res * multiplicateur);
    },

    saveLatLngClick(event) {
      this.lat = event.position.lat;
      this.lng = event.position.lng;
      this.markers = [
        {
          position: {
            lat: this.lat,
            lng: this.lng,
          },
        },
      ];
    },

    countDownTimer() {
      if (this.timer > 0) {
        this.timeoutTimer = setTimeout(() => {
          this.timer -= 1;
          this.countDownTimer();
        }, 1000);
      }
    },

  },

  created() {
    this.token = this.$store.getters.getToken;
    this.$http
      .get(`/parties/${this.$store.getters.getPartie}/photos`, {
        headers: { Authorization: `Bearer ${this.token}` },
      }).then((response) => {
        this.photos = response.data.partie.photos;
        this.numeroPhotoActuelle = 0;
        this.dateAffichagePhoto = new Date();
      }).catch((error) => {
        console.log(error);
      });

    this.$http
      .get(`/parties/${this.$store.getters.getPartie}/series`, {
        headers: { Authorization: `Bearer ${this.token}` },
      }).then((response) => {
        this.serie = response.data.serie;
      }).catch((error) => {
        console.log(error);
      });

    this.countDownTimer();
  },

  computed: {
    photoActuelle() {
      if (this.numeroPhotoActuelle < 0) return null;
      return this.photos[this.numeroPhotoActuelle];
    },
    options() {
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
};
</script>

<style>
@import url("https://unpkg.com/leaflet@1.6.0/dist/leaflet.css");
</style>
