const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const cors = require('cors');
const parser = require('body-parser');

// create app
const app = express();

/* Models */ 
const Partie = require('./models/Partie');
const Serie = require('./models/Serie');

app.use(parser.json());
app.use(cors());

// connexion à la base de donnée mongo
mongoose.connect("mongodb://databaseGeoQuizz/Geoquizz", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.get('/', (req, res) => {
    res.json({app: 'GeoQuizz'});
});

/**
 * Permet de récupérer la liste des séries
 * 
 * Query:
 *  limit: nombre d'éléments à recupérer (optionel, max 25)
 *  offset: (optionel, 0 par défault)
 */
app.get('/series', (req, res) => {
    let {limit, offset} = req.query;

    if(!limit || !Number(limit) || limit > 25) limit = 25;
    if(!offset || !Number(offset) || offset < 0) offset = 0;


    // Compte le nombre totals de séries
    Serie.count((err, count) => {
        if(err) throw err;
        //récupère les séries
        Serie.find().limit(Number(limit)).skip(Number(offset)).exec()
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
 * id de la partie
 * token de la partie
 */
app.post("/parties", (req, res) => {
    let { username } = req.body;
    if(!username) {
        res.status(400).json({ status: 400, msg: 'Bad Request' });
        return;
    }

    // récupération de la série
    const idSerie = "5e6f900f5eae5800060e8d10";
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
        for(let i = 0; (i < nbPhotos && serie.photos.length > 0); i++) {
            // on verifie si la serie a encore des photos
            
            const index = Math.floor(Math.random() * serie.photos.length);
            const photo = serie.photos.splice(index, 1).shift();
            nouvellePartie.photos.push(photo);
            console.log(serie.photos.length);
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

app.listen(8080, () => {
    console.log('api player is running !');
});
