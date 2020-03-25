<template>
    <StackLayout>
        <Label  text="Veuillez selectionner la serie dans laquelle vous voulez upload la serie , si vous n'avez pas serie uploader la photo dans le cloud: " textWrap="true" style="font-size: 20px;"></Label>
        <Button  v-if="isBusy === false" v-for="serie in series" :text="serie.ville" @tap="selectSerie(serie)"></Button>
        <Button  @tap="addToCloud">Ajouter dans le cloud</Button>
        <ActivityIndicator :busy="isBusy" ></ActivityIndicator>

    </StackLayout>
</template>

<script>

    import axios from 'axios/dist/axios'
    export default {
        props: {
        },
        data(){
          return {
              url_api_mobile: '',
              series: null,
              isBusy: false
          }
        },

        created(){
            this.url_api_mobile = this.$store.state.api_mobile;
            this.getSerie()

        },
        methods: {
            getSerie() {
                this.isBusy = true;
                console.log(this.$store.state.idUtilisateur);
                const data = {
                    params: {id : this.$store.state.idUtilisateur}
                };
                console.log(this.url_api_mobile + 'series')
                axios.get(this.url_api_mobile + 'series', data)
                    .then(res => {
                        this.series = res.data.series;
                        console.log(this.series.length)
                    })
                    .catch(err => {
                        console.log(err);
                        this.isBusy = false
                    })
                    .finally(()=>{
                        setTimeout(() => {this.isBusy = false}, 3000);
                    })
            },
            selectSerie(serie){
                this.$modal.close(serie);
            },
            addToCloud(){
                this.$modal.close("galerie")
            }
        }
    };
</script>
