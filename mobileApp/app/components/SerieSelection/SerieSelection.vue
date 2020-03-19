<template>
    <WrapLayout class="SerieSelection">
        <Label text="coucou"></Label>
    </WrapLayout>
</template>

<script>

    import axios from 'axios'
    export default {
        props: {
        },
        data(){
          return {
              series: []
          }
        },
        mehods: {
            getSerie(){
                axios.get('')
            }
        }
    };
</script>
