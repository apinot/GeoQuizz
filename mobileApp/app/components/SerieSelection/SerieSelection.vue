<template>
    <StackLayout>
        <Label  text="Veuillez selectionner la serie dans laquelle vous voulez upload la serie : " textWrap="true" style="font-size: 20px;"></Label>
        <Button v-for="serie in series" :text="serie.ville" @tap="selectSerie(serie)"></Button>
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
              url_api_mobile: "https://9278aa32.ngrok.io/",
              series: null
          }
        },

        mounted(){
          this.getSerie()
        },
        methods: {
            getSerie() {
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
                    })
            },
            selectSerie(serie){
                this.$modal.close(serie);
            }
        }
    };
</script>
