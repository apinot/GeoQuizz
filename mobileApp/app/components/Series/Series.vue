<template>
    <Page>
        <ActionBar title="Series">
            <ActionItem @tap="addSerie" text="Ajouter"></ActionItem>
<!--            <ActionItem @tap="refresh" text="Refresh"></ActionItem>-->
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
        components:{
            AddSerie,
            EditSerie,
            Home,
        },
        data(){
            return{
                url_api_mobile: this.$store.state.api_mobile,
                url_api_mobile: 'https://00d46766.ngrok.io/',
                series : null,
                isBusy: true,
            }
        },
        created(){
            this.getSeries()
        },
        computed(){
            this.getSeries()
        },
        methods: {
            goHome(){
                this.$navigateTo(Home)
            },
            addSerie(){
                this.$navigateTo(AddSerie)
            },
            editSerie(serie){
                this.$navigateTo(EditSerie, {
                    props : {
                        EditedSerie: serie
                    }
                })
            },

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
            getSeries() {
                console.log('zinzin')
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
            refresh(){
                this.isBusy = true;
                console.log(this.isBusy)
                const data = {
                    params: {id : this.$store.state.idUtilisateur}
                };
                axios.get(this.url_api_mobile + 'series', data)
                    .then(res => {
                        this.series = res.data.series;
                    })
                    .catch(err => {
                        console.log(err)
                        this.isBusy = false
                    })
                    .finally(()=>{
                        setTimeout(()=>{
                            this.isBusy = false
                        },50)
                    })
            }
        }
    };
</script>

<style>
    .align{
        text-align: center;
    }
</style>
