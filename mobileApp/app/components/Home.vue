<template>
    <Page>
        <ActionBar title="GeoQuiz"/>
        <StackLayout>
            <Button text="Take Picture" @tap="takePicture" />
            <Button text="Choose Picture" @tap="selectPicture" />
            <WrapLayout>
                <Image v-for="img in images" :src="img.img.src" width="75" height="75" />
            </WrapLayout>
            <Button text="Upload" @tap="sendPictures" />

        </StackLayout>
    </Page>
</template>


<script>
    import * as camera from "nativescript-camera";
    import * as imagepicker from "nativescript-imagepicker";
    import { Image } from "tns-core-modules/ui/image";
    import * as geolocation from "nativescript-geolocation";
    const bghttp = require("nativescript-background-http");
    const session = bghttp.session("image-upload");
    import AddCoords from "./AddCoords/AddCoords";
    import axios from 'axios/dist/axios';
    const dialogs = require("tns-core-modules/ui/dialogs");
    import SerieSelection from "./SerieSelection/SerieSelection";

    export default {
        components: {
           AddCoords,
           SerieSelection
        },
        data() {
            return {
                images:[],
                location: null,
                images_uploaded: null,
                urls: [],
                data: [],
                serie: null,
                url_api_mobile: "https://9278aa32.ngrok.io/",
            }
        },
        created(){
            geolocation.enableLocationRequest();
            console.log(this.$store.state.tokenAuth);
            this.$showModal(AddCoords)
        },
        methods:{
            selectPicture() {
                //TODO Faire la selection des images et gerer les autaurisations
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
                            this.$navigateTo(AddCoords)

                        });
                    }).catch(function (e) {
                    console.log('error in selectPicture', e);
                });
            },
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
                                console.log(this.images.length);


                            })
                            .catch(e => {
                                console.log('error:', e);
                            });
                    })
                    .catch(e => {
                        console.log('Error requesting permission :'+ e);
                    });
            },
            sendPictures(){
                if(this.images.length > 0){
                    this.$showModal(SerieSelection)
                        .then( serie => {
                            this.serie = serie;
                            if(serie){
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
                            }else{
                                dialogs.alert("Vous n'avez pas choisis de serie")
                            }
                        });

                }else{
                    dialogs.alert("Aucune photos selectionnées")
                }
            },

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
                            dialogs.confirm('Votre photo a bien été sauvgarder dans la base de donnée et dans la série choisie :)')
                        })
                        .catch((err) =>{
                            dialogs.alert("L'association à la série a été interompu !");
                            console.log(err)
                        });
                }

            },
            logEvent(e) {
                console.log(e.eventName);
                if(e.eventName === 'error'){
                    dialogs.alert("Une erreur est survenue avec l'upload de la photo ")
                }
            },
            respondedHandler(e) {
                const result = JSON.parse(e.data);
                const uploaded_image = result.data;
                this.urls.push(uploaded_image.url);
                if(this.images.length === this.urls.length){
                    this.setUrlToImg(this.urls);
                    this.images = [];
                    this.urls = []
                }
                dialogs.confirm('Votre photo a bien été upload dans le cloud :) ')

            },
            getName(path){
                const string = path.split('/');
                return string[string.length-1];
            },
            //TODO ajouter les coordonées a une photo prise dans la galerie
            // addCoords(obj){
            //     this.$navigateTo(AddCoords)
            //         .then(coords => {
            //             if (coords){
            //                 obj.location = coords;
            //                 this.images.push(obj)
            //             }
            //         })
            // },
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
