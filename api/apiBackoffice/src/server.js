const express = require('express');
const cors = require('cors');
const parser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require('../config/server.conf.json');

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
const Utilisateur = require('../models/Utilisateur');
const Serie = require('../models/Serie');
const Photo = require('../models/Photo');

/* Middelware d'authentification */
app.use((req, res, next) => {
    if(!req.headers.authorization) {
        next();
        return;
    }

    const [typeAuth, token] = req.headers.authorization.split(' ');
    if(!typeAuth || typeAuth.toLocaleLowerCase() !== 'bearer' || !token) {
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
 * @api {post} /utilisateurs Inscription d'un utilisateur
 * @apiName CreateUser
 * @apiGroup Utilisateurs
 * 
 * @apiParam (BODY) {String} email Email de l'utilisateur (unique)
 * @apiParam (BODY) {String} password Mot de passe de l'utilisateur
 * @apiParam (BODY) {String} passwordConfirm Confirmation du mot de passe de l'utilisateur
 * 
 * @apiSuccess (201) {Utilisateur} user Retourne l'id et l'email du nouvel utilisateur
 * @apiError 400 Les données rensignées sont incomplètes ou l'email est déjà utilisé par un utilisateur
 * @apiError 500 Erreur interne
 * 
 */
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


/**
 * Permet la connexion d'un utilisateur
 *
 * Autorization
 *  - basic email:password
 * 
 * @api {post} /utilisateurs/auth Authentification d'un utilisateur
 * @apiName UserAuth
 * @apiGroup Utilisateurs
 * 
 * @ApiHeader (Authorisation) {basic} email:password Identifiants de connexion de l'utilisateur encodés en base64
 * 
 * @apiSuccess {Mixed} AuthInformation Informations principales de l'utilisateur (id & email) et token de vérification de l'authentification.
 * @apiError 401 Echec de l'authentification
 * @apiError 500 Erreur interne
 */
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

/**
 * Permet de récupérer la liste des séries
 *
 * Query:
 *  size: nombre d'éléments à recupérer (optionel, max 50, 10 par défault)
 *  offset: (optionel, 0 par défault)
 *
 * @api {get} /series Listes des séries de l'utilisateur actuellement authentifié
 * @apiName GetSeries
 * @apiGroup Series
 * 
 * @apiHeader (Authorization) {bearer} token token obtenu lors de l'authentification
 * 
 * @apiParam (QUERY) {Number} [offset=0] Décalage dans la liste de résultat (min: 0)
 * @apiParam (QUERY) {Number} [size=10] Nombre d'élement du résultat (min: 1, max: 50)
 * 
 * @apiSuccess {Series[]} Series Le nombre total de séries de l'utilisateur et la liste des séries à partir de offset (avec size element)
 * @apiError 401 Authentification incorrecte
 * @apiError 500 Erreur interne
 */
app.get('/series', (req, res) => {
    let {size, offset} = req.query;
    if(!size || !Number(size) || size > 50 || size < 1) size = 10;
    if(!offset || !Number(offset) || offset < 0) offset = 0;
    if(!req.authUser) {
        console.log(req.authUser)
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }

    Serie.countDocuments({ user: req.authUser._id }).exec((errCount, count) => {
        if(errCount) throw errCount;

        //récupère les séries
        Serie.find({ user: req.authUser._id }).limit(Number(size)).skip(Number(offset)).exec()
        .then((series) => {
            if(!series){
                res.status(200).json({
                    total: 0,
                    series: [],
                })
                return;
            }

            res.status(200).json({
                total: count,
                series: series.map(s => ({
                    id: s._id,
                    ville: s.ville,
                    dist: s.dist,
                    nom: s.nom,
                    descr: s.descr,
                })),
            })
        })
        .catch((error) => {
            throw error;
        });
    });
});

/**
 * Permet de récupérer les données d'une série
 *
 *  URI :
 *   - id : id de la série
 * 
 * @api {get} /serie/:id Obtenir une serie par son id
 * @apiName GetSerieById
 * @apiGroup Series
 * 
 * @apiHeader (Authorization) {bearer} token token obtenu lors de l'authentification
 * 
 * @apiParam (URI) {UUID} id Id de la série à récupérer
 * 
 * @apiSuccess {Serie} serie Informations de lma série (id, nom, descr, ville, dist, nb_photos, created_at)
 * @apiError 404 L'id ne correspond pas à une série existante
 * @apiError 401 Authentification impossible ou la série n'appartient pas à l'utilisateur
 * @apiError 500 Erreur interne
 * 
*/
app.get('/series/:id', (req, res) => {
    const { id } = req.params;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        res.status(404).json({status: 404, msg: 'Serie Not Found'});
        return;
    }
    if(!req.authUser) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }

    Serie.findById(id, (err, serie) => {
        if(err) throw err;
        if(!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }
        if(serie.user != req.authUser._id) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }

        res.status(200).json({
            serie: {
                id: serie._id,
                nom: serie.nom,
                descr: serie.descr,
                ville: serie.ville,
                dist: serie.dist,
                map: serie.map,
                nb_photos: serie.photos.length,
                created_at: serie.created_at,
            }
        });
    });
});


/**
 * Permet de créer une série
 * 
 * @api {post} /series Création d'une série
 * @apiName CreateSerie
 * @apiGroup Series
 * 
 * @apiHeader (Authorization) {bearer} token token obtenu lors de l'authentification
 * 
 * @apiParam (BODY) {String} nom Nom de la série
 * @apiParam (BODY) {String} descr Description de la série
 * @apiParam (BODY) {String} ville Ville de la série
 * @apiParam (BODY) {Number} dist Valeur de la distance D de calcul des points
 * @apiParam (BODY) {UUID[]} photos Tableau d'id de photos à associer à la série (peut être un talbeau vide)
 * @apiParam (BODY) {Object} map Carte de la série (position easy-vue-leaflet : {lat, lng, zoom} )
 * 
 * @apiSuccess {Serie} serie informations de la série créée
 * @apiError 401 L'utilisateur n'est pas authentifié
 * @apiError 400 Les données renseignées sont incorrecte
 * @apiError 500 Erreur interne
 * 
 */
app.post('/series', (req, res) => {
    if(!req.authUser) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    const serie = req.body;
    
    if(!serie.ville
        || !serie.dist || !Number(serie.dist) || !serie.map
        || !serie.ville || !serie.descr || !serie.nom
        || !serie.map.lat || !serie.map.lng || !serie.map.zoom
        || !Number(serie.map.lat) || !Number(serie.map.lng) || !Number(serie.map.zoom)
    ) {
        res.status(400).json({status: 400, msg: 'Bad Request'});
        return;
    }

    const newSerie = new Serie({
        ville: serie.ville,
        dist: serie.dist,
        nom: serie.nom,
        descr: serie.descr,
        map : {
            lat: serie.map.lat,
            lng: serie.map.lng,
            zoom: serie.map.lng
        },
        photos: serie.photos,
        user: req.authUser._id,
        create_at : new Date()
    });

    newSerie.save().then((data) => {
        res.status(200).json({data})
    }).catch((err) =>{
        throw err;
    });
    // TODO ajouté des photos

});


/**
 * Met à jour les règles de la serie
 * Query :
 *   - id : id de la série
 * Body :
 *   - rules: {
 *       ville
 *       distance
 *       map: {
 *         lat
 *         lng
 *       }
 *       zoom
 *     }
 * 
 * @api {put} /series/:id Mise à jour d'une série
 * @apiName updateSerie
 * @apiGroup Series
 * 
 * @apiHeader (Authorization) {bearer} token token obtenu lors de l'authentification
 * 
 * @apiParam (URI) {UUID} id Id de la série à récupérer
 * @apiParam (BODY) {String} nom Nom de la série
 * @apiParam (BODY) {String} descr Description de la série
 * @apiParam (BODY) {String} ville Ville de la série
 * @apiParam (BODY) {Number} dist Valeur de la distance D de calcul des points
 * @apiParam (BODY) {UUID[]} photos Tableau d'id de photos à associer à la série (peut être un talbeau vide)
 * @apiParam (BODY) {Object} map Carte de la série (position easy-vue-leaflet : {lat, lng, zoom} )
 * 
 * @apiSuccess {Serie} serie Nouvelles informations de la série (id, nom, descr, ville, dist, nb_photos, created_at)
 * @apiError 404 L'id ne correspond pas à une série existante
 * @apiError 401 Authentification impossible ou la série n'appartient pas à l'utilisateur
 * @apiError 500 Erreur interne
 * 
 */
app.put('/series/:id/', (req, res) => {
    if(!req.authUser) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    const { id } = req.params;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        res.status(404).json({status: 404, msg: 'Serie Not Found'});
        return;
    }
    const { rules } = req.body;
    if(!rules.ville
        || !rules.dist || !Number(rules.dist) || !rules.map
        || !rules.ville || !rules.nom || !rules.descr
        || !rules.map.lat || !rules.map.lng || !rules.map.zoom
        || !Number(rules.map.lat) || !Number(rules.map.lng) || !Number(rules.map.zoom)
    ) {
        res.status(400).json({status: 400, msg: 'Bad Request'});
        return;
    }

    Serie.findById(id, (err, serie) => {
        if(err) throw err;
        if(!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }

        if(req.authUser.id !== serie.user) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }

        serie.ville = rules.ville;
        serie.nom = rules.nom;
        serie.descr = rules.descr;
        serie.dist = rules.dist;
        serie.map.lat = rules.map.lat;
        serie.map.lng = rules.map.lng;
        serie.map.zoom = rules.map.zoom;
        serie.save()
            .then((saved) => {
                res.status(200).json({
                    serie: {
                        id: req.body,
                        ville: saved.ville,
                        nom : saved.nom,
                        descr: saved.descr,
                        dist: saved.dist,
                        map: {
                            lat: saved.map.lat,
                            lng: saved.map.lng,
                        },
                        zoom: saved.map.zoom,
                    }
                });
            })
            .catch((error) => {
                throw error;
            });
    });
});

/**
 * Supprime la serie
 * URI :
 *   - id : id de la série
 *
 * @api {delete} /serie/:id Supprimer une série
 * @apiName DeleteSerei
 * @apiGroup Series
 * 
 * @apiHeader (Authorization) {bearer} token token obtenu lors de l'authentification
 * 
 * @apiParam (URI) {UUID} id Id de la série à supprimer
 * 
 * @apiSuccess {Serie} serie Information de la série supprimée et sa date de suppression
 * @apiError 404 L'id ne correspond pas à une série existante
 * @apiError 401 Authentification impossible ou la série n'appartient pas à l'utilisateur
 * @apiError 500 Erreur interne
 * 
 */
app.delete('/series/:id/', (req, res) => {
    const { id } = req.params;
    if(!req.authUser) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }

    Serie.findById(id, (err, serie) => {
        if(err) throw err;
        if(!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }
        // vérification du propriétaire de la série
        if(serie.user !== req.authUser.id) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }

        serie.remove((err2, deleted) => {
            if(err2) throw err2;
            res.status(200).json({
                serie: {
                    id: serie._id,
                    ville: serie.ville,
                    dist: serie.dist,
                    nom: serie.nom,
                    descr: serie.descr,
                },
                deleted_at: new Date(),
            });
        });
    });
});

/**
 * Ajoute une photo à la galerie de l'utilisateur
 * Body :
 *   - photo: {
 *       position
 *       desc
 *       url
 *     }
 * @api {post} /photos Création d'une photo
 * @apiName CreatePhoto
 * @apiGroup Photos
 * 
 * @apiHeader (Authorization) {bearer} token token obtenu lors de l'authentification
 * 
 * @apiParam (BODY) {String} url Url de la photo
 * @apiParam (BODY) {String} desc Description de la photo
 * @apiParam (BODY) {Object} position Position de la photo (position : {lat, lng} )
 * 
 * @apiSuccess (201) {Photo} photo Information de la nouvelle photo
 * @apiError 401 Authentification impossible
 * @apiError 500 Erreur interne
 */
app.post("/photos", (req, res) => {
    // application du middleware
    if(!req.authUser) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    const { photo } = req.body;
    if(!photo.url || !photo.position || !photo.position.lng || !photo.position.lat || !photo.desc) {
        res.status(400).json({status: 400, msg: 'Bad Request'});
        return;
    }

    const newPhoto = new Photo({
        position : {
            lat: photo.position.lat,
            lng: photo.position.lng
        },
        desc: photo.desc,
        url: photo.url,
        user: req.authUser._id,
        created_at : new Date()
    });
    newPhoto.save().then((photo) => {
        res.status(201).json(photo);
    }).catch((err) =>{
        throw err;
    });
});

/**
 * Supprime une photo de la galerie
 * Query :
 *   - id : id de la photo
 * 
 * @api {delete} /photos/:id Supprimer une photo
 * @apiName DeletePhoto
 * @apiGroup Photos
 * 
 * @apiHeader (Authorization) {bearer} token token obtenu lors de l'authentification
 * 
 * @apiParam (URI) {UUID} id Id de la photo à supprimer
 * 
 * @apiSuccess {Photo} photo Information de la photo supprimée et sa date de suppression
 * @apiError 404 L'id ne correspond pas à une photo existante
 * @apiError 401 Authentification impossible ou la photo n'appartient pas à l'utilisateur
 * @apiError 500 Erreur interne
 */
app.delete("/photos/:id", (req, res) => {
    // application du middleware
    if(!req.authUser) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    const { id } = req.params;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        res.status(404).json({status: 404, msg: 'Serie Not Found'});
        return;
    }

    Photo.findById(id, (err, photo) => {
        if(err) throw err;
        if(!photo) {
            res.status(404).json({status: 404, msg: 'Photo Not Found'});
            return;
        }
        if(photo.user != req.authUser._id) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }

        Serie.updateMany({
            photos: photo._id,
        }, {
            $pull: {photos: photo._id},
        }, (err2, serieDeleteResult) => {
            if(err2) throw err2;

            photo.remove((err3, document) => {
                res.status(200).json({
                    photo: {
                        id: photo._id,
                        user: photo.user,
                        position: photo.position,
                        url: photo.url,
                        desc: photo.desc,
                    },
                    delete_at: new Date(),
                })
            });
        });
    });
});

/**
 * @api {put} /serie/:id Modifier une photo
 * @apiName UpdatePhoto
 * @apiGroup Photos
 * 
 * @apiHeader (Authorization) {bearer} token token obtenu lors de l'authentification
 * 
 * @apiParam (URI) {UUID} id Id de la photo à mettre à jour
 * @apiParam (BODY) {String} desc Description de la photo
 * @apiParam (BODY) {String} url Url de la photo
 * @apiParam (BODY) {Object} position Position de la photo (position : {lat, lng} )
 * 
 * @apiSuccess {Photo} serie Nouvelle informations de la photo
 * @apiError 404 L'id ne correspond pas à une photo existante
 * @apiError 401 Authentification impossible ou la photo n'appartient pas à l'utilisateur
 * @apiError 500 Erreur interne
 */
app.put("/photos/:id", (req, res) => {
    // application du middleware
    if(!req.authUser) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    const { id } = req.params;
    const { position }  = req.body
    Photo.findById(id, (err, photo) => {
        if(err) throw err;
        if(!photo) {
            res.status(404).json({status: 404, msg: 'Photo Not Found'});
            return;
        }
        // vérification du propriétaire de l'image
        if(photo.user !== req.authUser.id) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }
        photo.position.lat = position.lat;
        photo.position.lng = position.lng;
        photo.save()
            .then((saved) => {
                res.status(200).json({
                    photo: {
                        position: {
                            lat: saved.position.lat,
                            lng: saved.position.lng,
                        },
                        desc: saved.desc,
                        url: saved.url,
                    }
                });
            })
            .catch((error) => {
                throw error;
            });

    });
});

/**
 * Récupère les photos d'une série
 * 
 * @api {get} /series/:id/photos/ Récupères les photos d'une série
 * @apiName getPhotosOnSerie
 * @apiGroup Series
 * 
 * @apiHeader (Authorization) {bearer} token token de l'utilisateur 
 * 
 * @apiParam (URI) {UUID} idSerie Id de la série que l'utilisateur veut récupérer
 * 
 * @apiSuccess {Photos} Photos Photos de la série
 * 
 * @apiError 401 L'utilisateur n'est pas authentifié
 * @apiError 400 idSerie est absente dans la requête
 * @apiError 404 idSerie est incorrect
 * @apiError 500 Erreur interne
 */
app.get("/series/:id/photos", (req, res) => {
    // application du middleware
    if(!req.authUser) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    const { id } = req.params;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        res.status(404).json({status: 404, msg: 'Serie Not Found'});
        return;
    }

    Serie.findById(id, (err, serie) => {
        if(err) throw err;
        if(!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }
        if(serie.user != req.authUser._id) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }

        Photo.find({ _id: serie.photos }, (error, photos) => {
            if(error) throw error;
            res.status(200).json({
                serie: {
                    id: serie._id,
                    photos: photos.map((photo) => ({
                        id: photo._id,
                        position: photo.position,
                        desc: photo.desc,
                        url: photo.url,
                    })),
                },
            });
        });
    });
});

/**
 * Ajout une photo à la serie
 * @api {put} /series/:idSerie/photos/:idPhoto Ajoute une photo dans une série
 * @apiName AddPhotoOnSerie
 * @apiGroup Series
 * 
 * @apiHeader (Authorization) {bearer} token token de l'utilisateur 
 * 
 * @apiParam (URI) {UUID} idSerie Id de la série que l'utilisateur veut modifier
 * @apiParam (URI) {UUID} idPhoto Id de la photo que l'utilisateur veut ajouter
 * 
 * @apiSuccess {Serie} Serie La série modifié
 * 
 * @apiError 401 L'utilisateur n'est pas authentifié
 * @apiError 400 idSerie ou idPhoto absente dans la requête
 * @apiError 404 idSerie ou idPhoto est incorrect
 * @apiError 500 Erreur interne
 */

app.put("/series/:id/photos/:idPhoto", (req, res) => {
    if(!req.authUser) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    const { id, idPhoto } = req.params;

    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        res.status(404).json({status: 404, msg: 'Serie Not Found'});
        return;
    }

    if(!idPhoto) {
        res.status(400).json({ status: 400, msg: 'Bad Request' });
        return;
    }
    if(!idPhoto.match(/^[0-9a-fA-F]{24}$/)){
        res.status(404).json({status: 404, msg: 'Photo Not Found'});
        return;
    }

    // application du middleware

    Serie.findById(id, (err, serie) => {
        if(err) throw err;
        if(!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }

        if(serie.user != req.authUser._id) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }

        Photo.findById(idPhoto, (error, photo) => {
            if(error) throw error;
            if(!photo) {
                res.status(404).json({status: 404, msg: 'Photo Not Found'});
                return;
            }

            if(photo.user != req.authUser._id) {
                res.status(401).json({status: 401, msg: 'Unauthorized'});
                return;
            }

            if(!serie.photos.includes(idPhoto)) {
                serie.photos.push(idPhoto);
            }

            serie.save()
                .then((saved) => {
                    Photo.find({ _id: saved.photos }, (error, photos) => {
                        if(error) throw error;

                        res.status(200).json({
                            serie: {
                                id: saved._id,
                                photos: photos.map((photo) => ({
                                    id: photo._id,
                                    position: photo.position,
                                    desc: photo.desc,
                                    url: photo.url,
                                })),
                            },
                        });
                    });
                })
                .catch((err2) => {
                    throw err2;
                });
        })

    });
});

/**
 * Eleve une photo de la serie
 * 
 * @api {delete} /series/:idSerie/photos/:idPhoto Supprime une photo dans une série
 * @apiName DeletePhotoOnSerie
 * @apiGroup Series
 * 
 * @apiHeader (Authorization) {bearer} token token de l'utilisateur 
 * 
 * @apiParam (URI) {UUID} idSerie Id de la série que l'utilisateur veut modifier
 * @apiParam (URI) {UUID} idPhoto Id de la photo que l'utilisateur veut supprimer
 * 
 * @apiSuccess {Serie} Serie La série modifié
 * 
 * @apiError 401 L'utilisateur n'est pas authentifié
 * @apiError 400 idSerie ou idPhoto absente dans la requête
 * @apiError 404 idSerie ou idPhoto est incorrect
 * @apiError 500 Erreur interne
 * 
 */
app.delete('/series/:idSerie/photos/:idPhoto', (req, res) => {
    if(!req.authUser) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }

    const { idSerie, idPhoto } = req.params;
    if(!idPhoto || !idSerie) {
        res.status(400).json({status: 400, msg: 'Bad Request'});
    }

    if(!idSerie.match(/^[0-9a-fA-F]{24}$/) || !idPhoto.match(/^[0-9a-fA-F]{24}$/)){
        res.status(404).json({status: 404, msg: 'Serie Not Found'});
        return;
    }

    Serie.findById(idSerie, (err, serie) => {
        if(err) throw err;
        if(!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }
        if(serie.user != req.authUser._id) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }

        const indexOfPhoto = serie.photos.indexOf(idPhoto);
        if(indexOfPhoto < 0) {
            res.status(404).json({status: 404, msg: 'Photo Not Found'});
            return;
        }

        serie.photos.splice(indexOfPhoto, 1);

        serie.save()
            .then((saved) => {
                Photo.find({ _id: saved.photos }, (error, photos) => {
                    if(error) throw error;

                    res.status(200).json({
                        serie: {
                            id: saved._id,
                            photos: photos.map((photo) => ({
                                id: photo._id,
                                position: photo.position,
                                desc: photo.desc,
                                url: photo.url,
                            })),
                        },
                    });
                });
            })
            .catch((error) => {
                throw error;
            });
    });
});

/**
 * Permet de récupérer les photos de l'utilisateur
 * 
 * @api {get} /photos Photos de l'utilisateur
 * @apiName getPhotos
 * @apiGroup Photos
 * 
 * @apiHeader (Authorization) {bearer} token token de l'utilisateur 
 * 
 * @apiParam (QUERY) {String} limit valeur pour limité la récupération des photos
 * @apiParam (QUERY) {String} offset valeur pour limité la récupération des photos
 * 
 * @apiSuccess {Photos} Photos Photos de l'utilisateur
 * 
 * @apiError 401 L'utilisateur n'est pas authentifié
 * @apiError 500 Erreur interne
 */

app.get('/photos', (req, res) => {
    if(!req.authUser) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }

    // gestion de la pagination
    const pagination = {
        offset: 0,
        size: 10,
    }
    const {offset, size} = req.query
    if(offset && Number(offset) && offset >= 0) pagination.offset = Number(offset);
    if(size && Number(size) && size >= 1 && size <= 50) pagination.size = Number(size);

    Photo.count({user: req.authUser._id}).exec((errCount, count) => {
        if(errCount) throw errCount;
        
        Photo.find({user: req.authUser._id})
        .sort({created_at: 'desc'})
        .skip(pagination.offset)
        .limit(pagination.size)
        .exec((err, photos) => {
            if(err) throw err;
            res.status(200).json({
                total: count,
                photos: photos.map(p => ({
                    id: p._id,
                    position: p.position,
                    url: p.url,
                    desc: p.desc,
                })),
            });
        });
    })
});

/**
 * Permet de récupérer une photo selon l'id
 * 
 * @api {get} /photos/:id Photo de l'utilisateur selon un id
 * @apiName getPhoto
 * @apiGroup Photos
 * 
 * @apiHeader (Authorization) {bearer} token token de l'utilisateur 
 * 
 * @apiParam (URI) {UUID} id de la photo
 * 
 * @apiSuccess {Photo} Photo Photo de l'utilisateur qu'il veut modifier
 * 
 * @apiError 401 L'utilisateur n'est pas authentifié
 * @apiError 404 l'id est incorrect
 * @apiError 500 Erreur interne
 */

app.get('/photos/:id', (req, res) => {
    if (!req.authUser) {
        res.status(401).json({ status: 401, msg: 'Unauthorized' });
        return;
    }
    const { id } = req.params;
    Photo.findById(id, (err, photo) => {
        if (err) throw err;
        if (!photo) {
            return;
        }
        if (photo.user != req.authUser._id) {
            res.status(401).json({ status: 401, msg: 'Unauthorized' });
            return;
        }
        res.status(200).json({
            photo: {
                position: {
                    lat: photo.position.lat,
                    lng: photo.position.lng
                },
                url: photo.url,
                desc: photo.desc,
            }
        });
    });
});

/**
 * Permet de modifier une photo selon l'id
 * 
 * @api {put} /photos/:id Photo de l'utilisateur selon un id
 * @apiName savePhoto
 * @apiGroup Photos
 * 
 * @apiHeader (Authorization) {bearer} token token de l'utilisateur 
 * 
 * @apiParam (URI) {UUID} id de la photo
 * @apiParam (BODY) {Photo} Photo Données de la photo a sauvegarder
 * 
 * @apiSuccess {Photo} Photo Photo de l'utilisateur a modifié
 * 
 * @apiError 401 L'utilisateur n'est pas authentifié
 * @apiError 404 l'id est incorrect
 * @apiError 500 Erreur interne
 */

app.put('/photos/:id', (req, res) => {
    //TODO filtrer les données de l'utilisateur
    if (!req.authUser) {
        res.status(401).json({ status: 401, msg: 'Unauthorized' });
        return;
    }
    const { id } = req.params;
    const { newphoto } = req.body;
    
    Photo.findById(id, (err, photo) => {
        if (err) throw err;
        if (!photo) {
            return;
        }
        if (photo.user != req.authUser._id) {
            res.status(401).json({ status: 401, msg: 'Unauthorized' });
            return;
        }
        photo.position.lat = newphoto.position.lat;
        photo.position.lng = newphoto.position.lng;
        photo.desc =  newphoto.desc;

        photo.save()
            .then((saved) => {
                res.status(200).json({
                    photo: {
                        position: {
                            lat: saved.position.lat,
                            lng: saved.position.lng
                        },
                        url: saved.url,
                        desc: saved.desc,
                    }
                });
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
    // console.log(error.message);
    res.status(500).json({
        status: 500,
        msg: 'Internal Server Error',
    });
});

/* Démarrage de l'api */
app.listen(8080, () => {
    console.log('api backoffice is running !');
});
