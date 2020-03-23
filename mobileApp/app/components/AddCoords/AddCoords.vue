<template>
    <Page class="page">
        <ActionBar class="action-bar" title="Vue Mapbox Example"></ActionBar>
        <GridLayout>
            <Mapbox
                    accessToken="pk.eyJ1Ijoic2RhbHBvbnQiLCJhIjoiY2s2aHNnOGg1MWRldjNlbnZnMXVnMjZ1NyJ9.WA5qIfHYzZ25Y7oWcB3QDA"
                    >
            </Mapbox>
        </GridLayout>
    </Page>
</template>

<script>
    import {Utils as utils} from "@nativescript/core";
    import MapBox from 'nativescript-mapbox'
    export default {
        props: {
        },

        methods: {

        }

    };
</script>
