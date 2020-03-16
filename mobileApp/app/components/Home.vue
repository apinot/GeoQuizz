<template>
    <Page>
        <ActionBar>
            <Label text="Home"></Label>
        </ActionBar>

        <StackLayout>
            <Button text="Take Picture" @tap="takePicture" />
            <Button text="Choose Picture" @tap="selectPicture" />
            <WrapLayout>
                <Image v-for="(image, key) in images" :key="key" :src="image.img.src" width="75" height="75"  />
            </WrapLayout>
        </StackLayout>

    </Page>
</template>

<script>
    import * as camera from "nativescript-camera";
    import * as imagepicker from "nativescript-imagepicker";
    import { Image } from "tns-core-modules/ui/image";
    import * as geolocation from "nativescript-geolocation";
    import { Accuracy } from "tns-core-modules/ui/enums";

    export default {
        data() {
            return {
                images:[]
            }
        },
        created(){
          geolocation.enableLocationRequest() ;
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
                        selection.forEach(selected => {

                            console.log(JSON.stringify(selected));

                            let img = new Image();
                            img.src = selected;

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
                                let location = geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high, maximumAge: 5000, timeout: 20000 })
                                let imgObject = {img: img, location: location};
                                this.images.push(imgObject);
                                console.log('ive got '+this.images.length+' images now.');
                            })
                            .catch(e => {
                                console.log('error:', e);
                            });
                    })
                    .catch(e => {
                        console.log('Error requesting permission');
                    });
            }
        }
    }
</script>

<style scoped lang="scss">
    @import '~@nativescript/theme/scss/variables/blue';

    // Custom styles
    .fas {
        @include colorize($color: accent);
    }

    .info {
        font-size: 20;
        horizontal-align: center;
        vertical-align: center;
    }
</style>
