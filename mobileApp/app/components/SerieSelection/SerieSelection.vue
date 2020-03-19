<template>
    <StackLayout>
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
              notselected:false
          }
        },

        mounted(){
          this.getSerie()
        },
        methods: {
            getSerie(){
                axios.get('https://b3b4976d.ngrok.io/series')
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
