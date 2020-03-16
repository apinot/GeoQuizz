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
    
    const token = crypto.randomBytes(48).toString('hex');

    const nouvellePartie = new Partie({
        token,
        serie: null,
        end: false,
        score: 0,
        username,
        created_at: new Date(),
        photos: [],
    })

    nouvellePartie.save()
        .then((partie) => {
            res.status(201).json({
                partie: partie._id,
                token: token,
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
