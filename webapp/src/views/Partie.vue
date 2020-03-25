<template>
  <div>
    <div v-if="errored">
      <error></error>
    </div>
    <div v-else>
      <div v-if="loadCarte && loadPhoto">
        <div v-if="enCours">
          <photo-carte :options="options"
            :markers="markers"
            :photo="photoActuelle"
            @point="updateMarker">
          </photo-carte>
          <div class="container">
            <div class="card row">
              <p class="col s6 m2"> Score: {{this.score}}</p>
              <p class="col s6 m2">Temps: {{timer}}s</p>
              <button
                v-on:click="nextPhoto"
                class="col s12 m2 offset-m5 btn red darken-4 waves-effect waves-light"
                type="submit" name="action">
                Valider
              </button>
            </div>
          </div>
        </div>
        <div v-else>
          <fin-partie :score="score"></fin-partie>
        </div>
      </div>
      <div v-else>
        <spinner></spinner>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-restricted-properties */
import getDistance from 'geolib/es/getDistance';
import PhotoCarte from '../components/partie/PhotoCarte.vue';
import FinPartie from '../components/partie/FinPartie.vue';
import Spinner from '../components/load/Spinner.vue';
import Error from '../components/load/Error.vue';

export default {
  name: 'Partie',
  components: {
    PhotoCarte,
    FinPartie,
    Spinner,
    Error,
  },

  data() {
    return {
      // chargement
      loadPhoto: false,
      loadCarte: false,
      errored: false,
      // timer
      timer: 20,
      timeoutTimer: '',
      // Leaflet attribut
      markers: [],
      // données de la partie
      enCours: true,
      serie: 0,
      photos: [],
      numeroPhotoActuelle: -1,
      score: 0,
      // coordonée du point sur la carte
      dateAffichagePhoto: null,
      lat: '',
      lng: '',
    };
  },
  methods: {
    /**
     * Change de photo lorsque l'utilisateur sur valider
     */
    nextPhoto() {
      // verifier qu'il a placé un point
      if (this.markers.length === 0) return;

      // calcul des points
      this.addPointToScore();

      clearTimeout(this.timeoutTimer);
      this.timer = 20;
      this.countDownTimer();
      // s'il n'y a plus de photo, afficher le score final
      if (this.numeroPhotoActuelle === this.photos.length - 1) this.enCours = false;

      // afficher l'autre photo
      this.numeroPhotoActuelle += 1;
      // reset du timer
      this.dateAffichagePhoto = new Date();

      // remetre les valeurs par défaut
      this.markers = [];
    },

    /**
     * Calcul les points qui vont être additionner au score total
     * cela prend en compte la distance entre le marker et les coordonées de l'image
     * et le temps
     */
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

    /**
     * Enregistre la position du marler lors du clique
     */
    updateMarker(event) {
      this.markers = [event];
      this.lat = event.position.lat;
      this.lng = event.position.lng;
    },

    /**
     * Affiche le timer
     */
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
    // optention de toute les photos
    this.$http
      .get(`/parties/${this.$store.getters.getPartie}/photos`, {
        headers: { Authorization: `Bearer ${this.$store.getters.getToken}` },
      }).then((response) => {
        this.photos = response.data.partie.photos;
        this.numeroPhotoActuelle = 0;
        this.dateAffichagePhoto = new Date();
        this.errored = false;
        this.loadPhoto = true;
      }).catch((error) => {
        this.errored = true;
        console.log(error);
      });

    // optention de la series
    this.$http
      .get(`/parties/${this.$store.getters.getPartie}/series`, {
        headers: { Authorization: `Bearer ${this.$store.getters.getToken}` },
      }).then((response) => {
        this.serie = response.data.serie;
        this.loadCarte = true;
        this.errored = false;
      }).catch((error) => {
        this.errored = true;
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
