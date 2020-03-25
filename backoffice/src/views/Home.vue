<template>
  <div class="home">
    <h5>Bienvenue sur le backoffice de Geoquizz</h5>
    <p>Ce site vous permet de gérer vos série et vos photos pour Geoquizz.</p>
    <div class="row">
      <div class="col s12 m8 offset-m2">
        <div class="card center-align">
          <span class="card-title">Gestion des photos</span>
          <div class="card-image">
            <img :src="require('../assets/1.gif')">
          </div>
        </div>
      </div>
    </div>
    <div>
      <p>Vos photos seront sauvegardées sur le cloud ImageBB.</p>
      <p>Vous pouvez recupérer les photos que vous avez prise avec votre application mobile sur
        ce site, elles sont disponible dans la galerie.</p>
    </div>
    <div class="row">
      <div class="col s12 m8 offset-m2">
        <div class="card center-align">
          <span class="card-title">Gestion des série</span>
          <div class="card-image">
            <img :src="require('../assets/2.gif')">
          </div>
        </div>
      </div>
    </div>
    <div>
      <p>Vous pouvez créer, modifier, supprimer des séries
        et y ajouté autant de photos que vous le desirez.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  components: {},
  mounted() {
    window.M.AutoInit();
  },
};
</script>

<style>

</style>
