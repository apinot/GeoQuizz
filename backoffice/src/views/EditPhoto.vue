<template>
  <div>
    <div class="row center-align head">
      <h1>Modification d'une image</h1>
    </div>
    <div class="container">
      <div class="row">
        <div class="input-field col s12">
          <input id="text" type="text" class="validate" v-if="photo" v-model="photo.desc"/>
          <label for="text" class="active">Description</label>
        </div>
      </div>
    </div>
      <div class="container">
        <h4 class="center-align">Géolocation de la photo</h4>
        <leaflet
          class="col s12"
          v-if="options"
          :options="options"
          :markers="markers"
          @mapclick="saveLatLngClick"
          :disabled="!!position"
        />
        <div class="row left-align">
        Localisation<br>
        <small>Cliquez sur la carte pour positionner la photo, cela va faire apparaître
          un marker.</small>
      </div>
      <div class="row">
        <div class="center-align">
          <button v-if="!!position" class="btn red darken-3 waves-effect waves-light"
            @click="position = null">
            <i class="fas fa-map-marker-alt left"></i> Changer la localisation
          </button>
        </div>
      </div>
    </div>
    <div class="row red accent-4 white-text p-5 center-align" v-if="error">
      {{error}}
    </div>
    <div class="row center-align mb-5">
      <button
        v-on:click="savePhoto"
        class="s12 m3 btn red darken-3 waves-effect waves-light"
        type="submit"
        name="action"
        :disabled="isLoading"
      >Modifier<i class="fas fa-chevron-circle-right left"></i>
      </button>
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
      options: {
        view: {
          lat: 48.8587741,
          lng: 2.2069771,
          zoom: 6,
        },
      },
      photo: '',
      position: null,
      error: '',
    };
  },
  mounted() {
    window.M.AutoInit();
  },
  methods: {
    saveLatLngClick(event) {
      this.position = {
        lat: event.position.lat,
        lng: event.position.lng,
      };
    },
    savePhoto() {
      const newPhoto = {
        position: this.position,
        desc: this.desc,
      };
      this.$http.put(`/photos/${this.idPhoto}`, { newPhoto })
        .then(() => {
          this.$router.push({ name: 'galerie' });
        }).catch((error) => {
          if (error.response && error.response.status === 404) {
            this.error = 'Désolé, cette photo n\'existe pas';
            return;
          } if (error.response && error.response.status === 401) {
            this.$router.push({ name: 'signin', query: { redirect: this.$route.fullPath } });
          }
          this.error = 'Impossible de mettre à jour les données';
        }).finally(() => {
          this.$store.dispatch('setLoading', false);
        });
    },
  },
  created() {
    this.$store.dispatch('setLoading', true);
    this.$http.get(`/photos/${this.idPhoto}`)
      .then((response) => {
        this.photo = response.data.photo;
        this.position = response.data.photo.position;
      }).catch((error) => {
        if (error.response && error.response.status === 404) {
          this.error = 'Désolé, cette série de photos n\'existe pas';
          return;
        } if (error.response && error.response.status === 401) {
          this.$router.push({ name: 'signin', query: { redirect: this.$route.fullPath } });
        }
      }).finally(() => {
        this.$store.dispatch('setLoading', false);
      });
  },

  computed: {
    idPhoto() {
      return this.$route.params.id;
    },
    isLoading() {
      return this.$store.getters.isLoading;
    },
    markers() {
      if (!this.position) return [];
      return [{ position: this.position }];
    },
  },
};
</script>

<style>
    @import url('https://unpkg.com/leaflet@1.6.0/dist/leaflet.css');
</style>
