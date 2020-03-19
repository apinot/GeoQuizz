const express = require('express');
const cors = require('cors');
const parser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require('./config/server.conf.json');

// creation de l'application
const app = express();

app.use(cors());
app.use(parser.json());

/* Models */
const Utilisateur = require('./models/Utilisateur');
const Serie = require('./models/Serie');


/* Routes */
app.get('/', (req, res) => {
    res.json({app: 'Back-office GeoQuizz'});
});

/**
 * Permet la création d'un utilisateur (inscription)
 * 
 * Body 
 *  - email : email de l'utilisateur (identifiant)
 *  - password : mot de passe de l'utilisateur
 *  - passwordConfirm : confirmation du mot de passe (doit être identique à password)
 * 
 * @return
 *      utilisateur créé
 */
app.post('/utilisateurs', (req, res) => {
    // TODO verifier que c'est un email

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


/**
 * Permet la connexion d'un utilisateur
 * 
 * Query
 *  - id: id de l'utilisateur
 * 
 * Autorization 
 *  - basic email:password
 * 
 * @return
 *      - utilisateur
 *      - token
 */
app.post('/utilisateurs/auth', (req, res) => {
    setTimeout(() => {
        console.log(req.headers.authorization);
        if(!req.headers.authorization) {
            console.log('j');
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }
    
        const credentialsBase64 = req.headers.authorization.split(' ')[1];
        if(!credentialsBase64) {
            console.log('u');
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }

        const [email, password] = Buffer.from(credentialsBase64, 'base64').toString('utf-8').split(':');
        if(!email || !password) {
            console.log('s');
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }

        Utilisateur.find({email}, (err, users) => {
            if(err) throw err;

            if(users.length !== 1) {
                res.status(404).json({status: 401, msg: 'Unauthorized'});
                return;
            } 

            const [user] = users;

            bcrypt.compare(config.passwordSecret + password, user.password)
                .then((result) => {
                    if(!result) {
                        console.log('t');
                        res.status(401).json({status: 401, msg: 'Unauthorized'});
                        return;
                    }

                    const token = jwt.sign({user: user._id}, config.jwtSecret);

                    res.status(200).json({
                        user: {
                            id: user._id,
                            email: user.email,
                        },
                        token,
                    })
                })
                .catch((error) => {
                    throw error;
                });
        });
    }, 2000);
});

/** Permet de récupérer les données d'une série
 * 
 *  Query : 
 *   - id : id de la série
 * @return
 *      les données relatives à la série
*/
app.get('/series/:id', (req, res) => {
    const { id } = req.params;
    Serie.findById(id, (err, serie) => {
        if(err) throw err;
        if(!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }

        res.status(200).json({
            serie: {
                serie: {
                    id: serie._id,
                    ville: serie.ville,
                    map: serie.map,
                    nb_photos: serie.nb_photos.length,
                    created_at: serie.created_at,
                }
            }
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

    // connexion à la base de données
    mongoose.connect("mongodb://databaseGeoQuizz/Geoquizz", {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    console.log('api backoffice is running !');
});
