const express = require('express');
const cors = require('cors');
const parser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const config = require('./config/server.conf.json');

// creation de l'application
const app = express();

app.use(cors());
app.use(parser.json());

// connexion à la base de données
mongoose.connect("mongodb://databaseGeoQuizz/Geoquizz", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

/* Models */
const Utilisateur = require('./models/Utilisateur');


/* Routes */
app.get('/', (req, res) => {
    res.json({app: 'Back-office GeoQuizz'});
});

app.post('/utilisateurs', (req, res) => {
    const {email, password, passwordConfirm} = req.body;

    // verifie que les données sont présentes
    if(!email || !password || !passwordConfirm || password !== passwordConfirm) {
        res.status(400).json({
            status: 400,
            msg: 'Bad Request',
        });
        return;
    }

    // verifie que l'utilisateur n'existe pas
    Utilisateur.find({ email }, (err, user) => {
        if(err) throw err;
        if(user && user.length > 0) {
            res.status(400).json({
                status: 400,
                msg: 'Bad Request',
            });
            return;
        }

        // Salage et hashage du mot de passe
        const secret = config.passwordSecret;
        bcrypt.hash(secret + password, 8)
            .then((hashed) => {
                const nouvelUtilisateur = new Utilisateur({
                    email,
                    password: hashed,
                    created_at: new Date(),
                })

                return nouvelUtilisateur.save();
            })
            .then((nouvelUtilisateur) => {
                res.status(201).json({
                    user: {
                        id: nouvelUtilisateur._id,
                        email: nouvelUtilisateur.email,
                    }
                })
            })
            .catch((error) => {
                throw error;
            });
    });
});



/* Gestion des erreurs */

// Lorsque l'url ne corrspond à aucune route
app.all('*', (req, res) => {
    res.status(400).json({
        status: 400,
        msg: 'Bad request',
    });
});

// Lorsqu'une erreur 500 est renvoyée
app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).json({
        status: 500,
        msg: 'Internal Server Error',
    });
});

/* Démarrage de l'api */
app.listen(8080, () => {
    console.log('api backoffice is running !');
});
