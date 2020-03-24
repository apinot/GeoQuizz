<template>
  <div>
    <h3>Galerie</h3>
    <div v-if="isError">
      <error></error>
    </div>
    <div v-else>
      <div>
        <button
          v-on:click="addPhoto"
          class="s12 m3 btn waves-effect waves-light"
          type="submit"
          name="action"
        >Ajouté une photo</button>
        <div class="row">
          <div class="col s12 m6 l4" v-for="photo in photos" :key="photo.id">
            <h2 class="header"></h2>
            <div class="card medium">
                <div class="card-image">
                    <img v-bind:src="photo.url">
                </div>
              <div class="card-content">
                  {{photo.desc}}
              </div>
              <div class="card-action">
                <a v-on:click="updateDeletePhoto(photo.id, photo.url)"
                  data-target="modal1"
                  class="s12 m3 waves-effect waves-light modal-trigger red-text text-darken-2"
                >supprimer</a>
              </div>
            </div>
          </div>
        </div>
        <div class="row center-align">
          <button class="btn" v-if="photos.length < maxNbPhoto" @click="getNextPhoto">
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
         <img class="image-modal" v-bind:src="this.photoDelete">
         <p>Voulez-vous vraiment supprimer cette photo ?</p>
      </div>
      <div class="modal-footer">
        <button v-on:click="deletePhoto"
        class="modal-close waves-effect waves-green btn-flat">Oui</button>
        <button class="modal-close waves-effect waves-green btn-flat">Non</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    Error,
  },

  data() {
    return {
      isError: false,
      idDelete: '',
      photoDelete: '',
      photos: [],
      error: null,
      edit: null,
      maxNbPhoto: -1,
      offset: 0,
    };
  },
  methods: {
    addPhoto() {
      this.$router.push({ name: 'upload' });
    },
    updateDeletePhoto(id, photo) {
      this.idDelete = id;
      this.photoDelete = photo;
    },
    deletePhoto() {
      this.$store.dispatch('setLoading', true);
      this.$http
        .delete(`/photos/${this.idDelete}`)
        .then(() => {
          const indexPhoto = this.photos.findIndex((e) => e.id === this.idDelete);
          this.photos.splice(indexPhoto, 1);
          this.offset -= 1;
          this.maxNbPhoto -= 1;
        }).catch((error) => {
          this.isError = true;
          console.log(error);
        }).finally(() => {
          this.$store.dispatch('setLoading', false);
        });
    },
    getNextPhoto() {
      if (this.photos.length >= this.maxNbPhoto) return;
      this.$store.dispatch('setLoading', true);
      this.$http
        .get(`/photos?offset=${this.offset}`)
        .then((response) => {
          response.data.photos.forEach((p) => { this.photos.push(p); });
          this.maxNbPhoto = response.data.total;
          this.offset += response.data.photos.length;
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
      .get('/photos')
      .then((response) => {
        this.photos = response.data.photos;
        this.maxNbPhoto = response.data.total;
        this.offset += 10;
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
.image-modal {
    width: 100%;
    margin: auto;
}
</style>
