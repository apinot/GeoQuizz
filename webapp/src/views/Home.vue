<template>
  <div class="home">
    <div class="container">
      <h1>Geo Quizz</h1>
      <div class="row">
        <div class="input-field col s12">
          <input v-model="userName" id="first_name" type="text" class="validate" />
          <label for="first_name">Pseudo</label>
        </div>
      </div>
      <div class="center-align">
        <button
          v-on:click="createPartie"
          class="btn waves-effect waves-light"
          type="submit"
          name="action"
        >
          Start
        </button>
      </div>
      <div v-if="errored"><error/></div>

      <h2>Règle du jeu</h2>
      <p>Une partie consiste en une séquence de 10 photos choisies aléatoirement
        à placer sur la carte d'une ville,</p>
      <p>Chaque réponse permet de gagner un certain nombre de points, en fonction de la
        précision du placement et de la rapidité pour répondre</p>
      <p>L'objectif pour une partie est d'obtenir le maximum de points. </p>
      <p>La partie est terminée lorsque les 10 photos ont été positionnées. </p>
      <h4>Calcul des points: </h4>
      <h5>Placement</h5>
      <p>Le point est inférieur à D: 5 points</p>
      <p>Le point est inférieur à 2 x D: 3 points</p>
      <p>Le point est inférieur à 3 x D: 1 points</p>
      <h5>Rapidité</h5>
      <p>Le point sont multiplié par 4 si la réponse a été donné avant 5 secondes</p>
      <p>Le point sont multiplié par 2 si la réponse a été donné avant 10 secondes</p>
      <p>Le point sont multiplié par 1 si la réponse a été donné avant 20 secondes</p>
      <p>Au dela de 20 secondes, aucun point ne vous sera attribué</p>
      <p>Bonne chance !</p>
    </div>
  </div>
</template>

<script>
import Error from '../components/load/Error.vue';

export default {

  components: {
    Error,
  },

  data() {
    return {
      errored: false,
      userName: '',
      data: '',
    };
  },

  methods: {
    createPartie() {
      this.$http
        .post('/parties', { username: this.userName })
        .then((response) => {
          this.data = response.data;
          this.$store.dispatch('retrieveToken', response.data);
          this.$router.push({ name: 'partie' });
          this.errored = false;
        })
        .catch((error) => {
          this.errored = true;
          console.log(error);
        });
    },
  },
};
</script>
