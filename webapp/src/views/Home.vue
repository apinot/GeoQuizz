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
      <div class="row">
        <a class='dropdown-trigger btn col s6 m4 offset-s3'
        data-target='dropdown1'>{{nomSerie}} {{villeSerie}}</a>
      <div v-if="series">
        <ul id='dropdown1' class='dropdown-content' >
          <li v-for="serie in series" :key="serie.id">
            <a href="#!" v-on:click="saveInfoSerie(serie.id, serie.nom, serie.ville)">
              {{serie.nom}} {{serie.ville}}</a>
          </li>
        </ul>
      </div>
        <button
          v-on:click="createPartie"
          class="btn waves-effect waves-light col s2 m2 offset-s5 offset-m6"
          type="submit"
          name="action"
        >
          Start
        </button>
      </div>
      <div v-if="error"><error/></div>

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
      error: false,
      userName: '',
      data: '',
      series: [],
      idSerie: '',
      nomSerie: '',
      villeSerie: '',
    };
  },

  methods: {
    createPartie() {
      this.$http
        .post('/parties', {
          username: this.userName,
          idSerie: this.idSerie,
        })
        .then((response) => {
          this.data = response.data;
          this.$store.dispatch('retrieveToken', response.data);
          this.$router.push({ name: 'partie' });
          this.error = false;
        })
        .catch((error) => {
          this.error = true;
          console.log(error);
        });
    },
    saveInfoSerie(id, nom, ville) {
      this.idSerie = id;
      this.nomSerie = nom;
      this.villeSerie = ville;
    },
  },

  created() {
    this.$http
      .get('/series')
      .then((response) => {
        this.series = response.data.series;
        this.idSerie = this.series[0].id;
        this.nomSerie = this.series[0].nom;
        this.villeSerie = this.series[0].ville;
      })
      .catch((error) => {
        this.error = true;
        console.log(error);
      });
  },

  mounted() {
    window.M.AutoInit();
  },
};
</script>
