const express = require('express');
const cors = require('cors');
const parser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//create app
const app = express();
app.use(cors());
app.use(parser.json());


/*Models*/
const Utilisateur = require('./model/Utilisateur');
const Serie = require('./model/Serie');
const Photo = require('./model/Photo');


// connexion à la base de donnée mongo
mongoose.connect("mongodb://databaseGeoQuizz/Geoquizz", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const config = require('./config/server.conf.json');


/* Middelware d'authentification */
app.use((req, res, next) => {
    if(!req.headers.authorization) {
        next();
        return;
    }
    const [typeAuth, token] = req.headers.authorization.split(' ');
    if(!typeAuth || typeAuth !== 'bearer' || !token) {
        next();
        return;
    }
    jwt.verify(token, config.jwtSecret, (err, decoded) => {

        if (err) {
            throw err;
        }

        if (!decoded && !decoded.user) {
            next();
            return;
        }

        Utilisateur.findById(decoded.user)
            .then((user) => {
                if (!user) {
                    next();
                    return;
                }
                req.authUser = user;
                next();
            })
            .catch((error) => {
                throw error
            })
    });
});

app.post('/utilisateurs/auth', (req, res) => {
    setTimeout(() => {
        if(!req.headers.authorization) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }

        const credentialsBase64 = req.headers.authorization.split(' ')[1];
        if(!credentialsBase64) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }
        const [email, password] = Buffer.from(credentialsBase64, 'base64').toString('utf-8').split(':');
        if(!email || !password) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }

        Utilisateur.find({email}, (err, users) => {
            if(err) throw err;

            if(users.length !== 1) {
                res.status(401).json({status: 401, msg: 'Unauthorized'});
                return;
            }

            const [user] = users;

            bcrypt.compare(config.passwordSecret + password, user.password)
                .then((result) => {
                    if(!result) {
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

/*Routes*/
app.get("/", (req,res) =>{
    res.status(200).json({success: "bonjour de l'api Mobile"})
});

// app.post("/photos", (req, res) =>{
//
//     let photos = req.body.data.images[0];
//     //console.log(req.body.data);
//     //console.log(photos);
//     if(!photos) {
//         res.status(400).json({ status: 400, msg: 'Bad Request' });
//         return;
//     }
//
//     //initialisation de la photo
//     const lat = photos.location.latitude;
//     const lng = photos.location.longitude;
//     const url = photos.img.url;
//     const idUtilisateur = photos.idUtilisateur;
//     const newPhoto = new Photo({
//         position : {
//             lat: lat,
//             lng: lng
//         },
//         url: url,
//         idUtilisateur: idUtilisateur,
//         create_at : new Date()
//     });
//
//     //enregistrement de la photo
//     newPhoto.save()
//         .then((photo) => {
//             res.status(200).json(photo);
//         })
//         .catch((err) =>{
//             res.status(500).json({err})
//         });
// });

app.get('/series', (req, res) => {
    let {limit, offset} = req.query;

    if(!limit || !Number(limit) || limit > 25) limit = 25;
    if(!offset || !Number(offset) || offset < 0) offset = 0;

    const idUtilisateur = req.query.id;

    // Compte le nombre totals de séries
    Serie.count((err, count) => {
        if(err) throw err;
        //récupère les séries
        Serie.find({ idUtilisateur: idUtilisateur }).limit(Number(limit)).skip(Number(offset)).exec()
            .then((series) => {
                if(!series){
                    res.status(200).json({
                        count,
                        series: [],
                    })
                    return;
                }

                res.status(200).json({
                    count,
                    series,
                })
            })
            .catch((error) => {
                throw error;
            });
    });
});



app.put("/series/:id/photos", (req, res) => {
    setTimeout(()=>{
        if(!req.headers.authorization) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
        }},2000);

    const { id } = req.params;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        res.status(404).json({status: 404, msg: 'Serie Not Found'});
        return;
    }
    // TODO verifier la structure de l'objet photo
    let photos = req.body.data.images[0];
    if(!photos) {
        console.log('zinzin');
        res.status(400).json({ status: 400, msg: 'Bad Request' });
        return;
    }

    // application du middleware
    const idUtilisateur = req.body.data.id;

    Serie.findById(id, (err, serie) => {
        if(err) throw err;
        if(!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }
        if(serie.idUtilisateur !== idUtilisateur) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }
        // initialisation de la photo
        const lat = photos.location.latitude;
        const lng = photos.location.longitude;
        const url = photos.img.url;
        const newPhoto = new Photo({
            position : {
                lat: lat,
                lng: lng
            },
            url: url,
            idUtilisateur : idUtilisateur,
            create_at : new Date()
        });
        // sauvegarde l'id de la photo
        newPhoto.save().then((photo) => {
            serie.photos.push(photo.id);
            // mise à jour de la serie
            serie.save().then(() => {
                res.status(200).json(photo)
            });
        }).catch((err) =>{
            res.status(500).json({err})
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



app.listen(8080, () => {
    console.log('api mobile is running !');
});
