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

        //La liste de toutes les components utilisés dans la vue
        components:{
            Home,
        },

        //La liste de toutes les variables utilisés dans les méthodes ci-dessous
        data(){
            return{
                email:'',
                password: '',
                url_api_mobile: '',
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
        /**
         * Description : Permet de définir le propriété url_api_mobile avec la valeur de la variable api_mobile du store
         */
        created(){
            this.url_api_mobile = this.$store.state.api_mobile
        },
        methods: {

            /**
             * Nom : connection
             * Description : Cette fonction permet a un utilisateur de se connecter, générer un token unique et de récupérer son ID
             * Api utilisée : mobileApp
             * Route utilisée : utilisateurs/auth
             * Méthode : POST
             */
            connection(){
                console.log(this.url_api_mobile)
                this.isBusy = true;
                const config = {
                    headers: {
                        Authorization: `basic ${this.base64Credentials()}`
                    }
                };
                axios.post(this.url_api_mobile+"utilisateurs/auth", {}, config )
                    .then((res) => {
                        console.log(res.data.token);
                        this.$store.state.authToken = res.data.token;
                        console.log(this.$store.state.authToken);
                        this.$store.state.idUtilisateur = res.data.user.id;
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

            /**
             * Nom : base64Credentials
             * Description : Cette fonction permet de convertir en base64 l'email et le password de l'utilisateur en une chaine de caractères
             * @returns {string}
             */
            base64Credentials() {
                console.log(this.email);
                console.log(this.password);
                return Buffer.from(`${this.email}:${this.password}`, 'utf-8').toString('base64');
            },
        },

    };
</script>
