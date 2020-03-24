
<template>
  <div>
    <div class="row center-align head">
      <h1>Upload d'une image</h1>
    </div>
    <div class="row">
      <div class="file-field input-field">
        <div class="btn">
          <span>File</span>
          <input type="file" @change="onSelectFile" />
        </div>
        <div class="file-path-wrapper">
          <input class="file-path validate" type="text" placeholder="Selectionner une image"/>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s12">
        <input id="text" type="text" class="validate" v-model="description"/>
        <label for="text">Description</label>
      </div>
    </div>
    <div class="row center-align">
      <div class="row left-align">
        Localisation<br>
        <small>Cliquez sur la carte pour positionner la photo</small>
      </div>
      <div class="row">
        <leaflet
          class="col s12"
          v-if="options"
          :options="options"
          :markers="markers"
          @mapclick="saveLatLngClick"
          :disabled="!!position"
        />
      </div>
      <div class="row">
        <button v-if="!!position" class="btn" @click="position = null">
          Changer la localisation
        </button>
      </div>
    </div>
    <div class="row red accent-4 white-text p-5 center-align" v-if="error">
      {{error}}
    </div>
    <div class="row center-align mb-5">
      <button
        v-on:click="upload"
        class="s12 m3 btn waves-effect waves-light"
        type="submit"
        name="action"
        :disabled="isLoading"
      >Envoyer</button>
    </div>
  </div>
</template>

<script>
import Axios from 'axios';
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
      selectedFile: null,
      description: '',
      photosaved: null,
      position: null,
      error: '',
    };
  },
  mounted() {
    window.M.AutoInit();
  },
  computed: {
    isLoading() {
      return this.$store.getters.isLoading;
    },
    markers() {
      if (!this.position) return [];
      return [{ position: this.position }];
    },
  },
  methods: {

    saveLatLngClick(event) {
      this.position = {
        lat: event.position.lat,
        lng: event.position.lng,
      };
    },

    onSelectFile(event) {
      const file = event.target.files[0] || null;
      if (!file) {
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
    },
    getSelectedBase64() {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          const res = reader.result;
          resolve(res.substring(res.indexOf(',') + 1));
        });
        reader.addEventListener('error', () => {
          reject(new Error('Cannot read the selected file !'));
        });

        reader.readAsDataURL(this.selectedFile);
      });
    },
    upload() {
      if (!this.selectedFile) {
        this.error = 'Veuillez selectionner une image';
        return;
      }

      if (!this.description) {
        this.error = 'Veuillez renseigner une description de la photo';
        return;
      }

      if (!this.position) {
        this.error = 'Veuillez renseigner la localistation de la photo';
        return;
      }

      if (this.isLoading) return;

      this.$store.dispatch('setLoading', true);
      const url = 'https://api.imgbb.com/1/upload';
      const apiKey = 'bf1794aedb1cd3df011c27ee66f9c5e8';
      this.getSelectedBase64()
        .then((img64) => {
          // Upload dde l'image sur IMGBB
          const params = new FormData();
          params.append('image', img64);
          return Axios.create().post(`${url}?key=${apiKey}`, params);
        })
        .then((response) => {
          const photo = {
            // TODO mettre la postion
            position: this.position,
            desc: this.description,
            url: response.data.data.url,
          };

          return this.$http.post('/photos', { photo });
        })
        .then(() => {
          this.$router.push({ name: 'galerie' });
        })
        .catch((error) => {
          console.log(error);
          this.error = 'Erreur lors de la mise en ligne. Vérifier les informations fournis';
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
