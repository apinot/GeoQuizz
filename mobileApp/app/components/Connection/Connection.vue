<template>
    <Page>
        <StackLayout>
            <TextField hint="john.doe@gmail.fr" v-model="email"></TextField>
            <TextField  hint="***********" v-model="password" secure="true"></TextField>
            <Button @tap="connection">Connection</Button>
            <ActivityIndicator :busy="isBusy" ></ActivityIndicator>

        </StackLayout>
    </Page>
</template>

<script>
    import axios from 'axios'
    import btoa from 'btoa'
    import {decode, encode} from 'base-64'
    import Home from "../Home";
    const dialogs = require("tns-core-modules/ui/dialogs");

    export default {
        props: {
        },
        data(){
            return{
                email:'',
                password: '',
                url_api_backOffice: "https://d2848aa3.ngrok.io/",
                isBusy: false,
            }
        },
        mounted() {
            if (!global.btoa) {
                global.btoa = encode;
            }

            if (!global.atob) {
                global.atob = decode;
            }
        },
        methods: {
            connection(){
                this.isBusy = true;
                const config = {
                    headers: {
                        Authorization: `basic ${this.base64Credentials()}`
                    }
                };
                axios.post(this.url_api_backOffice+"utilisateurs/auth", {}, config )
                    .then((res) => {
                        console.log(res.data.token);
                        this.$store.state.authToken = res.data.token;
                        console.log(this.$store.state.authToken)
                        this.$navigateTo(Home)
                    })
                    .catch((err) => {
                        console.log(err);
                        dialogs.alert("Vos identifiants sont invalides");
                        this.isBusy = false;
                    })
                    .finally(()=>{
                        setTimeout(() => {this.isBusy = false}, 3000)
                    })
            },
            base64Credentials() {
                console.log(this.email);
                console.log(this.password);
                return Buffer.from(`${this.email}:${this.password}`, 'utf-8').toString('base64');
            },
        },

    };
</script>
