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
              series: null,
              selected:true,
              notselected:false,
              url_api_backOffice: "https://c3163a4e.ngrok.io/"
          }
        },

        mounted(){
          this.getSerie()
        },
        methods: {
            getSerie(){
                axios.get(this.url_api_backOffice+'series')
                    .then(res =>{

                         this.series = res.data.series;
                         console.log(this.series)

                    })
                    .catch(err =>{
                        console.log(err)
                    })
            },
            selectSerie(serie){
                this.$modal.close(serie);
            }
        }
    };
</script>
