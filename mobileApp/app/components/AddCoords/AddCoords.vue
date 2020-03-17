<template>
    <Page xmlns="http://schemas.nativescript.org/tns.xsd" xmlns:map="nativescript-mapbox" navigatingTo="navigatingTo">
        <StackLayout>
            <Label text="Nice map, huh!" class="title"/>
            <ContentView height="240" width="240">
                <!-- IMPORTANT: plugin version 3 uses :MapboxView, lower versions use :Mapbox -->
                <map:MapboxView
                        accessToken="your_token"
                        mapStyle="traffic_night"
                        latitude="52.3702160"
                        longitude="4.8951680"
                        zoomLevel="3"
                        showUserLocation="true"
                        mapReady="onMapReady">
                </map:MapboxView>
            </ContentView>
        </StackLayout>
    </Page>
</template>

<script>
    export default {
        props: {
        },
    };
</script>
