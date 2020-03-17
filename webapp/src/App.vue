
<template>
  <div id="app">
    <div class="container">
      <div class="row">
        <div class="input-field col s12">
          <input v-model="userName" id="first_name" type="text" class="validate" />
          <label for="first_name">Pseudo</label>
        </div>
      </div>
      <button
        v-on:click="createPartie"
        class="btn waves-effect waves-light"
        type="submit"
        name="action">
        Submit
        <i class="material-icons right">send</i>
      </button>
    </div>
    <router-view />
  </div>
</template>


<script>
export default {
  data() {
    return {
      userName: '',
      data: '',
    };
  },

  methods: {
    createPartie() {
      console.log('coucou');
      this.$http
        .post('/parties', { username: this.userName })
        .then((response) => {
          this.data = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>
