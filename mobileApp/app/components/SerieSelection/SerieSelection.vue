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

        //La liste de toutes les variables utilisés dans les méthodes ci-dessous
        data(){
          return {
              selected:true,
              notselected:false,
              url_api_mobile: "https://00d46766.ngrok.io/",
              series: null,
              isBusy: false
          }
        },

        //Définir la variable url_api_mobile avec la variable api_mobile du store et de lancé la methode getSerie
        created(){
            this.url_api_mobile = this.$store.state.api_mobile;
            this.getSerie()
        },
        methods: {

            /**
             * Nom : getSerie
             * Description : Cette fonction permet récupérer les séries de la base de données
             * Api utilisée : apiMobile
             * Route utilisée : /series
             * Méthode : GET
             */
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
                        setTimeout(() => {this.isBusy = false}, 1000);
                    })
            },

            /**
             * Nom :selectSerie
             * Description : Ferme la modal actuelle
             * @param serie
             */
            selectSerie(serie){
                this.$modal.close(serie);
            },

            /**
             * Nom: addToCloud
             * Description: Ferme la modal actuelle et passe la donnée 'galerie'
             */
            addToCloud(){
                this.$modal.close("galerie")
            }
        }
    };
</script>
