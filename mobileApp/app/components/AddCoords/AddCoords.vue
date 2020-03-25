<template>
    <Page class="page">
        <ActionBar class="action-bar" title="Location Image"></ActionBar>
        <GridLayout rows="12*,1*">
            <Mapbox row="0"
                    accessToken="pk.eyJ1Ijoic2RhbHBvbnQiLCJhIjoiY2s2aHNnOGg1MWRldjNlbnZnMXVnMjZ1NyJ9.WA5qIfHYzZ25Y7oWcB3QDA"
                    latitude="48.692054"
                    longitude="6.184417"
                    zoomLevel="11"
                    showUserLocation="true"
                    @mapReady="onMapReady($event)">
            </Mapbox>
            <Button @tap="save" row="1">Sauvegarder la position</Button>
        </GridLayout>

    </Page>
</template>

<script>
    import {Utils as utils} from "@nativescript/core";
    import MapBox from 'nativescript-mapbox'
    import Home from '../Home'
    const dialogs = require("tns-core-modules/ui/dialogs");

    export default {

        //La liste de toutes les variables utilisés dans les méthodes ci-dessous
        data(){
            return {
                lat : null,
                lng : null
            }
        },

        methods: {
            /**
             * Nom: onMapReady
             * Description: Permet d'initialisé la map et d'ajouter un point lorsque l'on tap sur la map
             * @param args
             */
            onMapReady(args){
                args.map.setOnMapClickListener((point= LatLng) => {
                    args.map.removeMarkers([1]);
                    console.log("Map clicked at latitude: " + point.lat + ", longitude: " + point.lng);
                    this.lat = point.lat;
                    this.lng = point.lng;
                    args.map.addMarkers([{
                        id: 1,
                        lat: point.lat,
                        lng: point.lng,
                    }]);
                    console.log('lat'+ this.lat)
                });
            },

            /**
             * Name: save
             * Description: Permet de gérer les erreurs si l'on ne définit pas de point sur la map et que l'ont sauvgarde
             */
            save(){
                const coords = {
                    lat: this.lat,
                    lng: this.lng
                };
                if(coords.lat === null){
                    dialogs.alert("Vous n'avez pas choisis de position")
                }else{
                    this.$modal.close(coords)

                }
            }
        }

    };
</script>
<style scoped="scss">

</style>
