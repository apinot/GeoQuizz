<template>
  <div class="row container">
    <div class="col s12 m8 offset-m2">
      <div class="card">
        <div class="card-image">
          <img src="https://media3.giphy.com/media/3rUbeDiLFMtAOIBErf/giphy.gif?cid=ecf05e47fc8ebae5889f9a2a92941e380e14f236d85ac328&rid=giphy.gif">
        </div>
        <div class="card-content center-align">
          <p style="font-size: 1.5em;">
            Vous avez fait <b>{{score}} points</b> !
          </p>
          <p style="margin-top: 1em;">
            <label>
              <input type="checkbox" class="filled-in" v-model="save" />
              <span>Faire apparaître mon score au classement</span>
            </label>
          </p>
        </div>
        <div class="card-action center-align">
          <div v-if="loading" class="row" style="margin: 2em;">
              <spinner v-if="loading"></spinner>
          </div>
          <button v-else class="btn red darken-4 modal-trigger waves-effect waves-light"
          v-on:click="backAccueil">Terminer la partie</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Spinner from '../load/Spinner.vue';

export default {
  props: ['score'],
  components: {
    Spinner,
  },
  data() {
    return {
      save: false,
      loading: false,
    };
  },
  methods: {
    backAccueil() {
      this.loading = true;
      this.saveData()
        .then(() => {
          this.$store.dispatch('destroyToken');
          this.$router.push({ name: 'home' });
        }).finally(() => {
          this.loading = false;
        });
    },
    async saveData() {
      if (this.save) {
        await // enregistrement dans la base de données
        this.$http
          .put(`/parties/${this.$store.getters.getPartie}`,
            { end: true, score: this.score },
            { headers: { Authorization: `Bearer ${this.$store.getters.getToken}` } }).then((response) => {
            console.log(response);
          });
      }
    },
  },
};
</script>
