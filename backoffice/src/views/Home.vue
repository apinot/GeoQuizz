<template>
  <div class="home">
    <div class="container">
      <h5>Bienvenue sur le backoffice de Geoquizz</h5>
      <p>Ce site vous permet de gérer vos série et vos photos pour Geoquizz.</p>
      <p>Vos photos seront sauvegardées sur le cloud ImageBB.</p>
      <p>Vous pouvez recupérer les photos que vous avez prise avec votre application mobile sur
        ce site (voir gallerie).</p>
    </div>
    <div>
      <div class="carousel">
        <a class="carousel-item"><img :src="require('../assets/1.png')"></a>
        <a class="carousel-item"><img :src="require('../assets/2.png')"></a>
      </div>
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
