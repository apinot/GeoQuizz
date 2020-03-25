<template>
    <Page>
        <ActionBar title="Ajouter une série">
            <ActionItem @tap="this.$navigateBack" >Back</ActionItem>

        </ActionBar>
        <StackLayout>
            <TextField hint="Entrer d'une ville qui existe..." v-model="ville"/>
            <TextField hint="Entrer le nom de la série..." v-model="nom"/>
            <TextField hint="Entrer la description de la série..." v-model="descr"/>
            <Button @tap="getPositionCity">Sauvegarder la série</Button>
            <ActivityIndicator :busy="isBusy" ></ActivityIndicator>

        </StackLayout>
    </Page>
</template>

<script>
    import axios from 'axios'
    const dialogs = require("tns-core-modules/ui/dialogs");
    import Home from '../Home'
    import Series from '../Series/Series'

    export default {
        components:{
            Home,
            Series
        },
        props: {
        },
        data(){
            return{
                ville: '',
                nom: '',
                descr: '',
                dist: 1000,
                lat: null,
                lng: null,
                zoom: 10,
                user: this.$store.state.idUtilisateur,
                api_mobile : this.$store.state.api_mobile,
                isBusy: false
            }
        },
        methods: {
            saveSerie(){
                this.isBusy = true;
                console.log(this.api_mobile + 'series');
                const config = {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.state.tokenAuth
                    }
                };
                const data = {
                    ville: this.ville,
                    dist: this.dist,
                    nom: this.nom,
                    descr: this.descr,
                    lat: this.lat,
                    lng: this.lng,
                    zoom: this.zoom,
                    photos: [],
                    user: this.$store.state.idUtilisateur,
                };
                axios.post(this.api_mobile + 'series', data, config)
                    .then((res) => {
                        console.log(res.data);
                        dialogs.confirm("Votre ajout de série a bien été effectuer")
                    })
                    .catch((err) => {
                        console.log(err)
                        this.isBusy = false;
                        dialogs.alert("Une erreur est survenue")
                    })
                    .finally(()=>{
                        setTimeout(() => {this.isBusy = false}, 3000);
                    })
            },
            getPositionCity(){
                axios.get('https://api-adresse.data.gouv.fr/search/?q='+this.ville)
                    .then((res) => {
                        const lat = res.data.features[0].geometry.coordinates[1];
                        const lng = res.data.features[0].geometry.coordinates[0];
                        this.lat = lat;
                        this.lng = lng;
                        console.log(this.lat,this.lng);
                        this.saveSerie();
                        this.$navigateTo(Series)
                            .then(()=>{
                                Series.getSerie()
                            })
                    })
                    .catch((err) => {
                        console.log(err)
                        dialogs.alert("le nom de la ville est incorrecte")
                    })
            }
        }

    };
</script>
