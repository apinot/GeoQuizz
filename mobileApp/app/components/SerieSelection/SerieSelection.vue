<template>
    <StackLayout>
        <Label  text="Veuillez selectionner la serie dans laquelle vous voulez upload la serie : " textWrap="true" style="font-size: 20px;"></Label>
        <Button v-if="isBusy === false" v-for="serie in series" :text="serie.ville" @tap="selectSerie(serie)"></Button>
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
              selected:true,
              notselected:false,
              url_api_mobile: "https://00d46766.ngrok.io/",
              series: null,
              isBusy: false
          }
        },

        mounted(){
          this.getSerie()
        },
        methods: {
            getSerie() {
                this.isBusy = true
                console.log(this.$store.state.idUtilisateur);
                const data = {
                    params: {id : this.$store.state.idUtilisateur}
                };
                axios.get(this.url_api_mobile + 'series', data)
                    .then(res => {
                        console.log(res.data);
                        this.series = res.data.series;

                    })
                    .catch(err => {
                        console.log(err)
                        this.isbusy = false
                    })
                    .finally(()=>{
                        setTimeout(() => {this.isBusy = false}, 3000);

                    })
            },
            selectSerie(serie){
                this.$modal.close(serie);
            }
        }
    };
</script>
