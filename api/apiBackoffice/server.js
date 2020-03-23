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

// connexion à la base de données
mongoose.connect("mongodb://databaseGeoQuizz/Geoquizz", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

/* Models */
const Utilisateur = require('./models/Utilisateur');
const Serie = require('./models/Serie');
const Photo = require('./models/Photo');

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
 *  limit: nombre d'éléments à recupérer (optionel, max 25)
 *  offset: (optionel, 0 par défault)
 * 
 *  @return
 *      la liste des series
 */
app.get('/series', (req, res) => {
    let {limit, offset} = req.query;

    if(!limit || !Number(limit) || limit > 25) limit = 25;
    if(!offset || !Number(offset) || offset < 0) offset = 0;


    // Compte le nombre totals de séries
    Serie.count((err, count) => {
        if(err) throw err;
        //récupère les séries
        Serie.find({ idUtilisateur: req.authUser.id }).limit(Number(limit)).skip(Number(offset)).exec()
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

/** 
 * Permet de récupérer les données d'une série
 * 
 *  Query : 
 *   - id : id de la série
 * @return
 *      les données relatives à la série
*/
app.get('/series/:id', (req, res) => {
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
        if(serie.idUtilisateur !== req.authUser.id) {
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

// TODO créer une serie
/**
 * Permet de créer une série
 */
app.post('/series', (req, res) => {
    if(!req.authUser) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    const serie = req.body;
    console.log(req.body);
    // TODO verifier que serie possède la bonne architecture
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
        idUtilisateur: req.authUser.id,
        create_at : new Date()
    });

    newSerie.save().then((data) => {
        res.status(200).json({data})
    }).catch((err) =>{
        res.status(500).json({err})
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
    

    //TODO verifier que rules possède la bonne architecture
    Serie.findById(id, (err, serie) => {
        if(err) throw err;
        if(!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
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
 * Query : 
 *   - id : id de la série
 * 
 */
app.delete('/series/:id/', (req, res) => {
    const { id } = req.params;
    if(!req.authUser) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }

    //TODO faire en une requete
    Serie.findById(id, (err, serie) => {
        if(err) throw err;
        if(!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }
        if(serie.idUtilisateur !== req.authUser.id) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }
    });
    
    Serie.findByIdAndDelete(id, (err) => {
        if(err) throw err;
        res.status(200).json('deleted');
    });
});

/**
 * Récupère les photos d'une série
 * Query : 
 *   - id : id de la série
 * 
 * @retun
 *      tableau de photos
 */
app.get("/series/:id/photos", (req, res) => {
    const { id } = req.params;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        res.status(404).json({status: 404, msg: 'Serie Not Found'});
        return;
    }

    // application du middleware
    if(!req.authUser && !req.headers.authorization) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    
    Serie.findById(id, (err, serie) => {
        if(err) throw err;
        if(!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }
        if(serie.idUtilisateur !== req.authUser.id) {
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
 * Query : 
 *   - id : id de la série
 * Body : 
 *   - photo: {
 *       position: {
 *         lat
 *         lng
 *       }
 *       url 
 *     }
 */
app.put("/series/:id/photos", (req, res) => {
    setTimeout(()=>{
        if(!req.headers.authorization && !req.authUser) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
        }},2000);

    const { id } = req.params;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        res.status(404).json({status: 404, msg: 'Serie Not Found'});
        return;
    }
    // TODO verifier la structure de l'objet photo
    let photos = req.body.data[0];
    console.log(photos)
    if(!photos) {
        res.status(400).json({ status: 400, msg: 'Bad Request' });
        return;
    }

    // application du middleware

    Serie.findById(id, (err, serie) => {
        if(err) throw err;
        if(!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }
        if(serie.idUtilisateur !== req.authUser.id) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }
        // initialisation de la photo
        const lat = photos.position.lat;
        const lng = photos.position.lng;
        const url = photos.url;
        const newPhoto = new Photo({
            position : {
                lat: lat,
                lng: lng
            },
            url: url,
            create_at : new Date()
        });
        // sauvegarde l'id de la photo
        newPhoto.save().then((photo) => {
            serie.photos.push(photo.id)
             // mise à jour de la serie
            serie.save().then(() => {
                res.status(200).json(photo)
            });
        }).catch((err) =>{
            res.status(500).json({err})
        });

    });  
});

/**
 * Eleve une photo de la serie
 * Query : 
 *   - idSerie : id de la série
 *   - idPhoto : id de la photo
 */
app.delete('/series/:idSerie/photos/:idPhoto', (req, res) => {
    if(!req.headers.authorization && !req.authUser) {
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
        if(serie.idUtilisateur !== req.authUser.id) {
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
