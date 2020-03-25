<template>
    <Page>
        <ActionBar title="Series">
            <ActionItem @tap="addSerie" text="Ajouter"></ActionItem>
            <ActionItem @tap="refresh" text="Refresh"></ActionItem>
            <ActionItem @tap="this.$navigateBack" >Back</ActionItem>
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
    const dialogs = require("tns-core-modules/ui/dialogs");

    export default {
        components:{
            AddSerie,
            EditSerie
        },
        data(){
            return{
                url_api_mobile: 'https://f68f868d.ngrok.io/',
                series : null,
                isBusy: true,
            }
        },
        mounted() {
            this.getSeries();
        },
        computed : {
        },
        methods: {
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
                    }
                };
                axios.delete(this.url_api_mobile + 'series/'+serie._id, config)
                    .then((res) => {
                        console.log(res.data)
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
                        },5000)
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
