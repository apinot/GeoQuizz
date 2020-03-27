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
const Utilisateur = require('../model/Utilisateur');
const Serie = require('../model/Serie');
const Photo = require('../model/Photo');


// connexion à la base de donnée mongo
mongoose.connect("mongodb://databaseGeoQuizz/Geoquizz", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const config = require('../config/server.conf.json');


/* Middelware d'authentification */
//Permet de voir si l'utilisateur possède un token lorsqu'il réalise une requête
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
/*Routes*/

/**
 * Connexion de l'utilisateur
 * Gestion des droits d'accès
 * @api {post} /utilisateurs/auth
 * @apiName Connexion
 * @apiGroup Utilisateur
 * 
 * @apiHeader (Authorisation) {basic} email:password Identifiants de connexion de l'utilisateur encodés en base64
 * 
 * @apiSuccess {Utilisation} L'utilisateur et son token
 * 
 * @apiError 401 Authentification incorrecte
 * @apiError 500 Erreur interne
 * 
 */
app.post('/utilisateurs/auth', (req, res) => {
    setTimeout(() => {
        // Vérification des droit de l'utilisateur
        if(!req.headers.authorization) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }

        // Vérification de la précence des autorisation dans le headers
        const credentialsBase64 = req.headers.authorization.split(' ')[1];
        if(!credentialsBase64) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }

        // Dechiffrage des identifiants de l'utilisateur et verification de ces derniers
        const [email, password] = Buffer.from(credentialsBase64, 'base64').toString('utf-8').split(':');
        if(!email || !password) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }

        // Requête pour trouver l'utilisateur
        Utilisateur.find({email}, (err, users) => {
            if(err) throw err;

            if(users.length !== 1) {
                res.status(401).json({status: 401, msg: 'Unauthorized'});
                return;
            }
            const [user] = users;
            // Comparaison des password
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


app.get("/", (req,res) =>{
    res.status(200).json({success: "bonjour de l'api Mobile"})
});

/**
 * Listes des photos
 * Gestion des droits d'accès
 * @api {post} /photos
 * @apiName AddPhotos
 * @apiGroup Photos
 * 
 * @apiHeader (String) {access-key} Users unique access-key.
 * 
 * @apiParam (Object) {Images} Liste original de photo
 * @apiParam (Object) {UUID} id de l'utilisateur
 * 
 * @apiSuccess {Photo} Photo La photos ajoutée
 * 
 * @apiError 401 Authentification incorrecte
 * @apiError 500 Problème avec la base de donnée
 * @apiError 400 Pas de photo dans le body de la requete
 */
app.post("/photos", (req, res) =>{
    // Vérification des droit de l'utilisateur
    if (!req.headers.authorization) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    let photos = req.body.data.images;
    let id  = req.body.data.id;
    // Condition pour si les bon paramètre on été ajouter dans la requête
    if(!photos) {
        res.status(400).json({ status: 400, msg: 'Bad Request' });
        return;
    }
    photos.forEach((photo)=>{
        //initialisation de la photo
        const lat = photo.location.latitude;
        const lng = photo.location.longitude;
        const url = photo.img.url;
        const idUtilisateur = id;
        const newPhoto = new Photo({
            position : {
                lat: lat,
                lng: lng
            },
            url: url,
            user: idUtilisateur,
            created_at : new Date()
        });
        console.log(newPhoto)
        //enregistrement de la photo
        newPhoto.save()
            .then((photo) => {
                res.status(200).json(photo);
            })
            .catch((err) =>{
                res.status(500).json({err})
            });
    })

});


/**
 * Edit Series
 * Gestion des droits d'accès
 * @api {put} /serie/:id
 * @apiName EditPhoto
 * @apiGroup Series
 * 
 * @apiHeader (String) {access-key} Users unique access-key. 
 *  
 * @apiParam (URI) {UUID} id Id de la série
 * @apiParam (BODY) {Serie} Serie Serie à modifier
 * @apiParam (BODY) {Number} user Id de l'utilisateur
 * 
 * @apiError 401 Authentification incorrecte
 * @apiError 500 Problème avec la base de donnée
 * @apiError 404 Série non trouvé dans la base de donnée
 * 
 * @apiSuccess {200} {Photo} La série édité
 */
app.put('/serie/:id', (req,res)=>{
    // Vérification des droit de l'utilisateur
    if (!req.headers.authorization) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    const {id} = req.params;
    const updateSerie = req.body;
    const idUtilisateur = req.body.user;

    // Requête pour trouver la série
    Serie.findById(id, (err, serie) => {
        if (err) throw err;
        if (!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }
        // vérification du propriétaire de la série
        if (serie.user !== idUtilisateur) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }
        // Update de la série
        serie.ville =  updateSerie.ville;
        serie.dist = updateSerie.dist;
        serie.descr = updateSerie.descr;
        serie.map.lat = updateSerie.lat;
        serie.map.lng = updateSerie.lng;
        serie.map.zoom = updateSerie.zoom;
        serie.user = updateSerie.user;
        serie.created_at = new Date();
        // Sauvegarde de la série
        serie.save().then((serie) => {
            res.status(200).json(serie)
        }).catch((err)=>{
            res.status(500).json({err})
        })
    })

});

/**
 * Ajout Series
 * Gestion des droits d'accès
 * @api {get} /series
 * @apiName GetSeries
 * @apiGroup Series
 * 
 * @apiHeader (String) {access-key} Users unique access-key. 
 *
 * @apiSuccess {200} {Series} La série édité
 * 
 * @apiError 401 Authentification incorrecte
 * @apiError 500 Problème avec la base de donnée
 * 
 */
app.post('/series', (req, res) => {
    // Vérification des droit de l'utilisateur
    if (!req.headers.authorization) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    const serie = req.body;
    const newSerie = new Serie({
        ville: serie.ville,
        dist: serie.dist,
        nom: serie.nom,
        descr: serie.descr,
        map: {
            lat: serie.lat,
            lng: serie.lng,
            zoom: serie.lng
        },
        photos: serie.photos,
        user: serie.user,
        created_at: new Date()
    });
    //Ajout de la série
    newSerie.save().then((serie)=>{
        res.status(200).json({serie})
    }).catch((err) => {
        res.status(500).json({err})
    })
});

/**
 * Suppression Series
 * Gestion des droits d'accès
 * @api {get} /series/id
 * @apiName DeleteSeries
 * @apiGroup Series
 * 
 * @apiHeader (String) {access-key} Users unique access-key. 
 * 
 * @apiParam (URI) {String} id
 * 
 * @apiError 401 Authentification incorrecte
 * @apiError 500 Problème avec la base de donnée
 * @apiError 404 Série non trouvé dans la base de donnée
 * 
 * @apiSuccess {response : 'deleted'} La série supprimé
 * 
 */
app.delete('/series/:id/', (req, res) => {
    const { id } = req.params;
    // Condition pour voir si l'utilisateur a la droit d'effectuer la requête
    if (!req.headers.authorization) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    const idUtilisateur = req.query.id;
    // Requête pour trouver la série
    Serie.findById(id, (err, serie) => {
        if(err) throw err;
        if(!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }
        // vérification du propriétaire de la série
        if(serie.user !== idUtilisateur) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }
    });
    // Suppression de la série
    Serie.findByIdAndDelete(id, (err) => {
        if(err) throw err;
        res.status(200).json({response: 'deleted'});
    });
});

/**
 * Liste Series
 * Gestion des droits d'accès
 * @api {get} /series
 * @apiName GetSeries
 * @apiGroup Series
 * 
 * @apiHeader (String) {access-key} Users unique access-key. 
 * 
 * @apiParam (QUERY) {String} limit valeur pour limité la récupération des série
 * @apiParam (QUERY) {String} offset valeur pour limité la récupération des série
 * 
 * @apiSuccess {Series} Series Le nombre total de séries de l'utilisateur et la liste des séries à partir de offset (avec size element) * @apiError 500 Problème avec la base de donnée
 * 
 * @apiError 500 Erreur interne
 */
app.get('/series', (req, res) => {

    let {limit, offset} = req.query;
    if(!limit || !Number(limit) || limit > 25) limit = 25;
    if(!offset || !Number(offset) || offset < 0) offset = 0;
    const idUtilisateur = req.query.id;

    // Compte le nombre totals de séries
    Serie.count((err, count) => {
        if(err) throw err;
        //récupère les séries
        Serie.find({ user: idUtilisateur }).limit(Number(limit)).skip(Number(offset)).exec()
            .then((series) => {
                if(!series){
                    res.status(200).json({
                        count,
                        series: [],
                    });
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


/**
 * Ajout de photo dans une series
 * Gestion des droits d'accès
 * @api {put} /series/id/photos
 * @apiName AddPhotoToSeries
 * @apiGroup Series
 * 
 * @apiHeader (String) {access-key} Users unique access-key.
 * 
 * @apiParam (BODY) {Image} Image
 * 
 * @apiError 500 Erreur interne
 * @apiError 404 Pas de série trouver
 * @apiError 401 Pas autorisé à effectuer la requête
 * @apiError 400 Mauvaise requête
 * 
 * @apiSuccess {Series} La série modifié
 */
app.put("/series/:id/photos", (req, res) => {
    //Application du middleware
    setTimeout(()=>{
        if(!req.headers.authorization) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
        }},2000);

    const { id } = req.params;
    // Regex pour savoir si l'id a le bon type
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        res.status(404).json({status: 404, msg: 'Serie Not Found'});
        return;
    }
    // TODO verifier la structure de l'objet photo
    let photos = req.body.data.images;
    // Condition pour voir si le body contient bien des images
    if(!photos) {
        res.status(400).json({ status: 400, msg: 'Bad Request' });
        return;
    }

    const idUtilisateur = req.body.data.id;
    // Requete pour trouver la série avec l'id placé en paramètre
    Serie.findById(id, (err, serie) => {
        if(err) throw err;
        // Condition si la série n'a pas été trouvé
        if(!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }
        // Condition pour savoir si c'est bien la série de l'utilisateur
        if(serie.user !== idUtilisateur) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }
        let tab = serie.photos;
        // Sauvegarde de la photo
        async function savePhoto() { 
            for (const photo of photos) {
                // initialisation de la photo
                const lat = photo.location.latitude;
                const lng = photo.location.longitude;
                const url = photo.img.url;
                const newPhoto = new Photo({
                    position : {
                        lat: lat,
                        lng: lng
                    },
                    url: url,
                    user : idUtilisateur,
                    created_at : new Date()
                });
                // sauvegarde l'id de la photo
                const phot = await newPhoto.save();
                    tab.push(phot._id);
                    console.log(tab);
                    console.log(phot)
            }
            return tab;
        }
        // Sauvegarde de la série
        savePhoto().then((tab2) => {
            serie.photos = tab2;
            serie.save().then((saved) => {
                res.status(200).json({
                    serie: {
                        id: saved._id,
                        ville: saved.ville,
                        nom : saved.nom,
                        descr: saved.descr,
                        dist: saved.dist,
                        map: {
                            lat: saved.map.lat,
                            lng: saved.map.lng,
                        },
                        zoom: saved.map.zoom,
                        photos: saved.photos,
                    }
                });
            }).catch((err) =>{
                res.status(500).json({err})
            });
        })
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

// L'api écoute le port 8080
app.listen(8080, () => {
    console.log('api mobile is running !');
});
