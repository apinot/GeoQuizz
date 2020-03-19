<template>
<div id="singin">
  <div class="row center-align">
    <h1>Connexion</h1>
  </div>
  <div class="row red accent-4 white-text p-5 center-align" v-if="error">
    Email ou mot de passe incorrect !
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
          <input id="password" type="text" v-model="password"/>
          <label for="password">Mot de passe</label>
        </div>
      </div>

      <!-- submit -->
      <div class="row center-align">
          <input type="submit" value="S'inscrire" class="btn" disabled="loading">
      </div>
    </form>
  </div>
</div>
</template>

<script>

export default {
  data() {
    return {
      email: '',
      password: '',
      error: false,
    };
  },
  methods: {
    signup() {
      if (this.loading) return;

      this.loading = true;

      this.$http.post('/utilisateurs/auth', {}, {
        headers: {
          Authorization: `basic ${this.base64Credentials}`,
        },
      })
        .then((response) => {
          this.$store.dispatch('signin', response.data);
          this.$router.push({ name: 'home' });
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
  computed: {
    base64Credentials() {
      return Buffer.from(`${this.email}:${this.password}`, 'utf-8').toString('base64');
    },
  },
};
</script>
