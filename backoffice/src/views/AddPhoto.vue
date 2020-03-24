
<template>
  <div>
    <div class="row">
      <div class="input-field col s12">
        <input id="text" type="text" class="validate" />
        <label for="text">Description</label>
      </div>
    </div>
    <div class="row">
      <div class="file-field input-field">
        <div class="btn">
          <span>File</span>
          <input type="file" @change="onSelectFile" />
        </div>
        <div class="file-path-wrapper">
          <input class="file-path validate" type="text" />
        </div>
      </div>
      <button
        v-on:click="upload"
        class="s12 m3 btn waves-effect waves-light"
        type="submit"
        name="action"
      >Envoyer</button>
    </div>
  </div>
</template>

<script>
import Axios from 'axios';

export default {
  data() {
    return {
      selectedFile: null,
      description: null,
      photosaved: null,
    };
  },
  mounted() {
    window.M.AutoInit();
  },
  computed: {},
  methods: {
    onSelectFile(event) {
      const file = event.target.files[0] || null;
      if (!file) {
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
    },
    getSelectedBase64() {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          const res = reader.result;
          resolve(res.substring(res.indexOf(',') + 1));
        });
        reader.addEventListener('error', () => {
          reject(new Error('Cannot read the selected file !'));
        });

        reader.readAsDataURL(this.selectedFile);
      });
    },
    upload() {
      const url = 'https://api.imgbb.com/1/upload';
      const apiKey = 'bf1794aedb1cd3df011c27ee66f9c5e8';
      this.getSelectedBase64()
        .then((img64) => {
          const data = new FormData();
          data.append('image', img64);
          return Axios({
            method: 'post',
            mode: 'no-cors',
            url: `${url}?key=${apiKey}`,
            headers: {
              'Content-Type': 'application/octet-stream',
            },
            data,
          });
        })
        .then((response) => {
          // const photo = {
          //   lat: 0,
          //   lng: 0,
          //   url: this.response.url,
          // };
          // console.log(photo);
          // recuperer l'url
          // this.$http.post('/photos',).then();
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });

      // save dans notre bdd
    },
  },
};
</script>
