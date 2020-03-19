<template>
    <Page>
        <ActionBar title="Camera Tests FTW!"/>
        <StackLayout>
            <Button text="Take Picture" @tap="takePicture" />
            <Button text="Choose Picture" @tap="selectPicture" />
            <WrapLayout>
                <Image v-for="img in images" :src="img.img.src" width="75" height="75" />
            </WrapLayout>
            <Button text="Upload" @tap="sendPictures" />

        </StackLayout>
    </Page>
</template>/storage/emulated/0/DCIM/Camera/IMG_20200316_174255.jpg

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
                urls: []
            }
        },
        created(){
            geolocation.enableLocationRequest();


        },
        methods:{
            selectPicture() {
                let context = imagepicker.create({
                    mode: 'multiple'
                });
                context.authorize()
                    .then(function() {
                        return context.present();
                    })
                    .then(selection => {
                        console.log("sleetction: " + selection[0]);
                        selection.forEach(selected => {
                            console.log(selected);
                            let img = new Image();
                            img.src = selected;
                            let obj = {img: img};
                            this.images.push(obj);
                            console.log(obj.img);
                            console.log(this.images.length)
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

                            })
                            .catch(e => {
                                console.log('error:', e);
                            });
                    })
                    .catch(e => {
                        console.log('Error requesting permission');
                    });


            },
            sendPictures(){
                this.$showModal(SerieSelection)
                    .then( serie => {
                        console.log(serie);
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

            },

            setUrlToImg(urls){

                if (this.checkApiMobile()){

                    dialogs.alert("Une erreur est survenue avec l'api ")

                }else{

                    let compt = 0;

                    this.images.forEach((image) =>{

                        image.img.url = urls[compt];
                        compt++;
                        //console.log('URL dans setURLTOIMG : '+image.img.url);

                    });
                    const data = {
                        data : this.images
                    };

                    axios.post("https://fdfdffbc.ngrok.io/photos", data)
                        .then((result)=>{
                            dialogs.alert('Votre photo a bien été upload :)').

                            then(()=>{
                                console.log('dialog closed')
                            })
                        })
                        .catch((err)=>{
                            console.log(err)
                        })
                }

            },
            logEvent(e) {
                console.log(e.eventName);
                if(e.eventName === 'error'){
                    dialogs.alert("Une erreur est survenue avec l ")
                }
            },
            respondedHandler(e) {
                const result = JSON.parse(e.data);
                const uploaded_image = result.data;
                //console.log(uploaded_image.url); //url de l'image
                this.urls.push(uploaded_image.url);
                //console.log(this.urls);
                if(this.images.length === this.urls.length){
                    this.setUrlToImg(this.urls);
                    //console.log(this.images[0].location)
                    this.images = [];
                    this.urls = []
                }

            },
            getName(path){
                const string = path.split('/');
                return string[string.length-1];
            },

            addCoords(obj){
                this.$navigateTo(AddCoords)
                    .then(coords => {
                        if (coords){
                            obj.location = coords;
                            this.images.push(obj)
                        }
                    })
            },
            checkApiMobile(){
                axios.get("https://fdfdffbc.ngrok.io/")
                    .then((result)=>{
                        console.log(result.data);
                        dialogs.alert('Votre photo a bien été upload :)').
                        then(()=>{
                            console.log('dialog closed');
                            return true;
                        })
                    })
                    .catch((err)=>{
                        console.log(err);
                        return false;
                    })
            }
        },

    }
</script>
