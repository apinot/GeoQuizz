<template>
  <div id="app">
    <div class="container">
      <div class="row">
        <div class="input-field col s12">
          <input v-model="userName" id="first_name" type="text" class="validate" />
          <label for="first_name">Pseudo</label>
        </div>
      </div>
      <button class="btn waves-effect waves-light" type="submit" name="action">
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
    };
  },
};
</script>
