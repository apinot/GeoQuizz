<template>
  <div class="home">
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
        name="action"
      >
        Submit
      </button>
    </div>
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
      this.$http
        .post('/parties', { username: this.userName })
        .then((response) => {
          this.data = response.data;
          this.$store.dispatch('retrieveToken', response.data);
          this.$router.push({ name: 'partie' });
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>
