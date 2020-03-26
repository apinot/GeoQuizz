<template>
    <Page>
        <ActionBar title="Ajouter une série">
            <ActionItem @tap="this.$navigateBack" >Back</ActionItem>
        </ActionBar>
        <StackLayout>
            <TextField hint="Entrer la ville..." v-model="ville"/>
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

        //La liste de toutes les components utilisés dans cette vue
        components:{
            Home,
            Series
        },

        //La liste de toutes les props utilisés dans cette vue
        props: ['EditedSerie'],

        mounted() {
            this.ville = this.EditedSerie.ville;
            this.nom = this.EditedSerie.nom;
            this.descr = this.EditedSerie.descr
            console.log('zinzin')
        },

        //La liste de toutes les variables utilisés dans les méthodes ci-dessous
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
                isBusy: false,
                photos: this.EditedSerie.photos
            }
        },
        methods: {
            /**
             * Nom : saveSerie
             * Description : Cette fonction permet de sauvegarder la série editée dans la base de donnée
             * Api utilisée : apiMobile
             * Route utilisée : /series/:id
             * Méthode : PUT
             */
            saveSerie(){
                this.isBusy = true;
                console.log(this.api_mobile + 'series/'+this.EditedSerie._id);
                console.log(this.$store.state.tokenAuth);
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
                    photos: this.photos,
                    user: this.$store.state.idUtilisateur,
                };
                axios.put(this.api_mobile + 'serie/'+this.EditedSerie._id, data, config)
                    .then((res) => {
                        console.log(res.data);
                        dialogs.confirm("Votre ajout de série a bien été effectuer, appuyer sur refresh pour voir les changements")
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

            /**
             * Nom : getPositionCity
             * Description : Faire des traitement après la sauvegarde de la série
             */
            getPositionCity () {
                console.log("zinzin"+this.ville);
                this.getPos().then(()=>{
                    this.$navigateTo(Series)
                        .then(() => {
                            Series.getSerie()
                        })
                }).catch((err) => {
                    console.log(err)
                })

            },
            /**
             * Nom: GetPos
             * Description : Cette fonction permet de récupérer les coordonées d'une ville a partir de son nom
             * Api utilisée : api data.gouv
             * Route utilisée : https://api-adresse.data.gouv.fr/search/
             * Méthode : GET
             * @returns {Promise<void>}
             */
            async getPos() {
                await axios.get('https://api-adresse.data.gouv.fr/search/?q=' + this.ville)
                    .then((res) => {
                        const lat = res.data.features[0].geometry.coordinates[1];
                        const lng = res.data.features[0].geometry.coordinates[0];
                        this.lat = lat;
                        this.lng = lng;
                        console.log(this.lat, this.lng);
                    })
                    .catch((err) => {
                        console.log(err)
                    });
                await this.saveSerie()
            }

        }

    };
</script>

