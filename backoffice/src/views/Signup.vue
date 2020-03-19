<template>
<div id="singup">
  <div class="row center-align">
    <h1>Inscription</h1>
  </div>
  <div class="row red accent-4 white-text p-5 center-align" v-if="error">
    Inscription impossible !
  </div>
  <div class="row">
    <form @submit.prevent="signup">
      <!-- email -->
      <div class="row">
        <div class="input-field">
          <input id="emailField" type="text" v-model="email" autofocus/>
          <label for="emailField">Email</label>
        </div>
      </div>
      <!-- password -->
      <div class="row">
        <div class="input-field">
          <input id="password" type="password" v-model="password"/>
          <label for="password">Mot de passe</label>
        </div>
      </div>
      <!-- password confirm -->
      <div class="row">
        <div class="input-field">
          <input id="passwordConfirm" type="password" v-model="passwordConfirm"/>
          <label for="passwordConfirm">Confirmation</label>
        </div>
      </div>

      <!-- submit -->
      <div class="row center-align">
          <spinner v-if="loading"></spinner>
          <input type="submit" value="S'inscrire" class="btn" v-else>
      </div>
    </form>
  </div>
</div>
</template>

<script>
import Spinner from '../components/Spinner.vue';

export default {
  components: {
    Spinner,
  },
  data() {
    return {
      email: '',
      password: '',
      passwordConfirm: '',
      error: false,
      loading: false,
    };
  },
  methods: {
    signup() {
      if (this.loading) return;

      this.loading = true;

      this.$http.post('/utilisateurs', {
        email: this.email,
        password: this.password,
        passwordConfirm: this.passwordConfirm,
      })
        .then(() => {
          this.$router.push({ name: 'signin' });
        })
        .catch((error) => {
          console.log(error);
          this.error = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
