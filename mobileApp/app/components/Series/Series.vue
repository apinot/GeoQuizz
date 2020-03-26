<template>
    <Page>
        <ActionBar title="Series">
            <ActionItem @tap="addSerie" text="Ajouter"></ActionItem>
            <ActionItem @tap="goHome" >Back</ActionItem>
        </ActionBar>
        <ActivityIndicator :busy="isBusy" ></ActivityIndicator>
        <ListView v-if="isBusy===false" :items="series">
                <v-template>
                    <StackLayout orientation="horizontal">
                        <Label class="align" :text="item.ville"></Label>
                        <Button @tap="editSerie(item)">Editer</Button>
                        <Button @tap="deleteSerie(item)">Supprimer</Button>
                    </StackLayout>
                </v-template>
            </ListView>
    </Page>
</template>

<script>
    import AddSerie from '../AddSerie/AddSerie'
    import EditSerie from '../EditSerie/EditSerie'
    import axios from 'axios'
    import Home from '../Home'
    const dialogs = require("tns-core-modules/ui/dialogs");

    export default {

        //La liste de toutes les components utilisés dans cette vue
        components:{
            AddSerie,
            EditSerie,
            Home,
        },

        //La liste de toutes les variables utilisés dans les méthodes ci-dessous
        data(){
            return{
                url_api_mobile: this.$store.state.api_mobile,
                series : null,
                isBusy: true,
            }
        },

        //Appeler la méthode getSeries a la création
        created(){
            this.getSeries()
        },

        //Appeler la méthode getSeries a lorsque l'application se charge
        computed(){
            this.getSeries()
        },
        methods: {
            /**
             * Nom: goHome
             * Description: Permet de naviguer vers le component Home
             */
            goHome(){
                this.$navigateTo(Home)
            },

            /**
             * Nom: addSerie
             * Description: Permet de naviguer vers le component AddSerie
             */
            addSerie(){
                this.$navigateTo(AddSerie)
            },

            /**
             * Nom: editSerie
             * Description: Permet de naviguer vers le component editSerie et de passer la propriété 'EditedSerie'
             */
            editSerie(serie){
                this.$navigateTo(EditSerie, {
                    props : {
                        EditedSerie: serie
                    }
                })
            },

            /**
             * Nom : deleteSerie
             * Description : Cette fonction permet de supprimer série dans la base de donnée
             * Api utilisée : apiMobile
             * Route utilisée : /series/:id
             * Méthode : DELETE
             * @param serie
             */
            deleteSerie(serie){
                const config = {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.state.tokenAuth
                    },
                    params: {id : this.$store.state.idUtilisateur}
                };

                axios.delete(this.url_api_mobile + 'series/'+serie._id,config)
                    .then((res) => {
                        console.log(res.data)
                        this.getSeries()
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            },

            /**
             * Nom : getSeries
             * Description : Cette fonction permet récupérer les séries de la base de données
             * Api utilisée : apiMobile
             * Route utilisée : /series
             * Méthode : GET
             */
            getSeries() {
                const data = {
                    params: {id : this.$store.state.idUtilisateur}
                };
                axios.get(this.url_api_mobile + 'series', data)
                    .then(res => {
                        this.series = res.data.series;
                    })
                    .catch(err => {
                        console.log(err)
                        this.isBusy =false

                    })
                    .finally(() =>{
                        setTimeout(() => {this.isBusy = false}, 1000)
                    })
            },

        }
    };
</script>

<style>
    .align{
        text-align: center;
    }
</style>
