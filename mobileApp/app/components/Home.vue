<template>
    <Page>
        <ActionBar title="GeoQuiz"></ActionBar>
        <StackLayout>
            <Button text="Gestion des serie" @tap="goToSerie"></Button>
            <Button text="Prendre une photo" @tap="takePicture" />
            <Button text="Choisir une photo" @tap="selectPicture" />
            <WrapLayout>
                <Image v-for="img in images" :src="img.img.src" width="75" height="75" />
            </WrapLayout>
            <Button text="Upload" @tap="sendPictures" />
            <ActivityIndicator :busy="isBusy" ></ActivityIndicator>
        </StackLayout>
    </Page>
</template>

<script>
    import * as camera from "nativescript-camera";
    import * as imagepicker from "nativescript-imagepicker";
    import { Image } from "tns-core-modules/ui/image";
    import * as geolocation from "nativescript-geolocation";
    import SerieSelection from "./SerieSelection/SerieSelection";
    import Series from './Series/Series'
    import AddCoords from "./AddCoords/AddCoords";
    import axios from 'axios/dist/axios';

    const bghttp = require("nativescript-background-http");
    const session = bghttp.session("image-upload");
    const dialogs = require("tns-core-modules/ui/dialogs");
    export default {

        //La liste de toutes les components utilisés dans cette vue
        components: {
            AddCoords,
            SerieSelection,
            Series,
        },

        //La liste de toutes les variables utilisés dans les méthodes ci-dessous
        data() {
            return {
                images:[],
                location: null,
                images_uploaded: null,
                urls: [],
                data: [],
                serie: null,
                url_api_mobile: this.$store.state.api_mobile,
                isBusy: false
            }
        },

        //Permet à la création de demander l'autorisation de l'utilisateur d'accéder a la géolocalisation
        created(){
            geolocation.enableLocationRequest();
        },

        methods:{

            /**
             * Nom: goToSerie
             * Description: Permet de naviguer vers le component Series
             */
            goToSerie(){
                this.$navigateTo(Series)
            },

            /**
             * Nom: selectPictures
             * Description: Permet de gérer les autorisation d'accès de la galerie, d'affecter des coordonées a celle-ci
             * grâce au component AddCoords et ensuite de les affecter au tableau
             */
            selectPicture() {
                let context = imagepicker.create({
                    mode: 'single'
                });
                context.authorize()
                    .then(function() {
                        return context.present();
                    })
                    .then(selection => {
                        selection.forEach(selected => {
                            let img = new Image();
                            img.src = selected;
                            let obj = {img: img};
                            obj.idUtilisateur = this.$store.state.idUtilisateur;
                            this.images.push(obj);
                            console.log(obj.img);
                            console.log(this.images.length);
                            this.$showModal(AddCoords)
                                .then((coords) =>{
                                    console.log(coords.lat);
                                    console.log(coords.lng);
                                    obj.location = {
                                        latitude: coords.lat,
                                        longitude: coords.lng
                                    };
                                    console.log(obj)
                                })
                        });
                    }).catch(function (e) {
                    console.log('error in selectPicture', e);
                });
            },

            /**
             * Nom: takePicture
             * Description: Permet de gérer les autaurisations pour accéder a la caméra ainsi que d'ajouter des images dans le tableau,
             * de plus, ajouter des coordonées a l'image en fonction de la postion de l'utilisateur
             */
            takePicture() {
                let obj = {};
                camera.requestPermissions()
                    .then(() => {
                        camera.takePicture({ width: 300, height: 300, keepAspectRatio: true, saveToGallery:false })
                            .then(imageAsset => {
                                let img = new Image();
                                img.src = imageAsset;
                                obj.img = img;
                                geolocation.getCurrentLocation( {timeout: null} )
                                    .then(function (location) {
                                        obj.location = location;
                                        console.log(obj)
                                    }
                                    , function (e) {
                                        console.log("Error: " + e.message);
                                    });
                                this.images.push(obj);
                            })
                            .catch(e => {
                                console.log('error:', e);
                            });
                    })
                    .catch(e => {
                        console.log('Error requesting permission :'+ e);
                    });
            },

            /**
             * Nom: sendPictures
             * Description: Permet d'appeler la methode 'request()' après que la modal soit fermée
             */
            sendPictures(){
                if(this.images.length > 0){
                    this.$showModal(SerieSelection)
                        .then( serie => {
                            this.serie = serie;
                            if(serie){
                               this.request()
                            }else{
                                dialogs.alert("Vous n'avez pas choisis de serie")
                            }
                        });

                }else{
                    dialogs.alert("Aucune photos selectionnées")
                }
            },

            /**
             *Name: request
             * Service: http-background
             * Méthode: POST
             * Description: Permet d'upload une image sur le cloud
             */
            request(){
                this.isBusy = true
                const url = 'https://api.imgbb.com/1/upload';
                const api_key=  'bf1794aedb1cd3df011c27ee66f9c5e8';
                this.images.forEach((image) => {
                    const request = {
                        url: url + "?key=" + api_key,
                        method: "POST",
                        header: {
                            "Content-Type": "application/octet-stream",
                        },
                        description: 'Uploading ' + this.getName(image.img.src.android)
                    };
                    const params = [
                        {name: 'image', filename: image.img.src.android,mimeType: 'image/jpeg'}
                    ];

                    const task = session.multipartUpload(params, request);
                    task.on("progress", this.logEvent);
                    task.on("error", this.logEvent);
                    task.on("complete", this.logEvent);
                    task.on("responded", this.respondedHandler);
                });
            },

            /**
             * Nom: setUrlToImg2
             * Description: Permet de déifnir l'url aux images et de les ajouter a la base de donnée
             * Api utilisée : mobileApi
             * Route utilisée : /photos
             * Méthode : POST
             * @param: string
             */
            setUrlToImg2(urls){
                if (this.checkApiMobile()){
                    dialogs.alert("Une erreur est survenue avec l'api ")
                }else{
                    let compt = 0;
                    this.images.forEach((image) =>{
                        image.img.url = urls[compt];
                        compt++;
                    });
                    const data = {
                        data : {
                            images: this.images,
                            id : this.$store.state.idUtilisateur
                        },

                    };
                    const config = {
                        headers: {
                            'Authorization': 'Bearer '+this.$store.state.tokenAuth
                        },
                        timeout: 10
                    };
                    console.log(this.url_api_mobile+'photos');
                    axios.post(this.url_api_mobile+'photos',data,config)
                        .then((res) =>{
                            console.log(res.data)
                            dialogs.confirm('Les photo a bien été sauvgarder dans la base de donnée :)')
                        })
                        .catch((err) =>{
                            dialogs.alert("Erreur avec la connection a la base de donnée!");
                            console.log(err);
                            this.isBusy = false;
                        })
                        .finally(()=>{
                            setTimeout(() =>{
                                this.isBusy = false;
                            });
                        });

                }

            },

            /**
             * Nom: setUrlToImg
             * Description: Permet de déifnir l'url aux images et de les ajouter à une série
             * Api utilisée : mobileApi
             * Route utilisée : series/:id/photos
             * Méthode : PUT
             * @param: string
             */
            setUrlToImg(urls){
                if (this.checkApiMobile()){
                    dialogs.alert("Une erreur est survenue avec l'api ")
                }else{
                    let compt = 0;
                    this.images.forEach((image) =>{
                        image.img.url = urls[compt];
                        compt++;
                    });
                    const data = {
                        data : {
                            images: this.images,
                            id : this.$store.state.idUtilisateur
                        },
                    };
                    const config = {
                        headers: {
                            'Authorization': 'Bearer '+this.$store.state.tokenAuth
                        },
                        timeout: 10
                    };
                    axios.put(this.url_api_mobile+'series/'+this.serie._id+"/photos",data,config)
                        .then((res) =>{
                            console.log(res.data)
                            dialogs.confirm('Votre photo a bien été sauvgarder dans la base de donnée et dans la série choisie :)')
                        })
                        .catch((err) =>{
                            dialogs.alert("L'association à la série a été interompu !");
                            console.log(err);
                            this.isBusy = false;
                        })
                        .finally(()=>{
                            setTimeout(() =>{
                                this.isBusy = false;
                            });
                        });

                }

            },
            /**
             * Name: logEvent
             * @params event
             * Description : Permet d'avoir le nom de l'event dans la requête
             */
            logEvent(e) {
                console.log(e.eventName);
                this.isBusy = true
                if(e.eventName === 'error'){
                    dialogs.alert("Une erreur est survenue avec l'upload de la photo ")
                }
            },

            /**
             * Nom: respondedHandler
             * @param: event
             * Description : Permet d'effectuer des traitement sur les données reçues après l'upload
             */
            respondedHandler(e) {
                const result = JSON.parse(e.data);
                const uploaded_image = result.data;
                this.urls.push(uploaded_image.url);
                if(this.images.length === this.urls.length){
                    if(this.serie === 'galerie'){
                        this.setUrlToImg2(this.urls);
                        this.images = [];
                        this.urls = []
                    }else{
                        this.setUrlToImg(this.urls);
                        this.images = [];
                        this.urls = []
                    }

                }
                this.isBusy = false
                dialogs.confirm('Votre photo a bien été upload dans le cloud :) ')
            },

            /**
             * Nom: getName
             * Description: Permet de récupérer le nom de l'image
             * @param path
             * @returns {*|parser.Node[]|string}
             */
            getName(path){
                const string = path.split('/');
                return string[string.length-1];
            },

            /**
             * Name: checkApiMobile
             * Description : permet de voir si l'api mobile fonctionne
             * @return boolean
             */
            checkApiMobile(){
                axios.get(this.url_api_mobile)
                    .then((result)=>{
                        return true;
                    })
                    .catch((err)=>{
                        console.log(err);
                        return false;
                    })
            }
        },

    }
</script>
<style>
</style>
