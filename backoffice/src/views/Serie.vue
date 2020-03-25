<template>
<div class="serie">
    <div class="row red accent-4 white-text p-5 center-align" v-if="error">
      {{error}}
    </div>
    <div v-if="serie">
      <div class="row">
        <h1 class="center-align">
          Série de photos
        </h1>
      </div>

      <div class="container center-align">
        <!-- Nom -->
        <div class="row">
          <template v-if="currentNom !== null">
            <div class="input-field col s12 m8">
              <input
                type="text"
                class="validate"
                autofocus="true"
                v-model="currentNom">
            </div>
            <button
              class="btn red darken-3 waves-effect waves-light col s4 offset-s4 offset-m2 m2"
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
              <button class="btn red darken-3 waves-effect waves-light"
              @click="currentNom = serie.nom">
                <i class="fas fa-pen left"></i> Modifier
              </button>
            </div>
          </template>
        </div>

        <!-- description -->
        <div class="row">
          <template v-if="currentDescr !== null">
            <div class="input-field col s12 m8">
              <textarea
                type="text"
                class="materialize-textarea"
                autofocus="true"
                v-model="currentDescr"></textarea>
            </div>
            <button
              class="btn red darken-3 waves-effect waves-light col s4 offset-s4 offset-m2 m2"
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
              <button class="btn red darken-3 waves-effect waves-light"
              @click="currentDescr = serie.descr">
                <i class="fas fa-pen left"></i> Modifier
              </button>
            </div>
          </template>
        </div>

        <!-- Ville -->
        <div class="row">
          <template v-if="currentCity !== null">
            <div class="input-field col s12 m8">
              <input
                type="text"
                class="validate"
                autofocus="true"
                v-model="currentCity">
            </div>
            <button
              class="btn red darken-3 waves-effect waves-light col s4 offset-s4 offset-m2 m2"
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
              <button class="btn red darken-3 waves-effect waves-light"
              @click="currentCity = serie.ville">
                <i class="fas fa-pen left"></i> Modifier
              </button>
            </div>
          </template>
        </div>

        <!-- Distance -->
        <div class="row">
          <template v-if="currentDist !== null">
            <div class="input-field col s12 m8">
              <input
                type="number"
                min="0"
                class="validate"
                autofocus="true"
                v-model="currentDist">
            </div>
            <button
              class="btn red darken-3 waves-effect waves-light col s4 offset-s4 offset-m2 m2"
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
              <button class="btn red darken-3 waves-effect waves-light"
              @click="currentDist = serie.dist">
                <i class="fas fa-pen left"></i> Modifier
              </button>
            </div>
          </template>
        </div>
      </div>

      <!-- carte -->
      <div class="container">
        <div class="row">
          <h4 class="center-align">Carte de la serie</h4>
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
              class="btn red darken-3 waves-effect waves-light">
              Définir cette vue comme nouvelle carte
            </button>
            <button  class="btn red darken-3 waves-effect waves-light"
            @click="editMap = true" v-else>
              <i class="fas fa-pen left"></i> Modifier
            </button>
          </div>
        </div>
      </div>

      <!-- Photos -->
      <div class="row">
      <h4>Photos</h4>
      <div class="row">
        <button class="btn modal-trigger red darken-3" data-target="modalAddPhotos"
          @click="userOffset <= 0 ? getUserPhotos() : ''"
        >
          <i class="fas fa-plus left"></i>Ajouter
        </button>
      </div>
      <div class="row" v-if="photos.length <= 0">Cette série ne contient pas de photos</div>
      <div class="row" v-else>
        <div class="col col s12 m8 l6 offset-m2 offset-l3" v-for="photo in photos" :key="photo.id">
          <div class="card">
            <div class="card-image">
              <img :src="photo.url">
            </div>
            <div class="card-content">
              <p>{{photo.desc}}</p>
            </div>
            <div class="card-action center-align" v-if="photoToDelete === photo.id">
              <div class="row">Voulez-vous vraiement retirer cette photo de la série ?</div>
              <div class="row">
                <button class="btn left" @click="photoToDelete = null">Annuler</button>
                <button class="btn red accent-4  waves-effect waves-light right"
                @click="removePhoto">
                  <i class="fas fa-trash left"></i> Supprimer
                </button>
              </div>
            </div>
            <div class="card-action center-align" v-else>
              <button class="btn red accent-4 waves-effect waves-light"
              @click="photoToDelete = photo.id">
                <i class="fas fa-trash left"></i> Supprimer de la série
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


   <!-- Modal d'ajout de photo -->
    <div id="modalAddPhotos" class="modal modal-fixed-footer">
      <div class="modal-content">
        <h4>Ajouter des photos</h4>

        <div class="row center-align red-text text-accent-4" v-if="modalError">
          {{modalError}}
        </div>

        <div class="row center-align">
          <div class="col s12 m6 l4"  v-for="img in userPhotos" :key="img.id">
            <div
              :class="'card small ' +
                        (selectedPhotoInGalllery.includes(img)
                        ? 'selected' : '')"
            >
              <div class="card-image card-cover-image">
                <img :src="img.url" :alt="img.desc">
              </div>
              <div class="card-action">
                <a href="" v-if="selectedPhotoInGalllery.includes(img)"
                  class="blue-text text-accent-4"
                  @click.prevent="
                    selectedPhotoInGalllery.splice(selectedPhotoInGalllery.indexOf(img),1)"
                >
                  Désélectionner
                </a>
                <a href="" v-else
                  class="blue-text text-accent-4"
                  @click.prevent="selectedPhotoInGalllery.push(img)"
                >
                  Sélectionner
                </a>
              </div>
            </div>
          </div>
        </div>
             <!-- Spinner -->
            <div class="row center-align" v-if="modalLoading">
              <div class="preloader-wrapper big active">
                <div class="spinner-layer spinner-blue-only">
                  <div class="circle-clipper left">
                    <div class="circle"></div>
                  </div><div class="gap-patch">
                    <div class="circle"></div>
                  </div><div class="circle-clipper right">
                    <div class="circle"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row center-align" v-if="!modalLoading">
              <button class="btn" @click="getUserPhotos" v-if="userPhotos.length < totalUserPhoto">
                <i class="fas fa-arrow-down left"></i> Plus de photos
              </button>
            </div>
        </div>
        <div class="modal-footer">
          <a class="modal-close waves-effect waves-green btn-flat">
            Fermer
          </a>
          <a class="btn modal-close waves-effect waves-green"
            :disabled="!selectedPhotoInGalllery"
            @click="addPhoto"
          >
            Ajouter
          </a>
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
      photoToDelete: null,
      modalError: null,
      userPhotos: [],
      selectedPhotoInGalllery: [],
      userOffset: 0,
      totalUserPhoto: -1,
      modalLoading: true,
    };
  },
  created() {
    this.$store.dispatch('setLoading', true);
    this.$http.get(`/series/${this.idUrlParam}`)
      .then((response) => {
        this.serie = response.data.serie;

        return this.$http(`/series/${this.idUrlParam}/photos`);
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
  mounted() {
    window.M.AutoInit();
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
      this.$http.put(`/series/${this.serie.id}`, { rules: this.serie })
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
    removePhoto() {
      if (!this.photoToDelete) return;
      this.$store.dispatch('setLoading', true);
      this.$http.delete(`/series/${this.serie.id}/photos/${this.photoToDelete}`)
        .then((response) => {
          this.photos = response.data.serie.photos;
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.$router.push({ name: 'signin', query: { redirect: this.$route.fullPath } });
            return;
          }

          this.error = 'Impossible de supprimer la photo de la serie';
        })
        .finally(() => {
          this.$store.dispatch('setLoading', false);
        });
    },
    getUserPhotos() {
      this.modalLoading = true;
      this.$http.get(`/photos?offset=${this.userOffset}`)
        .then((response) => {
          response.data.photos.forEach((p) => { this.userPhotos.push(p); });
          this.userOffset += response.data.photos.length;
          this.totalUserPhoto = response.data.total;
        })
        .catch(() => {
          this.modalError = 'Impossible de récupérer vos photos';
        })
        .finally(() => {
          this.modalLoading = false;
        });
    },
    addPhoto() {
      this.selectedPhotoInGalllery.forEach((p) => {
        this.$store.dispatch('setLoading', true);
        this.$http.put(`/series/${this.serie.id}/photos/${p.id}`)
          .then((response) => {
            this.photos = response.data.serie.photos;
          })
          .catch(() => {
            this.error = 'Impossible d\'ajouter la photos';
          })
          .finally(() => {
            this.$store.dispatch('setLoading', false);
          });
      });
      this.selectedPhotoInGalllery = [];
    },
  },
};
</script>

<style lang="scss">
    @import url('https://unpkg.com/leaflet@1.6.0/dist/leaflet.css');

.card.small{
     .card-image {
       max-height: 100%;
       max-width: 100%;
     }

     &.selected {
       border: 1px solid blue;
     }
}
</style>
