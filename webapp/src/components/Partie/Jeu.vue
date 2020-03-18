<template>
  <div>
    <div class="row">
        <div class="col s12 m6">
          <div class="row">
            <div class="col s12 m12">
              <div class="card">
                <div class="card-image">
                  <img :src="photo.url"
                    v-if="photo" >
                </div>
                <div class="card-action center-align">
                  <a data-target="modal1" class="btn modal-trigger">Modal</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      <leaflet
          class="col s12 m6"
          v-if="options"
          :options="options"
          :markers="markers"
          @mapclick="saveLatLngClick"
      />
    </div>
    <!-- Modal Structure -->
    <div id="modal1" class="modal">
      <div class="row">
        <img class="col s12" :src="photo.url" v-if="photo">
      </div>
    </div>
  </div>
</template>

<script>
import Leaflet from 'easy-vue-leaflet';

export default {
  props: ['options', 'markers', 'photo'],

  components: {
    Leaflet,
  },
  data() {
    return {
      lat: '',
      lng: '',
    };
  },
  methods: {
    /**
     * Enregistre la position du marler lors du clique
     */
    saveLatLngClick(event) {
      this.lat = event.position.lat;
      this.lng = event.position.lng;
      this.$emit('point', {
        position: {
          lat: this.lat,
          lng: this.lng,
        },
      });
    },
  },
};
</script>
