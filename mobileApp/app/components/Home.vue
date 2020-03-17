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
</template>

<script>
    import btoa from 'btoa'
    import * as camera from "nativescript-camera";
    import * as imagepicker from "nativescript-imagepicker";
    import { Image } from "tns-core-modules/ui/image";
    import * as geolocation from "nativescript-geolocation";
    const bghttp = require("nativescript-background-http");
    const session = bghttp.session("image-upload");
    import AddCoords from "./AddCoords/AddCoords";


    export default {
        components: {
           AddCoords
        },
        data() {
            return {
                images:[],
                location: null,
                images_uploaded: null
            }
        },
        created(){
            geolocation.enableLocationRequest();


        },
        methods:{
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
                            console.log(selected);
                            let img = new Image();
                            img.src = selected;
                            let obj = {img: img};
                            this.images.push(obj);
                            console.log(this.images.length)
                        });
                    }).catch(function (e) {
                    console.log('error in selectPicture', e);
                });
            },
            takePicture() {
                camera.requestPermissions()
                    .then(() => {
                        camera.takePicture({ width: 300, height: 300, keepAspectRatio: true, saveToGallery:false })
                            .then(imageAsset => {
                                let img = new Image();
                                img.src = imageAsset;
                                console.log(imageAsset);
                                let obj = new Object();
                                geolocation.getCurrentLocation( {timeout: 5000} )
                                    .then(function (location) {
                                        console.log(location.latitude);
                                        console.log(location.longitude);
                                        this.location = {lat: location.latitude, long:location.longitude};
                                    }, function (e) {
                                        console.log("Error: " + e.message);
                                    });
                                obj.img = img;
                                obj.location = this.location;
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

                const url = 'https://api.imgbb.com/1/upload';
                const api_key=  'bf1794aedb1cd3df011c27ee66f9c5e8';

                this.images.forEach((image) => {
                    console.log(this.getName(image.img.src.android));
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
                })

            },
            logEvent(e) {
                console.log(e.eventName);
            },
            respondedHandler(e) {
                const result = JSON.parse(e.data);
                const uploaded_image = result.data;
                console.log(uploaded_image.url); //url de l'image
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
            }
        },

    }
</script>
