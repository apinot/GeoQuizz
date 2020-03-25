<template>
  <div class="row container">
    <div class="col s12 m8 offset-m2">
      <div class="card">
        <div class="card-image">
          <img src="https://media.giphy.com/media/a0h7sAqON67nO/giphy.gif">
        </div>
        <div class="card-content">
          <p>Vous avez fait {{score}} pts !</p>
        </div>
        <div class="card-action center-align">
          <a class="btn red darken-4 modal-trigger waves-effect waves-light"
          v-on:click="backAccueil">Retour à l'accueil</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['score'],
  data() {
    return {
    };
  },
  methods: {
    backAccueil() {
      this.$store.dispatch('destroyToken');
      this.$router.push({ name: 'home' });
    },
  },

  mounted() {
    // enregistrement dans la base de données
    this.$http
      .put(`/parties/${this.$store.getters.getPartie}`,
        { end: true, score: this.score },
        { headers: { Authorization: `Bearer ${this.$store.getters.getToken}` } }).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.log(error);
      });
  },
};
</script>
