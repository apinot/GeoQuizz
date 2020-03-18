<template>
<div>
    <leaflet
        class="col s12 m6"
        v-if="options"
        :options="options"
        :markers="markers"
        @mapclick="saveLatLngClick"
    />
</div>
</template>

<script>
import Leaflet from 'easy-vue-leaflet';

export default {
  props: ['options', 'markers'],

  components: {
    Leaflet,
  },
  data() {
    return {
      // Leaflet attribut
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
