const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const cors = require('cors');
const parser = require('body-parser');

// create app
const app = express();

app.use(cors());
app.use(parser.json());

// connexion à la base de donnée mongo
mongoose.connect("mongodb://databaseGeoQuizz/Geoquizz", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

/* Models */ 
const Partie = require('./models/Partie');
const Serie = require('./models/Serie');
const Photo = require('./models/Photo');

/* Routes */
app.get('/', (req, res) => {
    res.json({app: 'GeoQuizz'});
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
        Serie.find({ "photos.0": { "$exists": true } }).limit(Number(limit)).skip(Number(offset)).exec()
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
 * Permet de créée une nouvelle partie
 * 
 * Body :
 * - username : nom du joueur
 * 
 * @return 
 *      id de la partie
 *      token de la partie
 */
app.post("/parties", (req, res) => {
    const { username } = req.body;
    if(!username) {
        res.status(400).json({ status: 400, msg: 'Bad Request' });
        return;
    }
    const { idSerie } = req.body;
    // récupération de la série
    Serie.findById(idSerie, (err, serie) => {
        if(err) throw err;
        if(!serie) {
            res.status(404).json({ status: 404, msg: 'Serie not found' });
            return;
        }

        // token de vérification de la partie
        const token = crypto.randomBytes(48).toString('hex');

        // initialidation de la partie
        const nouvellePartie = new Partie({
            token,
            serie: serie._id,
            end: false,
            score: 0,
            username,
            created_at: new Date(),
            nb_photos: 0,
            photos: [],
        });

        // récupération de n photos dans la séries
        const nbPhotos = 10;
        const photosIds = [];
        for(let i = 0; (i < nbPhotos && serie.photos.length > 0); i++) {
            // on verifie si la serie a encore des photos
            
            const index = Math.floor(Math.random() * serie.photos.length);
            const photoId = serie.photos.splice(index, 1).shift();

            nouvellePartie.photos.push(photoId);
        }


        nouvellePartie.nb_photos = nouvellePartie.photos.length;
    
        // enregistrement de la partie
        nouvellePartie.save()
            .then((partie) => {
                res.status(201).json({
                    partie: partie._id,
                    token: token,
                })
            })
            .catch((error) => {
                throw error;
            });
        
    });
});


/**
 * Permet de mettre à jour les données de la partie
 * (notamment lorsqu'elle est terminée)
 * 
 *  Body :
 * - score : nouveau score
 * - end : indique que la partie est terminée
 * 
 * @return 
 *      nouvelles infos de la partie
 */
app.put('/parties/:id', (req, res) => {
    const idPartie = req.params.id;
    if(!idPartie) {
        res.status(400).json({status: 400, msg: 'Bad Request'});
        return;
    }

    Partie.findById(idPartie, (err, partie) => {
        if(err) throw err;

        if(!partie) {
            res.status(404).json({status: 404, msg: 'Partie not found'});
            return;
        }

        if(!req.headers.authorization) {
            res.status(401).json({status: 401, msg: 'Not Autorized'});
            return;
        }
        
        const token = req.headers.authorization.split(' ')[1];
        if(!token || partie.token !== token) {
            res.status(401).json({status: 401, msg: 'Not Autorized'});
            return;
        }

        const {end, score} = req.body;
        if(isNaN(score)) {
            res.status(400).json({status: 400, msg: 'Bad Request'});
            return;
        }

        partie.end = end;
        partie.score = score;

        partie.save()
            .then((saved) => {
                return res.status(200).json({
                    partie: {
                        id: partie._id,
                        username: partie.username,
                        end: partie.end,
                        score: partie.score,
                    }
                });
            })
            .catch((error) => {
                throw error;
            })
    });
});

/**
 * Permet de récupérer les photos d'une partie
 * 
 * Query :
 * - id : id de la partie
 * 
 * Authorization : 
 * - token: token de la partie
 * 
 * @return 
 *      liste des photos d'une partie
 */
app.get('/parties/:id/photos', (req, res) => {
    const idPartie = req.params.id;
    if(!idPartie) {
        res.status(400).json({status: 400, msg: 'Bad Request'});
        return;
    }

    Partie.findById(idPartie, (err, partie) => {
        if(err) throw err;

        if(!partie) {
            res.status(404).json({status: 404, msg: 'Partie not found'});
            return;
        }

        if(!req.headers.authorization) {
            res.status(401).json({status: 401, msg: 'Not Autorized'});
            return;
        }
        
        const token = req.headers.authorization.split(' ')[1];
        if(!token || partie.token !== token) {
            res.status(401).json({status: 401, msg: 'Not Autorized'});
            return;
        }

        Photo.find({
            "_id": partie.photos,
        }, (err, photos) => {
            if(err) throw err;
            if(!photos) {
                res.status(404).json({
                    status: 404,
                    msg: 'Photos not found',
                });
                return;
            }

            res.status(200).json({
                partie: {
                    id: partie._id,
                    nb_photos: partie.nb_photos,
                    photos: photos,
                }
            });
        });
    });
});

/**
 * Permet de récupérer la serie de photo d'une partie
 * 
 * Query :
 * - id : id de la partie
 * 
 * Authorization : 
 * - token: token de la partie
 * 
 * @return 
 *      serie de la partie
 */
app.get('/parties/:id/series', (req, res) => {
    const idPartie = req.params.id;
    if(!idPartie) {
        res.status(400).json({status: 400, msg: 'Bad Request'});
        return;
    }

    Partie.findById(idPartie, (err, partie) => {
        if(err) throw err;

        if(!partie) {
            res.status(404).json({status: 404, msg: 'Partie not found'});
            return;
        }

        if(!req.headers.authorization) {
            res.status(401).json({status: 401, msg: 'Not Autorized'});
            return;
        }
        
        const token = req.headers.authorization.split(' ')[1];
        if(!token || partie.token !== token) {
            res.status(401).json({status: 401, msg: 'Not Autorized'});
            return;
        }

        const idSerie = partie.serie;
        Serie.findById(idSerie, (err, serie) => {
            if(err) throw err;
            if(!serie) {
                res.status(404).json({status: 404, msg: 'Serie not found'});
                return;
            }

            res.status(200).json({
                serie: {
                    id: serie._id,
                    dist: serie.dist,
                    map: serie.map,
                }
            });
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


/* Démarrage de l'application */
app.listen(8080, () => {
    console.log('api player is running !');
});
